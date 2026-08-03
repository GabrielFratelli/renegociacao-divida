import { RepositorioDividasMemoria } from "../../infrastructure/repositories/in-memory-debts-repository.js";
import { SimularProposta } from "./simulate-proposal.js";

describe("SimularProposta", () => {
  const casoDeUso = new SimularProposta(new RepositorioDividasMemoria());

  it("deve aplicar 18% de desconto na proposta à vista", async () => {
    const proposta = await casoDeUso.executar("cliente-001", {
      dividaId: "div-001",
      tipoPagamento: "A_VISTA",
      dataPrimeiroVencimento: "2026-09-01",
    });

    expect(proposta.desconto).toBe(331.2);
    expect(proposta.valorFinal).toBe(1508.8);
    expect(proposta.quantidadeParcelas).toBe(1);
  });

  it("deve dividir o valor com desconto para até seis parcelas", async () => {
    const proposta = await casoDeUso.executar("cliente-001", {
      dividaId: "div-002",
      tipoPagamento: "PARCELADO",
      quantidadeParcelas: 4,
      dataPrimeiroVencimento: "2026-09-01",
    });

    expect(proposta.desconto).toBe(73.64);
    expect(proposta.valorParcela).toBe(211.72);
  });
});
