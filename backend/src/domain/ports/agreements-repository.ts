// Porta de persistência que define as operações de acordos exigidas pelos casos de uso, sem escolher um banco.

import { Acordo } from "../entities/agreement.js";

export interface RepositorioAcordos {
  salvar(acordo: Acordo): Promise<void>;
  buscarPorPropostaId(propostaId: string): Promise<Acordo | null>;
}
