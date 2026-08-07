export type TStatusDivida = "ATRASADA" | "A_VENCER" | "EM_ACORDO";

export interface IDivida {
  id: string;
  credor: string;
  descricao: string;
  valorOriginal: number;
  vencimento: string;
  status: TStatusDivida;
  valorNegociado?: number;
  saldoDevedor?: number;
  quantidadeParcelas?: number;
  valorParcela?: number;
  valorUltimaParcela?: number;
  proximoVencimento?: string;
  acordoId?: string;
}
