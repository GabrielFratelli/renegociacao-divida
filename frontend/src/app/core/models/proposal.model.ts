export type TTipoPagamento = "A_VISTA" | "PARCELADO";

export interface IDadosSimulacao {
  dividaId: string;
  tipoPagamento: TTipoPagamento;
  quantidadeParcelas?: number;
  dataPrimeiroVencimento: string;
}

export interface IPropostaSimulada {
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

export interface IAcordo {
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
