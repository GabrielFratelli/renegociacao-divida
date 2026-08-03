import { TestBed } from "@angular/core/testing";
import { provideHttpClient } from "@angular/common/http";
import {
  HttpTestingController,
  provideHttpClientTesting,
} from "@angular/common/http/testing";
import { PropostasService } from "./propostas.service";
import { ambiente } from "../../../environment";

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
      .simular({
        dividaId: "d-1",
        tipoPagamento: "PARCELADO",
        quantidadeParcelas: 6,
        dataPrimeiroVencimento: "2026-09-01",
      })
      .subscribe((proposta) => {
        expect(proposta.valorParcela).toBe(150);
      });
    const requisicao = http.expectOne(`${ambiente.apiUrl}/propostas/simular`);
    expect(requisicao.request.method).toBe("POST");
    expect(requisicao.request.body.quantidadeParcelas).toBe(6);
    requisicao.flush({
      dividaId: "d-1",
      valorOriginal: 1000,
      desconto: 100,
      valorFinal: 900,
      quantidadeParcelas: 6,
      valorParcela: 150,
      vencimentoPrimeiraParcela: "2026-09-01",
      mensagem: "Proposta válida",
    });
  });
});
