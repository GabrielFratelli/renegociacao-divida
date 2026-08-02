import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { AutenticacaoService } from '../../core/authentication/services/autenticacao.service';
import { Divida } from '../../core/models/debt.model';
import { DividasService } from '../../shared/services/dividas/dividas.service';
import { ListaDividasComponent } from './dividas.component';

describe('ListaDividasComponent', () => {
  const dividas = {
    dividas: signal<Divida[]>([]),
    carregando: signal(false),
    erro: signal<string | null>(null),
    solicitado: signal(false),
    carregar: jest.fn()
  };
  const autenticacao = { autenticado: signal(false) };
  const roteador = { navigate: jest.fn() };

  beforeEach(async () => {
    dividas.dividas.set([]);
    dividas.carregando.set(false);
    dividas.erro.set(null);
    dividas.solicitado.set(false);
    dividas.carregar.mockClear();
    autenticacao.autenticado.set(false);
    roteador.navigate.mockClear();

    await TestBed.configureTestingModule({
      imports: [ListaDividasComponent, NoopAnimationsModule],
      providers: [
        { provide: DividasService, useValue: dividas },
        { provide: AutenticacaoService, useValue: autenticacao },
        { provide: Router, useValue: roteador }
      ]
    }).compileComponents();
  });

  it('direciona para a simulação da dívida selecionada', () => {
    const componente = TestBed.createComponent(ListaDividasComponent).componentInstance;
    const divida: Divida = { id: 'd-1', credor: 'Banco Aurora', descricao: 'Cartão', valorOriginal: 500, vencimento: '2026-05-10', status: 'ATRASADA' };

    componente.abrirSimulacao(divida);

    expect(roteador.navigate).toHaveBeenCalledWith(['/simular'], { queryParams: { divida: 'd-1' } });
  });
});
