// Porta de persistência que define como salvar e buscar propostas sem acoplar a aplicação a uma implementação.

import { Proposta } from "../entities/proposal.js";

export interface RepositorioPropostas {
  salvar(proposta: Proposta): Promise<void>;
  buscarPorIdECliente(id: string, clienteId: string): Promise<Proposta | null>;
}
