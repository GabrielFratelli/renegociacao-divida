import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { Divida } from '../../../../core/models/debt.model';

@Component({
  selector: 'app-cartao-divida',
  imports: [CurrencyPipe, DatePipe, MatCardModule, MatChipsModule, MatButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './cartao-divida.component.html',
  styleUrl: './cartao-divida.component.scss'
})
export class CartaoDividaComponent {
  readonly divida = input.required<Divida>();
  readonly simular = output<Divida>();
}
