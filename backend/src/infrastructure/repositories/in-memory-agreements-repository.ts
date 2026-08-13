// Adaptador em memória de acordos: salva cópias dos dados e mantém um único acordo para cada proposta nesta execução.

import { Acordo } from "../../domain/entities/agreement.js";
import { RepositorioAcordos } from "../../domain/ports/agreements-repository.js";

export class RepositorioAcordosMemoria implements RepositorioAcordos {
  private readonly acordos: Acordo[];

  constructor(acordos: Acordo[] = []) {
    this.acordos = acordos.map((acordo) => ({ ...acordo }));
  }

  async salvar(acordo: Acordo): Promise<void> {
    if (this.acordos.some((item) => item.propostaId === acordo.propostaId)) {
      return;
    }
    this.acordos.push({ ...acordo });
  }

  async buscarPorPropostaId(propostaId: string): Promise<Acordo | null> {
    const acordo = this.acordos.find((item) => item.propostaId === propostaId);
    return acordo ? { ...acordo } : null;
  }
}
