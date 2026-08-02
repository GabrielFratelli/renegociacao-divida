import { Request, Response } from 'express';
import { z } from 'zod';
import { ServicoToken } from '../../domain/ports/token-service.js';

const esquemaLogin = z.object({ email: z.string().email(), senha: z.string().min(6) });

export class ControladorAutenticacao {
  constructor(private readonly servicoToken: ServicoToken) {}

  login = (requisicao: Request, resposta: Response): void => {
    const dados = esquemaLogin.safeParse(requisicao.body);
    if (!dados.success) {
      resposta.status(400).json({ mensagem: 'Dados de acesso inválidos.' });
      return;
    }
    if (dados.data.email !== 'cliente@exemplo.com' || dados.data.senha !== '123456') {
      resposta.status(401).json({ mensagem: 'E-mail ou senha inválidos.' });
      return;
    }
    const usuario = { id: 'cliente-001', nome: 'Gabriel', email: dados.data.email };
    resposta.json({ token: this.servicoToken.gerar(usuario), usuario });
  };
}
