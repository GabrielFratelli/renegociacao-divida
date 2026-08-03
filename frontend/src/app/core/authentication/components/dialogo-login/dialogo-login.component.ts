import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatDialogModule, MatDialogRef } from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { finalize } from "rxjs";
import { AutenticacaoService } from "../../services/autenticacao.service";

@Component({
  selector: "app-dialogo-login",
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./dialogo-login.component.html",
  styleUrl: "./dialogo-login.component.scss",
})
export class DialogoLoginComponent {
  private readonly construtorFormulario = inject(FormBuilder);
  private readonly autenticacao = inject(AutenticacaoService);
  private readonly referencia = inject(MatDialogRef<DialogoLoginComponent>);

  readonly carregando = signal(false);
  readonly erro = signal<string | null>(null);
  readonly formulario = this.construtorFormulario.nonNullable.group({
    email: ["", [Validators.required, Validators.email]],
    senha: ["", [Validators.required]],
  });

  entrar(): void {
    if (this.formulario.invalid) return;
    this.carregando.set(true);
    this.erro.set(null);
    const { email, senha } = this.formulario.getRawValue();
    this.autenticacao
      .autenticar(email, senha)
      .pipe(finalize(() => this.carregando.set(false)))
      .subscribe({
        next: () => this.referencia.close(),
        error: () =>
          this.erro.set(
            "Não foi possível entrar. Confira suas credenciais e tente novamente.",
          ),
      });
  }
}
