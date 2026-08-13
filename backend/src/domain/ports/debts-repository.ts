// Porta de persistência que define como os casos de uso listam, localizam e atualizam dívidas de um cliente.

import { Divida } from "../entities/debt.js";

export interface RepositorioDividas {
  listarPorCliente(clienteId: string): Promise<Divida[]>;
  buscarPorIdECliente(id: string, clienteId: string): Promise<Divida | null>;
  atualizar(divida: Divida): Promise<void>;
}
