// Caso de uso do aceite: valida proposta e dívida, evita acordos concorrentes, cria o acordo e atualiza a dívida.

import { randomUUID } from "node:crypto";
import { Acordo } from "../../domain/entities/agreement.js";
import { Divida } from "../../domain/entities/debt.js";
import { RepositorioAcordos } from "../../domain/ports/agreements-repository.js";
import { RepositorioDividas } from "../../domain/ports/debts-repository.js";
import { RepositorioPropostas } from "../../domain/ports/proposals-repository.js";

export class PropostaNaoEncontradaError extends Error {
  constructor() {
    super("Proposta não encontrada para este cliente.");
  }
}

export class PropostaExpiradaError extends Error {
  constructor() {
    super("A proposta expirou. Faça uma nova simulação.");
  }
}

export class DividaInelegivelParaAcordoError extends Error {
  constructor() {
    super("A dívida não está mais elegível para esta proposta.");
  }
}

export class AceitarProposta {
  private readonly bloqueiosPorDivida = new Map<string, Promise<void>>();

  constructor(
    private readonly repositorioPropostas: RepositorioPropostas,
    private readonly repositorioAcordos: RepositorioAcordos,
    private readonly repositorioDividas: RepositorioDividas,
    private readonly relogio: () => Date = () => new Date(),
    private readonly gerarId: () => string = randomUUID,
  ) {}

  async executar(clienteId: string, propostaId: string): Promise<Acordo> {
    const proposta = await this.repositorioPropostas.buscarPorIdECliente(
      propostaId,
      clienteId,
    );
    if (!proposta) throw new PropostaNaoEncontradaError();

    return this.executarComBloqueio(proposta.dividaId, async () => {
      const acordoExistente = await this.repositorioAcordos.buscarPorPropostaId(
        proposta.id,
      );
      if (acordoExistente) return acordoExistente;

      const agora = this.relogio();
      if (agora.getTime() >= new Date(proposta.expiraEm).getTime()) {
        throw new PropostaExpiradaError();
      }

      const divida = await this.repositorioDividas.buscarPorIdECliente(
        proposta.dividaId,
        clienteId,
      );
      if (!this.estaElegivel(divida, proposta.valorOriginal)) {
        throw new DividaInelegivelParaAcordoError();
      }

      const novoAcordo: Acordo = {
        id: this.gerarId(),
        propostaId: proposta.id,
        dividaId: proposta.dividaId,
        clienteId,
        valorOriginal: proposta.valorOriginal,
        valorNegociado: proposta.valorFinal,
        saldoDevedor: proposta.valorFinal,
        desconto: proposta.desconto,
        quantidadeParcelas: proposta.quantidadeParcelas,
        valorParcela: proposta.valorParcela,
        valorUltimaParcela: proposta.valorUltimaParcela,
        proximoVencimento: proposta.vencimentoPrimeiraParcela,
        status: "ATIVO",
        aceitoEm: agora.toISOString(),
      };

      await this.repositorioAcordos.salvar(novoAcordo);
      const acordo =
        (await this.repositorioAcordos.buscarPorPropostaId(proposta.id)) ??
        novoAcordo;

      await this.repositorioDividas.atualizar({
        ...divida,
        status: "EM_ACORDO",
        valorNegociado: acordo.valorNegociado,
        saldoDevedor: acordo.saldoDevedor,
        quantidadeParcelas: acordo.quantidadeParcelas,
        valorParcela: acordo.valorParcela,
        valorUltimaParcela: acordo.valorUltimaParcela,
        proximoVencimento: acordo.proximoVencimento,
        acordoId: acordo.id,
      });

      return acordo;
    });
  }

  private estaElegivel(
    divida: Divida | null,
    valorOriginalDaProposta: number,
  ): divida is Divida {
    return Boolean(
      divida &&
      divida.status !== "EM_ACORDO" &&
      !divida.acordoId &&
      this.paraCentavos(divida.valorOriginal) ===
        this.paraCentavos(valorOriginalDaProposta),
    );
  }

  private paraCentavos(valor: number): number {
    return Math.round((valor + Number.EPSILON) * 100);
  }

  private async executarComBloqueio<T>(
    dividaId: string,
    operacao: () => Promise<T>,
  ): Promise<T> {
    const bloqueioAnterior =
      this.bloqueiosPorDivida.get(dividaId) ?? Promise.resolve();
    let liberarBloqueio!: () => void;
    const bloqueioAtual = new Promise<void>((resolver) => {
      liberarBloqueio = resolver;
    });
    const filaAtual = bloqueioAnterior.then(() => bloqueioAtual);
    this.bloqueiosPorDivida.set(dividaId, filaAtual);

    await bloqueioAnterior;
    try {
      return await operacao();
    } finally {
      liberarBloqueio();
      if (this.bloqueiosPorDivida.get(dividaId) === filaAtual) {
        this.bloqueiosPorDivida.delete(dividaId);
      }
    }
  }
}
