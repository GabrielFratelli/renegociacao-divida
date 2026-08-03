export type TipoPagamento = "A_VISTA" | "PARCELADO";

export interface SolicitacaoSimulacao {
  dividaId: string;
  tipoPagamento: TipoPagamento;
  quantidadeParcelas?: number;
  dataPrimeiroVencimento: string;
}

export interface PropostaSimulada {
  dividaId: string;
  valorOriginal: number;
  desconto: number;
  valorFinal: number;
  quantidadeParcelas: number;
  valorParcela: number;
  vencimentoPrimeiraParcela: string;
  mensagem: string;
}
