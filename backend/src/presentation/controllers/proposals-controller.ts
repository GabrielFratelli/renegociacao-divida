import { Response } from "express";
import { z } from "zod";
import {
  AceitarProposta,
  DividaInelegivelParaAcordoError,
  PropostaExpiradaError,
  PropostaNaoEncontradaError,
} from "../../application/use-cases/accept-proposal.js";
import {
  DividaInelegivelParaSimulacaoError,
  DividaNaoEncontradaError,
  SimularProposta,
} from "../../application/use-cases/simulate-proposal.js";
import { RequisicaoAutenticada } from "../middlewares/authenticate.js";

const esquemaSimulacao = z
  .object({
    dividaId: z.string().min(1),
    tipoPagamento: z.enum(["A_VISTA", "PARCELADO"]),
    quantidadeParcelas: z.number().int().min(2).max(24).optional(),
    dataPrimeiroVencimento: z.string().date(),
  })
  .superRefine((dados, contexto) => {
    if (dados.tipoPagamento === "PARCELADO" && !dados.quantidadeParcelas) {
      contexto.addIssue({
        code: "custom",
        message: "Informe a quantidade de parcelas.",
        path: ["quantidadeParcelas"],
      });
    }
  });

const esquemaIdentificadorProposta = z.string().min(1);

export class ControladorPropostas {
  constructor(
    private readonly simularProposta: SimularProposta,
    private readonly aceitarProposta: AceitarProposta,
  ) {}

  simular = async (
    requisicao: RequisicaoAutenticada,
    resposta: Response,
  ): Promise<void> => {
    const dados = esquemaSimulacao.safeParse(requisicao.body);
    if (!dados.success) {
      resposta
        .status(400)
        .json({
          mensagem: "Parâmetros de simulação inválidos.",
          detalhes: dados.error.flatten(),
        });
      return;
    }
    try {
      const proposta = await this.simularProposta.executar(
        requisicao.usuario!.id,
        dados.data,
      );
      resposta.json(proposta);
    } catch (erro) {
      if (erro instanceof DividaNaoEncontradaError) {
        resposta.status(404).json({ mensagem: erro.message });
        return;
      }
      if (erro instanceof DividaInelegivelParaSimulacaoError) {
        resposta.status(409).json({ mensagem: erro.message });
        return;
      }
      throw erro;
    }
  };

  aceitar = async (
    requisicao: RequisicaoAutenticada,
    resposta: Response,
  ): Promise<void> => {
    const identificador = esquemaIdentificadorProposta.safeParse(
      requisicao.params.id,
    );
    if (!identificador.success) {
      resposta.status(400).json({ mensagem: "Identificador inválido." });
      return;
    }

    try {
      const acordo = await this.aceitarProposta.executar(
        requisicao.usuario!.id,
        identificador.data,
      );
      const { clienteId: _, ...acordoPublico } = acordo;
      resposta.json(acordoPublico);
    } catch (erro) {
      if (erro instanceof PropostaNaoEncontradaError) {
        resposta.status(404).json({ mensagem: erro.message });
        return;
      }
      if (erro instanceof PropostaExpiradaError) {
        resposta.status(410).json({ mensagem: erro.message });
        return;
      }
      if (erro instanceof DividaInelegivelParaAcordoError) {
        resposta.status(409).json({ mensagem: erro.message });
        return;
      }
      throw erro;
    }
  };
}
