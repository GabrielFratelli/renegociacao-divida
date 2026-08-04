import { Divida } from "../../domain/entities/debt.js";
import { RepositorioDividas } from "../../domain/ports/debts-repository.js";

export class RepositorioDividasMemoria implements RepositorioDividas {
  private readonly dividas: Divida[];

  constructor(dividas?: Divida[]) {
    this.dividas = (dividas ?? DIVIDAS_INICIAIS).map((divida) => ({
      ...divida,
    }));
  }

  async listarPorCliente(clienteId: string): Promise<Divida[]> {
    return this.dividas
      .filter((divida) => divida.clienteId === clienteId)
      .map((divida) => ({ ...divida }));
  }

  async buscarPorIdECliente(
    id: string,
    clienteId: string,
  ): Promise<Divida | null> {
    const divida = this.dividas.find(
      (item) => item.id === id && item.clienteId === clienteId,
    );
    return divida ? { ...divida } : null;
  }

  async atualizar(divida: Divida): Promise<void> {
    const indice = this.dividas.findIndex(
      (item) =>
        item.id === divida.id && item.clienteId === divida.clienteId,
    );
    if (indice < 0) return;
    this.dividas[indice] = { ...divida };
  }
}

const DIVIDAS_INICIAIS: readonly Divida[] = [
  {
    id: "div-001",
    clienteId: "cliente-001",
    credor: "Itaú Unibanco",
    descricao: "Cartão de crédito final 4832",
    valorOriginal: 1840,
    vencimento: "2026-05-10",
    status: "ATRASADA",
  },
  {
    id: "div-002",
    clienteId: "cliente-001",
    credor: "Financeira Horizonte",
    descricao: "Empréstimo pessoal",
    valorOriginal: 920.5,
    vencimento: "2026-07-15",
    status: "ATRASADA",
  },
  {
    id: "div-003",
    clienteId: "cliente-001",
    credor: "Loja Casa Nova",
    descricao: "Carnê de compras",
    valorOriginal: 420,
    vencimento: "2026-08-20",
    status: "A_VENCER",
  },
  {
    id: "div-004",
    clienteId: "cliente-001",
    credor: "Banco Inter",
    descricao: "Cartão de crédito final 9271",
    valorOriginal: 2350.75,
    vencimento: "2026-06-22",
    status: "ATRASADA",
  },
  {
    id: "div-005",
    clienteId: "cliente-001",
    credor: "Creditas",
    descricao: "Crédito pessoal",
    valorOriginal: 1375.9,
    vencimento: "2026-08-28",
    status: "A_VENCER",
  },
];
