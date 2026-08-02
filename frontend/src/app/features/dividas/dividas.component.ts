import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { AutenticacaoService } from '../../core/authentication/services/autenticacao.service';
import { Divida } from '../../core/models/debt.model';
import { CartaoDividaComponent } from './components/cartao-divida/cartao-divida.component';
import { DividasService } from '../../shared/services/dividas/dividas.service';

@Component({
  selector: 'app-lista-dividas',
  imports: [MatButtonModule, MatProgressSpinnerModule, CartaoDividaComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dividas.component.html',
  styleUrl: './dividas.component.scss'
})
export class ListaDividasComponent {
  readonly dividas = inject(DividasService);
  readonly autenticacao = inject(AutenticacaoService);
  private readonly roteador = inject(Router);

  constructor() {
    effect(() => {
      if (this.autenticacao.autenticado() && !this.dividas.solicitado()) this.dividas.carregar();
    });
  }

  abrirSimulacao(divida: Divida): void {
    this.roteador.navigate(['/simular'], { queryParams: { divida: divida.id } });
  }
}
