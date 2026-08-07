import { TestBed } from "@angular/core/testing";
import {
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from "@angular/router";
import { AutenticacaoService } from "./services/autenticacao.service";
import { protegerSimulacao } from "./authentication.guard";

describe("protegerSimulacao", () => {
  const autenticacao = {
    autenticado: jest.fn(),
    restaurarSessao: jest.fn(),
  };
  const redirecionamento = {} as UrlTree;
  const roteador = { createUrlTree: jest.fn(() => redirecionamento) };

  beforeEach(() => {
    autenticacao.restaurarSessao.mockClear();
    roteador.createUrlTree.mockClear();
    TestBed.configureTestingModule({
      providers: [
        { provide: AutenticacaoService, useValue: autenticacao },
        { provide: Router, useValue: roteador },
      ],
    });
  });

  const executarGuarda = () =>
    TestBed.runInInjectionContext(() =>
      protegerSimulacao(
        {} as ActivatedRouteSnapshot,
        {} as RouterStateSnapshot,
      ),
    );

  it("permite acesso depois de restaurar uma sessão válida", () => {
    autenticacao.autenticado.mockReturnValue(true);

    expect(executarGuarda()).toBe(true);
    expect(autenticacao.restaurarSessao).toHaveBeenCalledTimes(1);
  });

  it("redireciona para dívidas quando não existe sessão", () => {
    autenticacao.autenticado.mockReturnValue(false);

    expect(executarGuarda()).toBe(redirecionamento);
    expect(roteador.createUrlTree).toHaveBeenCalledWith(["/dividas"]);
  });
});
