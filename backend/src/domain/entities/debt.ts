// Entidade de domínio que representa uma dívida e os dados acrescentados quando ela passa a ter um acordo.

export type StatusDivida = "ATRASADA" | "A_VENCER" | "EM_ACORDO";

export interface Divida {
  id: string;
  clienteId: string;
  credor: string;
  descricao: string;
  valorOriginal: number;
  vencimento: string;
  status: StatusDivida;
  valorNegociado?: number;
  saldoDevedor?: number;
  quantidadeParcelas?: number;
  valorParcela?: number;
  valorUltimaParcela?: number;
  proximoVencimento?: string;
  acordoId?: string;
}
