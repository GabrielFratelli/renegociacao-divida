import { randomUUID } from "node:crypto";
import {
  Proposta,
  PropostaSimulada,
  SolicitacaoSimulacao,
} from "../../domain/entities/proposal.js";
import { RepositorioDividas } from "../../domain/ports/debts-repository.js";
import { RepositorioPropostas } from "../../domain/ports/proposals-repository.js";

export class DividaNaoEncontradaError extends Error {
  constructor() {
    super("Dívida não encontrada para este cliente.");
  }
}

export class DividaInelegivelParaSimulacaoError extends Error {
  constructor() {
    super("A dívida já possui um acordo ativo.");
  }
}

export class DataPrimeiroVencimentoInvalidaError extends Error {
  constructor() {
    super("O primeiro vencimento não pode estar no passado.");
  }
}

export class SimularProposta {
  constructor(
    private readonly repositorioDividas: RepositorioDividas,
    private readonly repositorioPropostas: RepositorioPropostas,
    private readonly relogio: () => Date = () => new Date(),
    private readonly gerarId: () => string = randomUUID,
    private readonly validadeEmMilissegundos = 15 * 60 * 1000,
    private readonly fusoHorario = "America/Sao_Paulo",
  ) {}

  async executar(
    clienteId: string,
    solicitacao: SolicitacaoSimulacao,
  ): Promise<PropostaSimulada> {
    const agora = this.relogio();
    const hoje = this.formatarDataLocal(agora);
    if (solicitacao.dataPrimeiroVencimento < hoje) {
      throw new DataPrimeiroVencimentoInvalidaError();
    }

    const divida = await this.repositorioDividas.buscarPorIdECliente(
      solicitacao.dividaId,
      clienteId,
    );
    if (!divida) throw new DividaNaoEncontradaError();
    if (divida.status === "EM_ACORDO" || divida.acordoId) {
      throw new DividaInelegivelParaSimulacaoError();
    }

    const quantidadeParcelas =
      solicitacao.tipoPagamento === "A_VISTA"
        ? 1
        : (solicitacao.quantidadeParcelas ?? 1);
    const percentualDesconto = this.calcularPercentualDesconto(
      solicitacao.tipoPagamento,
      quantidadeParcelas,
    );
    const valorOriginalEmCentavos = this.paraCentavos(divida.valorOriginal);
    const descontoEmCentavos = Math.round(
      valorOriginalEmCentavos * percentualDesconto,
    );
    const valorFinalEmCentavos = valorOriginalEmCentavos - descontoEmCentavos;
    const valorParcelaEmCentavos = Math.round(
      valorFinalEmCentavos / quantidadeParcelas,
    );
    const valorUltimaParcelaEmCentavos =
      valorFinalEmCentavos - valorParcelaEmCentavos * (quantidadeParcelas - 1);
    const proposta: Proposta = {
      id: this.gerarId(),
      clienteId,
      criadaEm: agora.toISOString(),
      expiraEm: new Date(
        agora.getTime() + this.validadeEmMilissegundos,
      ).toISOString(),
      dividaId: divida.id,
      valorOriginal: this.deCentavos(valorOriginalEmCentavos),
      desconto: this.deCentavos(descontoEmCentavos),
      valorFinal: this.deCentavos(valorFinalEmCentavos),
      quantidadeParcelas,
      valorParcela: this.deCentavos(valorParcelaEmCentavos),
      valorUltimaParcela: this.deCentavos(valorUltimaParcelaEmCentavos),
      vencimentoPrimeiraParcela: solicitacao.dataPrimeiroVencimento,
      mensagem:
        solicitacao.tipoPagamento === "A_VISTA"
          ? "Desconto especial para pagamento à vista."
          : `Condição distribuída em ${quantidadeParcelas} parcelas.`,
    };

    await this.repositorioPropostas.salvar(proposta);

    return this.paraResposta(proposta);
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

  private paraCentavos(valor: number): number {
    return Math.round((valor + Number.EPSILON) * 100);
  }

  private deCentavos(valor: number): number {
    return valor / 100;
  }

  private formatarDataLocal(data: Date): string {
    const partes = new Intl.DateTimeFormat("pt-BR", {
      timeZone: this.fusoHorario,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(data);
    const valor = (tipo: Intl.DateTimeFormatPartTypes) =>
      partes.find((parte) => parte.type === tipo)?.value ?? "";

    return `${valor("year")}-${valor("month")}-${valor("day")}`;
  }

  private paraResposta(proposta: Proposta): PropostaSimulada {
    const { clienteId: _, criadaEm: __, ...resposta } = proposta;
    return resposta;
  }
}
