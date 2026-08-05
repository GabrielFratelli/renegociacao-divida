export type TipoPagamento = "A_VISTA" | "PARCELADO";

export interface DadosSimulacao {
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

export interface Acordo {
  id: string;
  propostaId: string;
  dividaId: string;
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
