export type StatusDivida = "ATRASADA" | "A_VENCER";

export interface Divida {
  id: string;
  clienteId: string;
  credor: string;
  descricao: string;
  valorOriginal: number;
  vencimento: string;
  status: StatusDivida;
}
