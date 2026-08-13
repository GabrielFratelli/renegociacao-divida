// Adaptador em memória de propostas: salva e busca as simulações por identificador e cliente durante esta execução.

import { Proposta } from "../../domain/entities/proposal.js";
import { RepositorioPropostas } from "../../domain/ports/proposals-repository.js";

export class RepositorioPropostasMemoria implements RepositorioPropostas {
  private readonly propostas: Proposta[];

  constructor(propostas: Proposta[] = []) {
    this.propostas = propostas.map((proposta) => ({ ...proposta }));
  }

  async salvar(proposta: Proposta): Promise<void> {
    this.propostas.push({ ...proposta });
  }

  async buscarPorIdECliente(
    id: string,
    clienteId: string,
  ): Promise<Proposta | null> {
    const proposta = this.propostas.find(
      (item) => item.id === id && item.clienteId === clienteId,
    );
    return proposta ? { ...proposta } : null;
  }
}
