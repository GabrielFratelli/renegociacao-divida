import { TestBed } from "@angular/core/testing";
import { signal } from "@angular/core";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { ActivatedRoute, Router, convertToParamMap } from "@angular/router";
import { of } from "rxjs";
import { Divida } from "../../core/models/debt.model";
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
  const dividas = { dividas: signal<Divida[]>([divida]) };
  const propostas = { simular: jest.fn() };
  const roteador = { navigate: jest.fn() };
  const parametros = convertToParamMap({ divida: "d-1" });
  const rota = {
    snapshot: { queryParamMap: parametros },
    queryParamMap: of(parametros),
  };

  beforeEach(async () => {
    dividas.dividas.set([divida]);
    propostas.simular.mockClear();
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
    propostas.simular.mockReturnValue(
      of({
        dividaId: "d-1",
        valorOriginal: 1000,
        desconto: 100,
        valorFinal: 900,
        quantidadeParcelas: 1,
        valorParcela: 900,
        vencimentoPrimeiraParcela: "2026-09-01",
        mensagem: "Proposta válida",
      }),
    );
    const fixture = TestBed.createComponent(SimuladorPropostaComponent);
    const componente = fixture.componentInstance;

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
});
