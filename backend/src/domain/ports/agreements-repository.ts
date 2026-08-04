import { Acordo } from "../entities/agreement.js";

export interface RepositorioAcordos {
  salvar(acordo: Acordo): Promise<void>;
  buscarPorPropostaId(propostaId: string): Promise<Acordo | null>;
}
