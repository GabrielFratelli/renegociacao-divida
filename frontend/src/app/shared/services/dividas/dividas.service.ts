import { HttpClient } from "@angular/common/http";
import { Injectable, inject, signal } from "@angular/core";
import { finalize } from "rxjs";
import { environment } from "../../../environment";
import { IDivida } from "../../../core/models/debt.model";

@Injectable({ providedIn: "root" })
export class DividasService {
  private readonly http = inject(HttpClient);
  readonly dividas = signal<IDivida[]>([]);
  readonly carregando = signal(false);
  readonly erro = signal<string | null>(null);
  readonly solicitado = signal(false);

  carregarDividas(): void {
    this.solicitado.set(true);
    this.carregando.set(true);
    this.erro.set(null);
    this.http
      .get<IDivida[]>(`${environment.apiUrl}/dividas`)
      .pipe(finalize(() => this.carregando.set(false)))
      .subscribe({
        next: (dividas) => this.dividas.set(dividas),
        error: () =>
          this.erro.set(
            "Não foi possível carregar suas dívidas. Tente novamente.",
          ),
      });
  }

  limparConteudoDividas(): void {
    this.dividas.set([]);
    this.carregando.set(false);
    this.erro.set(null);
    this.solicitado.set(false);
  }
}
