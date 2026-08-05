import { signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { ActivatedRoute, Router, convertToParamMap } from "@angular/router";
import { Subject, of, throwError } from "rxjs";
import { Divida } from "../../core/models/debt.model";
import {
  Acordo,
  PropostaSimulada,
} from "../../core/models/proposal.model";
import { DividasService } from "../../shared/services/dividas/dividas.service";
import { PropostasService } from "../../shared/services/propostas/propostas.service";
import { SimuladorPropostaComponent } from "./propostas.component";

describe("SimuladorPropostaComponent", () => {
  const divida: Divida = {
    id: "d-1",
    credor: "Itaú Unibanco",
    descricao: "Cartão",
    valorOriginal: 1000,
    vencimento: "2026-05-10",
    status: "ATRASADA",
  };
  const proposta: PropostaSimulada = {
    id: "p-1",
    dividaId: "d-1",
    valorOriginal: 1000,
    desconto: 100,
    valorFinal: 900,
    quantidadeParcelas: 1,
    valorParcela: 900,
    valorUltimaParcela: 900,
    vencimentoPrimeiraParcela: "2026-09-01",
    expiraEm: "2026-08-03T15:00:00.000Z",
    mensagem: "Proposta válida",
  };
  const acordo: Acordo = {
    id: "a-1",
    propostaId: "p-1",
    dividaId: "d-1",
    valorOriginal: 1000,
    valorNegociado: 900,
    saldoDevedor: 900,
    desconto: 100,
    quantidadeParcelas: 1,
    valorParcela: 900,
    valorUltimaParcela: 900,
    proximoVencimento: "2026-09-01",
    status: "ATIVO",
    aceitoEm: "2026-08-03T12:00:00.000Z",
  };
  const dividas = {
    dividas: signal<Divida[]>([divida]),
    carregar: jest.fn(),
  };
  const propostas = { simular: jest.fn(), aceitar: jest.fn() };
  const roteador = { navigate: jest.fn() };
  const parametros = convertToParamMap({ divida: "d-1" });
  const rota = {
    snapshot: { queryParamMap: parametros },
    queryParamMap: of(parametros),
  };

  beforeEach(async () => {
    dividas.dividas.set([divida]);
    dividas.carregar.mockClear();
    propostas.simular.mockClear();
    propostas.aceitar.mockClear();
    roteador.navigate.mockClear();

    await TestBed.configureTestingModule({
      imports: [SimuladorPropostaComponent, NoopAnimationsModule],
      providers: [
        { provide: DividasService, useValue: dividas },
        { provide: PropostasService, useValue: propostas },
        { provide: ActivatedRoute, useValue: rota },
        { provide: Router, useValue: roteador },
      ],
    }).compileComponents();
  });

  it("solicita uma proposta para a dívida selecionada", () => {
    propostas.simular.mockReturnValue(of(proposta));
    const componente = TestBed.createComponent(
      SimuladorPropostaComponent,
    ).componentInstance;

    componente.simular();

    expect(propostas.simular).toHaveBeenCalledWith(
      expect.objectContaining({
        dividaId: "d-1",
        tipoPagamento: "A_VISTA",
        quantidadeParcelas: undefined,
      }),
    );
    expect(componente.proposta()?.valorFinal).toBe(900);
  });

  it("invalida a proposta simulada quando o formulário muda", () => {
    const componente = TestBed.createComponent(
      SimuladorPropostaComponent,
    ).componentInstance;
    componente.proposta.set(proposta);
    componente.solicitarAceite();

    componente.formulario.controls.quantidadeParcelas.setValue(8);

    expect(componente.proposta()).toBeNull();
    expect(componente.confirmandoAceite()).toBe(false);
  });

  it("exige confirmação, aceita uma única vez e atualiza as dívidas", () => {
    const resposta = new Subject<Acordo>();
    propostas.aceitar.mockReturnValue(resposta.asObservable());
    const componente = TestBed.createComponent(
      SimuladorPropostaComponent,
    ).componentInstance;
    componente.proposta.set(proposta);

    componente.aceitarProposta();
    expect(propostas.aceitar).not.toHaveBeenCalled();

    componente.solicitarAceite();
    componente.aceitarProposta();
    componente.aceitarProposta();

    expect(propostas.aceitar).toHaveBeenCalledTimes(1);
    expect(propostas.aceitar).toHaveBeenCalledWith("p-1");
    expect(componente.aceitando()).toBe(true);

    resposta.next(acordo);
    resposta.complete();

    expect(dividas.carregar).toHaveBeenCalledTimes(1);
    expect(roteador.navigate).toHaveBeenCalledWith(["/dividas"]);
    expect(componente.aceiteConcluido()).toBe(true);

    componente.aceitarProposta();
    expect(propostas.aceitar).toHaveBeenCalledTimes(1);
  });

  it("mantém a confirmação disponível e informa o erro de aceite", () => {
    propostas.aceitar.mockReturnValue(
      throwError(() => new Error("proposta expirada")),
    );
    const componente = TestBed.createComponent(
      SimuladorPropostaComponent,
    ).componentInstance;
    componente.proposta.set(proposta);
    componente.solicitarAceite();

    componente.aceitarProposta();

    expect(componente.aceitando()).toBe(false);
    expect(componente.confirmandoAceite()).toBe(true);
    expect(componente.erroAceite()).toContain("expirado");
    expect(componente.formulario.enabled).toBe(true);
  });
});
