// Entidade de domínio que representa o acordo criado após o aceite de uma proposta e seus valores de pagamento.

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
