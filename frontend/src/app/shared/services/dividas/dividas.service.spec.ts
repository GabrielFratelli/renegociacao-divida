import { TestBed } from "@angular/core/testing";
import { provideHttpClient } from "@angular/common/http";
import {
  HttpTestingController,
  provideHttpClientTesting,
} from "@angular/common/http/testing";
import { DividasService } from "./dividas.service";
import { ambiente } from "../../../environment";

describe("DividasService", () => {
  let servico: DividasService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    servico = TestBed.inject(DividasService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it("deve carregar e disponibilizar as dívidas com signal", () => {
    servico.carregar();
    const requisicao = http.expectOne(`${ambiente.apiUrl}/dividas`);
    expect(requisicao.request.method).toBe("GET");
    requisicao.flush([
      {
        id: "d-1",
        credor: "Itaú Unibanco",
        descricao: "Cartão",
        valorOriginal: 500,
        vencimento: "2026-05-10",
        status: "ATRASADA",
      },
    ]);

    expect(servico.carregando()).toBe(false);
    expect(servico.dividas()).toHaveLength(1);
    expect(servico.dividas()[0].credor).toBe("Itaú Unibanco");
  });
});
