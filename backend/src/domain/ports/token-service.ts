export interface UsuarioAutenticado {
  id: string;
  nome: string;
  email: string;
}

export interface ServicoToken {
  gerar(usuario: UsuarioAutenticado): string;
  validar(token: string): UsuarioAutenticado | null;
}
