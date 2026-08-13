// Porta de segurança que define os dados do usuário autenticado e o contrato para gerar e validar tokens.

export interface UsuarioAutenticado {
  id: string;
  nome: string;
  email: string;
}

export interface ServicoToken {
  gerar(usuario: UsuarioAutenticado): string;
  validar(token: string): UsuarioAutenticado | null;
}
