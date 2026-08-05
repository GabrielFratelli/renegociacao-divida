import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from "@angular/core";
import { CurrencyPipe, DatePipe } from "@angular/common";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatNativeDateModule } from "@angular/material/core";
import { MatRadioModule } from "@angular/material/radio";
import { MatSelectModule } from "@angular/material/select";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { finalize } from "rxjs";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { Divida } from "../../core/models/debt.model";
import {
  DadosSimulacao,
  PropostaSimulada,
  TipoPagamento,
} from "../../core/models/proposal.model";
import { DividasService } from "../../shared/services/dividas/dividas.service";
import { PropostasService } from "../../shared/services/propostas/propostas.service";

@Component({
  selector: "app-simulador-proposta",
  imports: [
    CurrencyPipe,
    DatePipe,
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatNativeDateModule,
    MatRadioModule,
    MatSelectModule,
    MatProgressSpinnerModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./propostas.component.html",
  styleUrl: "./propostas.component.scss",
})
export class SimuladorPropostaComponent {
  readonly dividas = inject(DividasService);
  private readonly propostas = inject(PropostasService);
  private readonly rota = inject(ActivatedRoute);
  private readonly roteador = inject(Router);
  private readonly construtorFormulario = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  readonly hoje = new Date();
  readonly opcoesParcelas = [2, 3, 4, 6, 8, 10, 12, 18, 24];
  readonly carregando = signal(false);
  readonly aceitando = signal(false);
  readonly erro = signal<string | null>(null);
  readonly erroAceite = signal<string | null>(null);
  readonly confirmandoAceite = signal(false);
  readonly aceiteConcluido = signal(false);
  readonly proposta = signal<PropostaSimulada | null>(null);
  readonly idDivida = signal(this.rota.snapshot.queryParamMap.get("divida"));
  readonly dividaSelecionada = computed<Divida | null>(
    () =>
      this.dividas.dividas().find((divida) => divida.id === this.idDivida()) ??
      null,
  );
  readonly formulario = this.construtorFormulario.nonNullable.group({
    tipoPagamento: ["A_VISTA" as TipoPagamento, Validators.required],
    quantidadeParcelas: [6, [Validators.min(2), Validators.max(24)]],
    dataPrimeiroVencimento: [
      this.adicionarDias(this.hoje, 30),
      Validators.required,
    ],
  });

  constructor() {
    this.rota.queryParamMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((parametros) => {
        this.idDivida.set(parametros.get("divida"));
        this.invalidarProposta();
      });
    this.formulario.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.invalidarProposta());
  }

  simular(): void {
    const divida = this.dividaSelecionada();
    if (!divida || divida.status === "EM_ACORDO" || this.formulario.invalid) {
      if (!divida) this.roteador.navigate(["/dividas"]);
      return;
    }
    this.carregando.set(true);
    this.erro.set(null);
    this.erroAceite.set(null);
    this.confirmandoAceite.set(false);
    const valores = this.formulario.getRawValue();
    const dados: DadosSimulacao = {
      dividaId: divida.id,
      tipoPagamento: valores.tipoPagamento,
      quantidadeParcelas:
        valores.tipoPagamento === "PARCELADO"
          ? valores.quantidadeParcelas
          : undefined,
      dataPrimeiroVencimento: valores.dataPrimeiroVencimento
        .toISOString()
        .slice(0, 10),
    };
    this.propostas
      .simular(dados)
      .pipe(finalize(() => this.carregando.set(false)))
      .subscribe({
        next: (proposta) => this.proposta.set(proposta),
        error: () =>
          this.erro.set(
            "Não foi possível calcular a proposta. Tente novamente.",
          ),
      });
  }

  solicitarAceite(): void {
    if (!this.proposta() || this.aceitando() || this.aceiteConcluido()) return;
    this.erroAceite.set(null);
    this.confirmandoAceite.set(true);
  }

  cancelarAceite(): void {
    if (this.aceitando()) return;
    this.confirmandoAceite.set(false);
    this.erroAceite.set(null);
  }

  aceitarProposta(): void {
    const proposta = this.proposta();
    if (
      !proposta ||
      !this.confirmandoAceite() ||
      this.aceitando() ||
      this.aceiteConcluido()
    )
      return;

    this.aceitando.set(true);
    this.erroAceite.set(null);
    this.formulario.disable({ emitEvent: false });
    this.propostas
      .aceitar(proposta.id)
      .pipe(
        finalize(() => {
          this.aceitando.set(false);
          this.formulario.enable({ emitEvent: false });
        }),
      )
      .subscribe({
        next: () => {
          this.aceiteConcluido.set(true);
          this.dividas.carregar();
          this.roteador.navigate(["/dividas"]);
        },
        error: () =>
          this.erroAceite.set(
            "Não foi possível aceitar a proposta. Ela pode ter expirado; faça uma nova simulação ou tente novamente.",
          ),
      });
  }

  temAjusteNaUltimaParcela(proposta: PropostaSimulada): boolean {
    return (
      proposta.quantidadeParcelas > 1 &&
      Math.abs(proposta.valorUltimaParcela - proposta.valorParcela) >= 0.005
    );
  }

  private invalidarProposta(): void {
    this.proposta.set(null);
    this.confirmandoAceite.set(false);
    this.erroAceite.set(null);
    this.aceiteConcluido.set(false);
  }

  private adicionarDias(data: Date, dias: number): Date {
    const resultado = new Date(data);
    resultado.setDate(resultado.getDate() + dias);
    return resultado;
  }
}
