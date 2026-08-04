import { Divida } from "../../domain/entities/debt.js";
import { Proposta } from "../../domain/entities/proposal.js";
import { RepositorioAcordosMemoria } from "../../infrastructure/repositories/in-memory-agreements-repository.js";
import { RepositorioDividasMemoria } from "../../infrastructure/repositories/in-memory-debts-repository.js";
import { RepositorioPropostasMemoria } from "../../infrastructure/repositories/in-memory-proposals-repository.js";
import {
  AceitarProposta,
  DividaInelegivelParaAcordoError,
  PropostaExpiradaError,
  PropostaNaoEncontradaError,
} from "./accept-proposal.js";

const DIVIDA: Divida = {
  id: "div-001",
  clienteId: "cliente-001",
  credor: "Credor",
  descricao: "Dívida de teste",
  valorOriginal: 920.5,
  vencimento: "2026-07-15",
  status: "ATRASADA",
};

const PROPOSTA: Proposta = {
  id: "proposta-001",
  clienteId: "cliente-001",
  dividaId: "div-001",
  criadaEm: "2026-08-03T11:55:00.000Z",
  expiraEm: "2026-08-03T12:10:00.000Z",
  valorOriginal: 920.5,
  desconto: 73.64,
  valorFinal: 846.86,
  quantidadeParcelas: 4,
  valorParcela: 211.72,
  valorUltimaParcela: 211.7,
  vencimentoPrimeiraParcela: "2026-09-01",
  mensagem: "Condição distribuída em 4 parcelas.",
};

