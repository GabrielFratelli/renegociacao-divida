import { Divida } from "../../domain/entities/debt.js";
import { RepositorioDividas } from "../../domain/ports/debts-repository.js";

export class ListarDividas {
  constructor(private readonly repositorioDividas: RepositorioDividas) {}

  executar(clienteId: string): Promise<Divida[]> {
    return this.repositorioDividas.listarPorCliente(clienteId);
  }
}
