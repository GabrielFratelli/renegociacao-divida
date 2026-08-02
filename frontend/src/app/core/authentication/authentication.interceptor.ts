import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AutenticacaoService } from './services/autenticacao.service';

export const interceptorAutenticacao: HttpInterceptorFn = (requisicao, proximo) => {
  const token = inject(AutenticacaoService).token();
  return proximo(token ? requisicao.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : requisicao);
};
