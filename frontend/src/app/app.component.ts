import {
  ChangeDetectionStrategy,
  Component,
  effect,
  OnInit,
  inject,
} from "@angular/core";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatButtonModule } from "@angular/material/button";
import { MatDialog, MatDialogModule } from "@angular/material/dialog";
import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from "@angular/router";
import { AutenticacaoService } from "./core/authentication/services/autenticacao.service";
import { DialogoLoginComponent } from "./core/authentication/components/dialogo-login/dialogo-login.component";
import { DividasService } from "./shared/services/dividas/dividas.service";

@Component({
  selector: "app-root",
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatDialogModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.scss",
})
export class AppComponent implements OnInit {
  readonly autenticacao = inject(AutenticacaoService);
  private readonly dialogo = inject(MatDialog);
  private readonly dividas = inject(DividasService);
  private readonly rota = inject(Router);

  constructor() {
    effect(() => {
      if (this.autenticacao.autenticado()) return;
      this.dividas.limparConteudoDividas();
      if (this.rota.url.startsWith("/simular")) {
        void this.rota.navigate(["/dividas"]);
      }
    });
  }

  ngOnInit(): void {
    if (!this.autenticacao.autenticado()) this.abrirPopUpLogin();
  }

  abrirPopUpLogin(): void {
    if (this.dialogo.openDialogs.length > 0) return;
    this.dialogo.open(DialogoLoginComponent, {
      disableClose: true,
      width: "460px",
      maxWidth: "calc(100vw - 2rem)",
      autoFocus: "dialog",
    });
  }

  sairDaConta(): void {
    this.autenticacao.sairDaConta();
    void this.rota.navigate(["/dividas"]);
  }
}
