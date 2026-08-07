import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AutenticacaoService } from "../services/autenticacao.service";

export const protegerSimulacao: CanActivateFn = () => {
  const autenticacao = inject(AutenticacaoService);
  autenticacao.restaurarSessao();

  return autenticacao.autenticado()
    ? true
    : inject(Router).createUrlTree(["/dividas"]);
};
