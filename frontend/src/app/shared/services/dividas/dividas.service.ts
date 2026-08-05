import { HttpClient } from "@angular/common/http";
import { Injectable, inject, signal } from "@angular/core";
import { finalize } from "rxjs";
import { ambiente } from "../../../environment";
import { Divida } from "../../../core/models/debt.model";

@Injectable({ providedIn: "root" })
export class DividasService {
  private readonly http = inject(HttpClient);
  readonly dividas = signal<Divida[]>([]);
  readonly carregando = signal(false);
  readonly erro = signal<string | null>(null);
  readonly solicitado = signal(false);

  carregar(): void {
    this.solicitado.set(true);
    this.carregando.set(true);
    this.erro.set(null);
    this.http
      .get<Divida[]>(`${ambiente.apiUrl}/dividas`)
      .pipe(finalize(() => this.carregando.set(false)))
      .subscribe({
        next: (dividas) => this.dividas.set(dividas),
        error: () =>
          this.erro.set(
            "Não foi possível carregar suas dívidas. Tente novamente.",
          ),
      });
  }

  limpar(): void {
    this.dividas.set([]);
    this.carregando.set(false);
    this.erro.set(null);
    this.solicitado.set(false);
  }
}
