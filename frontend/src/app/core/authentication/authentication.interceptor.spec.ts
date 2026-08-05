import { provideHttpClient, withInterceptors } from "@angular/common/http";
import {
  HttpTestingController,
  provideHttpClientTesting,
} from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { AutenticacaoService } from "./services/autenticacao.service";
import { interceptorAutenticacao } from "./authentication.interceptor";
import { HttpClient } from "@angular/common/http";

describe("interceptorAutenticacao", () => {
  const autenticacao = { token: jest.fn(), sair: jest.fn() };
  let http: HttpClient;
  let controlador: HttpTestingController;

  beforeEach(() => {
    autenticacao.token.mockReturnValue("token-123");
    autenticacao.sair.mockClear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([interceptorAutenticacao])),
        provideHttpClientTesting(),
        { provide: AutenticacaoService, useValue: autenticacao },
      ],
    });
    http = TestBed.inject(HttpClient);
    controlador = TestBed.inject(HttpTestingController);
  });

  afterEach(() => controlador.verify());

  it("envia o token e encerra a sessão quando uma rota protegida retorna 401", () => {
    http.get("/api/dividas").subscribe({ error: () => undefined });

    const requisicao = controlador.expectOne("/api/dividas");
    expect(requisicao.request.headers.get("Authorization")).toBe(
      "Bearer token-123",
    );
    requisicao.flush({}, { status: 401, statusText: "Unauthorized" });

    expect(autenticacao.sair).toHaveBeenCalledTimes(1);
  });

  it("não encerra uma sessão existente quando o login é recusado", () => {
    http.post("/api/auth/login", {}).subscribe({ error: () => undefined });

    const requisicao = controlador.expectOne("/api/auth/login");
    requisicao.flush({}, { status: 401, statusText: "Unauthorized" });

    expect(autenticacao.sair).not.toHaveBeenCalled();
  });
});
