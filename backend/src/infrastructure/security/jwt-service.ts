import jwt from 'jsonwebtoken';
import { ServicoToken, UsuarioAutenticado } from '../../domain/ports/token-service.js';

export class ServicoJwt implements ServicoToken {
  constructor(private readonly segredo: string) {}

  gerar(usuario: UsuarioAutenticado): string {
    return jwt.sign({ nome: usuario.nome, email: usuario.email }, this.segredo, {
      subject: usuario.id,
      expiresIn: '30m',
      issuer: 'bff-renegociacao'
    });
  }

  validar(token: string): UsuarioAutenticado | null {
    try {
      const conteudo = jwt.verify(token, this.segredo, { issuer: 'bff-renegociacao' });
      if (typeof conteudo === 'string' || !conteudo.sub) return null;
      const { sub, nome, email } = conteudo;
      if (typeof nome !== 'string' || typeof email !== 'string') return null;
      return { id: sub, nome, email };
    } catch {
      return null;
    }
  }
}
