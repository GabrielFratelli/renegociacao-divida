import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from "@angular/core";
import { CurrencyPipe, DatePipe } from "@angular/common";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatChipsModule } from "@angular/material/chips";
import { Divida } from "../../../../core/models/debt.model";

@Component({
  selector: "app-cartao-divida",
  imports: [
    CurrencyPipe,
    DatePipe,
    MatCardModule,
    MatChipsModule,
    MatButtonModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./cartao-divida.component.html",
  styleUrl: "./cartao-divida.component.scss",
})
export class CartaoDividaComponent {
  readonly divida = input.required<Divida>();
  readonly simular = output<Divida>();

  emAcordo(): boolean {
    return this.divida().status === "EM_ACORDO";
  }

  valorEmAberto(): number {
    const divida = this.divida();
    if (!this.emAcordo()) return divida.valorOriginal;
    return divida.saldoDevedor ?? divida.valorNegociado ?? divida.valorOriginal;
  }

  temAjusteNaUltimaParcela(): boolean {
    const divida = this.divida();
    return (
      (divida.quantidadeParcelas ?? 0) > 1 &&
      divida.valorParcela !== undefined &&
      divida.valorUltimaParcela !== undefined &&
      Math.abs(divida.valorUltimaParcela - divida.valorParcela) >= 0.005
    );
  }
}
