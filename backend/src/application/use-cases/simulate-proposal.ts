import {
  PropostaSimulada,
  SolicitacaoSimulacao,
} from "../../domain/entities/proposal.js";
import { RepositorioDividas } from "../../domain/ports/debts-repository.js";

export class DividaNaoEncontradaError extends Error {
  constructor() {
    super("Dívida não encontrada para este cliente.");
  }
}

export class SimularProposta {
  constructor(private readonly repositorioDividas: RepositorioDividas) {}

  async executar(
    clienteId: string,
    solicitacao: SolicitacaoSimulacao,
  ): Promise<PropostaSimulada> {
    const divida = await this.repositorioDividas.buscarPorIdECliente(
      solicitacao.dividaId,
      clienteId,
    );
    if (!divida) throw new DividaNaoEncontradaError();

    const quantidadeParcelas =
      solicitacao.tipoPagamento === "A_VISTA"
        ? 1
        : (solicitacao.quantidadeParcelas ?? 1);
    const percentualDesconto = this.calcularPercentualDesconto(
      solicitacao.tipoPagamento,
      quantidadeParcelas,
    );
    const desconto = this.arredondar(divida.valorOriginal * percentualDesconto);
    const valorFinal = this.arredondar(divida.valorOriginal - desconto);

    return {
      dividaId: divida.id,
      valorOriginal: divida.valorOriginal,
      desconto,
      valorFinal,
      quantidadeParcelas,
      valorParcela: this.arredondar(valorFinal / quantidadeParcelas),
      vencimentoPrimeiraParcela: solicitacao.dataPrimeiroVencimento,
      mensagem:
        solicitacao.tipoPagamento === "A_VISTA"
          ? "Desconto especial para pagamento à vista."
          : `Condição distribuída em ${quantidadeParcelas} parcelas.`,
    };
  }

  private calcularPercentualDesconto(
    tipo: SolicitacaoSimulacao["tipoPagamento"],
    parcelas: number,
  ): number {
    if (tipo === "A_VISTA") return 0.18;
    if (parcelas <= 6) return 0.08;
    if (parcelas <= 12) return 0.04;
    return 0;
  }

  private arredondar(valor: number): number {
    return Math.round((valor + Number.EPSILON) * 100) / 100;
  }
}
