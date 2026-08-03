import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
} from "@angular/core";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatDialog, MatDialogModule } from "@angular/material/dialog";
import { RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { AutenticacaoService } from "./core/authentication/services/autenticacao.service";
import { DialogoLoginComponent } from "./core/authentication/components/dialogo-login/dialogo-login.component";

@Component({
  selector: "app-root",
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.scss",
})
export class AppComponent implements OnInit {
  readonly autenticacao = inject(AutenticacaoService);
  private readonly dialogo = inject(MatDialog);

  ngOnInit(): void {
    this.autenticacao.restaurarSessao();
    if (!this.autenticacao.autenticado()) this.abrirLogin();
  }

  abrirLogin(): void {
    this.dialogo.open(DialogoLoginComponent, {
      disableClose: true,
      width: "420px",
      autoFocus: "first-tabbable",
    });
  }
}
