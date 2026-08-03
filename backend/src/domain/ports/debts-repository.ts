import { Divida } from "../entities/debt.js";

export interface RepositorioDividas {
  listarPorCliente(clienteId: string): Promise<Divida[]>;
  buscarPorIdECliente(id: string, clienteId: string): Promise<Divida | null>;
}
