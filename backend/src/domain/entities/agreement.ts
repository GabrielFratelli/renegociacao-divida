export interface Acordo {
  id: string;
  propostaId: string;
  dividaId: string;
  clienteId: string;
  valorOriginal: number;
  valorNegociado: number;
  saldoDevedor: number;
  desconto: number;
  quantidadeParcelas: number;
  valorParcela: number;
  valorUltimaParcela: number;
  proximoVencimento: string;
  status: "ATIVO";
  aceitoEm: string;
}
