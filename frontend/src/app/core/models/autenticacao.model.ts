export type TSessao = IRespostaLogin;

export interface IRespostaLogin {
  token: string;
  usuario: { id: string; nome: string; email: string };
}
