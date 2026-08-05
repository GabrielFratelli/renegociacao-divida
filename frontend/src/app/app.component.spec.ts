import { TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { MatDialog } from "@angular/material/dialog";
import { signal } from "@angular/core";
import { AppComponent } from "./app.component";
import { AutenticacaoService } from "./core/authentication/services/autenticacao.service";
import { DialogoLoginComponent } from "./core/authentication/components/dialogo-login/dialogo-login.component";
import { DividasService } from "./shared/services/dividas/dividas.service";

describe("AppComponent", () => {
  const autenticacao = {
    autenticado: signal(false),
    usuario: signal(null),
    restaurarSessao: jest.fn(),
    sair: jest.fn(),
  };
  const dialogo = { open: jest.fn(), openDialogs: [] };
  const dividas = { limpar: jest.fn() };

  beforeEach(async () => {
    autenticacao.autenticado.set(false);
    autenticacao.usuario.set(null);
    autenticacao.restaurarSessao.mockClear();
    dialogo.open.mockClear();
    dividas.limpar.mockClear();

    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideRouter([]),
        { provide: AutenticacaoService, useValue: autenticacao },
        { provide: DividasService, useValue: dividas },
      ],
    })
      .overrideComponent(AppComponent, {
        set: { providers: [{ provide: MatDialog, useValue: dialogo }] },
      })
      .compileComponents();
  });

  it("abre o login e limpa dados quando não há autenticação", () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();

    expect(dialogo.open).toHaveBeenCalledWith(DialogoLoginComponent, {
      disableClose: true,
      width: "460px",
      maxWidth: "calc(100vw - 2rem)",
      autoFocus: "dialog",
    });
    expect(dividas.limpar).toHaveBeenCalled();
  });
});
