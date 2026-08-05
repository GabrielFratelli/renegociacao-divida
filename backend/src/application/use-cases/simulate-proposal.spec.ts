import { RepositorioDividasMemoria } from "../../infrastructure/repositories/in-memory-debts-repository.js";
import { RepositorioPropostasMemoria } from "../../infrastructure/repositories/in-memory-proposals-repository.js";
import {
  DividaInelegivelParaSimulacaoError,
  SimularProposta,
} from "./simulate-proposal.js";

describe("SimularProposta", () => {
  const agora = new Date("2026-08-03T12:00:00.000Z");
  let repositorioPropostas: RepositorioPropostasMemoria;
  let casoDeUso: SimularProposta;

  beforeEach(() => {
    repositorioPropostas = new RepositorioPropostasMemoria();
    casoDeUso = new SimularProposta(
      new RepositorioDividasMemoria(),
      repositorioPropostas,
      () => agora,
      () => "proposta-001",
    );
  });

  it("deve persistir a proposta à vista com identificador e validade", async () => {
    const proposta = await casoDeUso.executar("cliente-001", {
      dividaId: "div-001",
      tipoPagamento: "A_VISTA",
      dataPrimeiroVencimento: "2026-09-01",
    });

    expect(proposta.desconto).toBe(331.2);
    expect(proposta.valorFinal).toBe(1508.8);
    expect(proposta.quantidadeParcelas).toBe(1);
    expect(proposta.valorParcela).toBe(1508.8);
    expect(proposta.valorUltimaParcela).toBe(1508.8);
    expect(proposta.id).toBe("proposta-001");
    expect(proposta.expiraEm).toBe("2026-08-03T12:15:00.000Z");

    const propostaPersistida =
      await repositorioPropostas.buscarPorIdECliente(
        proposta.id,
        "cliente-001",
      );
    expect(propostaPersistida).toMatchObject({
      id: "proposta-001",
      clienteId: "cliente-001",
      criadaEm: "2026-08-03T12:00:00.000Z",
    });
  });

  it("deve ajustar a última parcela para fechar o total em centavos", async () => {
    const proposta = await casoDeUso.executar("cliente-001", {
      dividaId: "div-002",
      tipoPagamento: "PARCELADO",
      quantidadeParcelas: 4,
      dataPrimeiroVencimento: "2026-09-01",
    });

    expect(proposta.desconto).toBe(73.64);
    expect(proposta.valorFinal).toBe(846.86);
    expect(proposta.valorParcela).toBe(211.72);
    expect(proposta.valorUltimaParcela).toBe(211.7);
    expect(
      proposta.valorParcela * (proposta.quantidadeParcelas - 1) +
        proposta.valorUltimaParcela,
    ).toBeCloseTo(proposta.valorFinal, 2);
  });

  it("não deve simular uma dívida que já está em acordo", async () => {
    const casoDeUsoComDividaEmAcordo = new SimularProposta(
      new RepositorioDividasMemoria([
        {
          id: "div-em-acordo",
          clienteId: "cliente-001",
          credor: "Credor",
          descricao: "Dívida negociada",
          valorOriginal: 100,
          vencimento: "2026-07-01",
          status: "EM_ACORDO",
          acordoId: "acordo-existente",
        },
      ]),
      repositorioPropostas,
    );

    await expect(
      casoDeUsoComDividaEmAcordo.executar("cliente-001", {
        dividaId: "div-em-acordo",
        tipoPagamento: "A_VISTA",
        dataPrimeiroVencimento: "2026-09-01",
      }),
    ).rejects.toBeInstanceOf(DividaInelegivelParaSimulacaoError);
  });
});
