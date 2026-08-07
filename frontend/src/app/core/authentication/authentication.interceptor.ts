import { HttpErrorResponse, HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { catchError, throwError } from "rxjs";
import { AutenticacaoService } from "./services/autenticacao.service";

export const interceptorAutenticacao: HttpInterceptorFn = (
  requisicao,
  proximo,
) => {
  const autenticacao = inject(AutenticacaoService);
  const token = autenticacao.token();
  const autenticando = requisicao.url.endsWith("/auth/login");

  return proximo(
    token
      ? requisicao.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : requisicao,
  ).pipe(
    catchError((erro: unknown) => {
      if (
        erro instanceof HttpErrorResponse &&
        erro.status === 401 &&
        !autenticando
      ) {
        autenticacao.sairDaConta();
      }
      return throwError(() => erro);
    }),
  );
};
