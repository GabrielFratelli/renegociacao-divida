import { NextFunction, Request, Response } from "express";
import {
  ServicoToken,
  UsuarioAutenticado,
} from "../../domain/ports/token-service.js";

export interface RequisicaoAutenticada extends Request {
  usuario?: UsuarioAutenticado;
}

export const autenticar =
  (servicoToken: ServicoToken) =>
  (
    requisicao: RequisicaoAutenticada,
    resposta: Response,
    proximo: NextFunction,
  ): void => {
    const cabecalho = requisicao.header("authorization");
    const token = cabecalho?.startsWith("Bearer ") ? cabecalho.slice(7) : null;
    const usuario = token ? servicoToken.validar(token) : null;
    if (!usuario) {
      resposta
        .status(401)
        .json({ mensagem: "Token de acesso inválido ou ausente." });
      return;
    }
    requisicao.usuario = usuario;
    proximo();
  };
