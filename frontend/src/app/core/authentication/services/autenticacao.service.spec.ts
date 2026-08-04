import { provideHttpClient } from "@angular/common/http";
import {
  HttpTestingController,
  provideHttpClientTesting,
} from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { ambiente } from "../../../environment";
import { AutenticacaoService } from "./autenticacao.service";

describe("AutenticacaoService", () => {
  let servico: AutenticacaoService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    servico = TestBed.inject(AutenticacaoService);
    http = TestBed.inject(HttpTestingController);
    sessionStorage.clear();
  });

  afterEach(() => {
    http.verify();
    sessionStorage.clear();
  });

  it("autentica e grava a sessão após o login", () => {
    const resposta = {
      token: "token-123",
      usuario: { id: "u-1", nome: "Gabriel", email: "gabriel@email.com" },
    };

    servico.autenticar("gabriel@email.com", "123456").subscribe();

    const requisicao = http.expectOne(`${ambiente.apiUrl}/auth/login`);
    expect(requisicao.request.method).toBe("POST");
    requisicao.flush(resposta);

    expect(servico.autenticado()).toBe(true);
    expect(servico.usuario()).toEqual(resposta.usuario);
    expect(servico.token()).toBe("token-123");
    expect(sessionStorage.getItem("sessao-renegociacao")).toContain(
      "token-123",
    );
  });

  it("restaura a sessão quando existir dados válidos no storage", () => {
    const sessao = {
      token: "token-recuperado",
      usuario: { id: "u-2", nome: "Ana", email: "ana@email.com" },
    };

    sessionStorage.setItem("sessao-renegociacao", JSON.stringify(sessao));

    servico.restaurarSessao();

    expect(servico.autenticado()).toBe(true);
    expect(servico.usuario()).toEqual(sessao.usuario);
    expect(servico.token()).toBe("token-recuperado");
  });

  it("não altera estado quando não existe sessão armazenada", () => {
    // garante o caminho do early return em restaurarSessao()
    sessionStorage.removeItem("sessao-renegociacao");

    servico.restaurarSessao();

    expect(servico.autenticado()).toBe(false);
    expect(servico.usuario()).toBeNull();
    expect(servico.token()).toBeNull();
  });

  it("remove a sessão inválida do storage quando o JSON não puder ser lido", () => {
    sessionStorage.setItem("sessao-renegociacao", "{json-invalido");

    servico.restaurarSessao();

    expect(servico.autenticado()).toBe(false);
    expect(sessionStorage.getItem("sessao-renegociacao")).toBeNull();
  });

  it("limpa a sessão e remove os dados do storage ao sair", () => {
    sessionStorage.setItem(
      "sessao-renegociacao",
      JSON.stringify({
        token: "token-123",
        usuario: { id: "u-1", nome: "Gabriel", email: "gabriel@email.com" },
      }),
    );
    servico.restaurarSessao();

    servico.sair();

    expect(servico.autenticado()).toBe(false);
    expect(servico.usuario()).toBeNull();
    expect(servico.token()).toBeNull();
    expect(sessionStorage.getItem("sessao-renegociacao")).toBeNull();
  });
});
