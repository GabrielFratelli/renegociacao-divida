import { Divida } from "../../domain/entities/debt.js";
import { RepositorioDividasMemoria } from "../../infrastructure/repositories/in-memory-debts-repository.js";
import { ListarDividas } from "./list-debts.js";

const criarDivida = (id: string, status: Divida["status"]): Divida => ({
  id,
  clienteId: "cliente-001",
  credor: `Credor ${id}`,
  descricao: "Dívida de teste",
  valorOriginal: 100,
  vencimento: "2026-08-20",
  status,
});

describe("ListarDividas", () => {
  it("deve mover as dívidas negociadas para o final da lista", async () => {
    const repositorio = new RepositorioDividasMemoria([
      criarDivida("div-001", "ATRASADA"),
      criarDivida("div-002", "EM_ACORDO"),
      criarDivida("div-003", "A_VENCER"),
      criarDivida("div-004", "EM_ACORDO"),
    ]);
    const casoDeUso = new ListarDividas(repositorio);

    const dividas = await casoDeUso.executar("cliente-001");

    expect(dividas.map((divida) => divida.id)).toEqual([
      "div-001",
      "div-003",
      "div-002",
      "div-004",
    ]);
  });
});