describe("AceitarProposta", () => {
  it("deve criar o acordo e atualizar a dívida sem alterar o valor original", async () => {
    const repositorioDividas = new RepositorioDividasMemoria([DIVIDA]);
    const casoDeUso = new AceitarProposta(
      new RepositorioPropostasMemoria([PROPOSTA]),
      new RepositorioAcordosMemoria(),
      repositorioDividas,
      () => new Date("2026-08-03T12:00:00.000Z"),
      () => "acordo-001",
    );

    const acordo = await casoDeUso.executar(
      "cliente-001",
      "proposta-001",
    );

    expect(acordo).toEqual({
      id: "acordo-001",
      propostaId: "proposta-001",
      dividaId: "div-001",
      clienteId: "cliente-001",
      valorOriginal: 920.5,
      valorNegociado: 846.86,
      saldoDevedor: 846.86,
      desconto: 73.64,
      quantidadeParcelas: 4,
      valorParcela: 211.72,
      valorUltimaParcela: 211.7,
      proximoVencimento: "2026-09-01",
      status: "ATIVO",
      aceitoEm: "2026-08-03T12:00:00.000Z",
    });
    await expect(
      repositorioDividas.buscarPorIdECliente("div-001", "cliente-001"),
    ).resolves.toMatchObject({
      valorOriginal: 920.5,
      status: "EM_ACORDO",
      valorNegociado: 846.86,
      saldoDevedor: 846.86,
      quantidadeParcelas: 4,
      valorParcela: 211.72,
      valorUltimaParcela: 211.7,
      proximoVencimento: "2026-09-01",
      acordoId: "acordo-001",
    });
  });

  it("deve retornar o mesmo acordo em aceites simultâneos da mesma proposta", async () => {
    const gerarId = jest
      .fn<() => string>()
      .mockReturnValueOnce("acordo-001")
      .mockReturnValue("acordo-002");
    const relogio = jest
      .fn<() => Date>()
      .mockReturnValueOnce(new Date("2026-08-03T12:00:00.000Z"))
      .mockReturnValue(new Date("2026-08-03T13:00:00.000Z"));
    const casoDeUso = new AceitarProposta(
      new RepositorioPropostasMemoria([PROPOSTA]),
      new RepositorioAcordosMemoria(),
      new RepositorioDividasMemoria([DIVIDA]),
      relogio,
      gerarId,
    );

    const [primeiro, segundo] = await Promise.all([
      casoDeUso.executar("cliente-001", "proposta-001"),
      casoDeUso.executar("cliente-001", "proposta-001"),
    ]);

    expect(segundo).toEqual(primeiro);
    expect(gerarId).toHaveBeenCalledTimes(1);
    expect(relogio).toHaveBeenCalledTimes(1);
  });

  it("deve aceitar apenas uma entre propostas simultâneas da mesma dívida", async () => {
    const outraProposta: Proposta = {
      ...PROPOSTA,
      id: "proposta-002",
      desconto: 165.69,
      valorFinal: 754.81,
      quantidadeParcelas: 1,
      valorParcela: 754.81,
      valorUltimaParcela: 754.81,
      mensagem: "Desconto especial para pagamento à vista.",
    };
    const repositorioAcordos = new RepositorioAcordosMemoria();
    const repositorioDividas = new RepositorioDividasMemoria([DIVIDA]);
    const gerarId = jest
      .fn<() => string>()
      .mockReturnValueOnce("acordo-001")
      .mockReturnValue("acordo-002");
    const casoDeUso = new AceitarProposta(
      new RepositorioPropostasMemoria([PROPOSTA, outraProposta]),
      repositorioAcordos,
      repositorioDividas,
      () => new Date("2026-08-03T12:00:00.000Z"),
      gerarId,
    );

    const resultados = await Promise.allSettled([
      casoDeUso.executar("cliente-001", "proposta-001"),
      casoDeUso.executar("cliente-001", "proposta-002"),
    ]);
    const aceitos = resultados.filter(
      (resultado) => resultado.status === "fulfilled",
    );
    const recusados = resultados.filter(
      (resultado) => resultado.status === "rejected",
    );

    expect(aceitos).toHaveLength(1);
    expect(recusados).toHaveLength(1);
    expect((recusados[0] as PromiseRejectedResult).reason).toBeInstanceOf(
      DividaInelegivelParaAcordoError,
    );
    expect(gerarId).toHaveBeenCalledTimes(1);
    await expect(
      repositorioDividas.buscarPorIdECliente("div-001", "cliente-001"),
    ).resolves.toMatchObject({
      status: "EM_ACORDO",
      acordoId: "acordo-001",
    });
  });

  it("não deve permitir aceitar a proposta de outro cliente", async () => {
    const casoDeUso = new AceitarProposta(
      new RepositorioPropostasMemoria([PROPOSTA]),
      new RepositorioAcordosMemoria(),
      new RepositorioDividasMemoria([DIVIDA]),
    );

    await expect(
      casoDeUso.executar("cliente-002", "proposta-001"),
    ).rejects.toBeInstanceOf(PropostaNaoEncontradaError);
  });

  it("não deve aceitar uma proposta expirada", async () => {
    const casoDeUso = new AceitarProposta(
      new RepositorioPropostasMemoria([PROPOSTA]),
      new RepositorioAcordosMemoria(),
      new RepositorioDividasMemoria([DIVIDA]),
      () => new Date(PROPOSTA.expiraEm),
    );

    await expect(
      casoDeUso.executar("cliente-001", "proposta-001"),
    ).rejects.toBeInstanceOf(PropostaExpiradaError);
  });

  it("não deve aceitar proposta para uma dívida que já está em acordo", async () => {
    const casoDeUso = new AceitarProposta(
      new RepositorioPropostasMemoria([PROPOSTA]),
      new RepositorioAcordosMemoria(),
      new RepositorioDividasMemoria([
        { ...DIVIDA, status: "EM_ACORDO", acordoId: "outro-acordo" },
      ]),
      () => new Date("2026-08-03T12:00:00.000Z"),
    );

    await expect(
      casoDeUso.executar("cliente-001", "proposta-001"),
    ).rejects.toBeInstanceOf(DividaInelegivelParaAcordoError);
  });
});
