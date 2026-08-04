export type TipoPagamento = "A_VISTA" | "PARCELADO";

export interface SolicitacaoSimulacao {
  dividaId: string;
  tipoPagamento: TipoPagamento;
  quantidadeParcelas?: number;
  dataPrimeiroVencimento: string;
}

export interface PropostaSimulada {
  id: string;
  dividaId: string;
  valorOriginal: number;
  desconto: number;
  valorFinal: number;
  quantidadeParcelas: number;
  valorParcela: number;
  valorUltimaParcela: number;
  vencimentoPrimeiraParcela: string;
  expiraEm: string;
  mensagem: string;
}

export interface Proposta extends PropostaSimulada {
  clienteId: string;
  criadaEm: string;
}
