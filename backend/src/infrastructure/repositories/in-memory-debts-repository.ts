import { Divida } from '../../domain/entities/debt.js';
import { RepositorioDividas } from '../../domain/ports/debts-repository.js';

export class RepositorioDividasMemoria implements RepositorioDividas {
  private readonly dividas: readonly Divida[] = [
    { id: 'div-001', clienteId: 'cliente-001', credor: 'Banco Aurora', descricao: 'Cartão de crédito final 4832', valorOriginal: 1840, vencimento: '2026-05-10', status: 'ATRASADA' },
    { id: 'div-002', clienteId: 'cliente-001', credor: 'Financeira Horizonte', descricao: 'Empréstimo pessoal', valorOriginal: 920.5, vencimento: '2026-07-15', status: 'ATRASADA' },
    { id: 'div-003', clienteId: 'cliente-001', credor: 'Loja Casa Nova', descricao: 'Carnê de compras', valorOriginal: 420, vencimento: '2026-08-20', status: 'A_VENCER' }
  ];

  async listarPorCliente(clienteId: string): Promise<Divida[]> {
    return this.dividas.filter((divida) => divida.clienteId === clienteId);
  }

  async buscarPorIdECliente(id: string, clienteId: string): Promise<Divida | null> {
    return this.dividas.find((divida) => divida.id === id && divida.clienteId === clienteId) ?? null;
  }
}
