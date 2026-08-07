import { TestBed } from "@angular/core/testing";
import { provideHttpClient } from "@angular/common/http";
import {
  HttpTestingController,
  provideHttpClientTesting,
} from "@angular/common/http/testing";
import { PropostasService } from "./propostas.service";
import { environment } from "../../../environment";

describe("PropostasService", () => {
  let servico: PropostasService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    servico = TestBed.inject(PropostasService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it("deve enviar os parâmetros da simulação ao BFF", () => {
    servico
      .simularDivida({
        dividaId: "d-1",
        tipoPagamento: "PARCELADO",
        quantidadeParcelas: 6,
        dataPrimeiroVencimento: "2026-09-01",
      })
      .subscribe((proposta) => {
        expect(proposta.valorParcela).toBe(150);
      });
    const requisicao = http.expectOne(`${environment.apiUrl}/propostas/simular`);
    expect(requisicao.request.method).toBe("POST");
    expect(requisicao.request.body.quantidadeParcelas).toBe(6);
    requisicao.flush({
      id: "p-1",
      dividaId: "d-1",
      valorOriginal: 1000,
      desconto: 100,
      valorFinal: 900,
      quantidadeParcelas: 6,
      valorParcela: 150,
      valorUltimaParcela: 150,
      vencimentoPrimeiraParcela: "2026-09-01",
      expiraEm: "2026-08-03T15:00:00.000Z",
      mensagem: "Proposta válida",
    });
  });

  it("deve aceitar a proposta pelo identificador", () => {
    servico.aceitarProposta("p-1/especial").subscribe((acordo) => {
      expect(acordo.status).toBe("ATIVO");
      expect(acordo.valorNegociado).toBe(900);
    });

    const requisicao = http.expectOne(
      `${environment.apiUrl}/propostas/p-1%2Fespecial/aceitar`,
    );
    expect(requisicao.request.method).toBe("POST");
    expect(requisicao.request.body).toEqual({});
    requisicao.flush({
      id: "a-1",
      propostaId: "p-1/especial",
      dividaId: "d-1",
      valorOriginal: 1000,
      valorNegociado: 900,
      saldoDevedor: 900,
      desconto: 100,
      quantidadeParcelas: 6,
      valorParcela: 150,
      valorUltimaParcela: 150,
      proximoVencimento: "2026-09-01",
      status: "ATIVO",
      aceitoEm: "2026-08-03T12:00:00.000Z",
    });
  });
});
