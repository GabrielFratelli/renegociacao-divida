// Caso de uso da listagem: busca as dívidas do cliente autenticado e deixa as que estão em acordo no final.

import { Divida } from "../../domain/entities/debt.js";
import { RepositorioDividas } from "../../domain/ports/debts-repository.js";

export class ListarDividas {
  constructor(private readonly repositorioDividas: RepositorioDividas) {}

  async executar(clienteId: string): Promise<Divida[]> {
    const dividas = await this.repositorioDividas.listarPorCliente(clienteId);
    const pendentes = dividas.filter((divida) => divida.status !== "EM_ACORDO");
    const negociadas = dividas.filter(
      (divida) => divida.status === "EM_ACORDO",
    );

    return [...pendentes, ...negociadas];
  }
}
