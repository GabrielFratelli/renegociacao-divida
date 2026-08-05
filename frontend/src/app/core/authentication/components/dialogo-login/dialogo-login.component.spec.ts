import { ComponentFixture, TestBed } from "@angular/core/testing";
import { MatDialogRef } from "@angular/material/dialog";
import { of, throwError } from "rxjs";
import { AutenticacaoService } from "../../services/autenticacao.service";
import { DialogoLoginComponent } from "./dialogo-login.component";

describe("DialogoLoginComponent", () => {
  let fixture: ComponentFixture<DialogoLoginComponent>;
  let componente: DialogoLoginComponent;
  let autenticacao: { autenticar: jest.Mock };
  let referencia: { close: jest.Mock };

  beforeEach(async () => {
    autenticacao = { autenticar: jest.fn() };
    referencia = { close: jest.fn() };

    await TestBed.configureTestingModule({
      imports: [DialogoLoginComponent],
      providers: [
        { provide: AutenticacaoService, useValue: autenticacao },
        { provide: MatDialogRef, useValue: referencia },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DialogoLoginComponent);
    componente = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("não autentica quando o formulário é inválido", () => {
    componente.formulario.controls.email.setValue("email-inválido");

    componente.entrar();

    expect(autenticacao.autenticar).not.toHaveBeenCalled();
  });

  it("não exibe erros antes de o usuário interagir com os campos", () => {
    expect(componente.formulario.controls.email.touched).toBe(false);
    expect(componente.formulario.controls.senha.touched).toBe(false);
    expect(fixture.nativeElement.querySelector("mat-error")).toBeNull();
  });

  it("autentica com as credenciais preenchidas e fecha o diálogo", () => {
    autenticacao.autenticar.mockReturnValue(
      of({
        token: "token",
        usuario: {
          id: "1",
          nome: "Cliente",
          email: "cliente.demo@email.com",
        },
      }),
    );
    componente.formulario.setValue({
      email: "cliente.demo@email.com",
      senha: "cliente9090@",
    });

    componente.entrar();

    expect(autenticacao.autenticar).toHaveBeenCalledWith(
      "cliente.demo@email.com",
      "cliente9090@",
    );
    expect(referencia.close).toHaveBeenCalledTimes(1);
    expect(componente.carregando()).toBe(false);
  });

  it("exibe uma mensagem quando a autenticação falha", () => {
    autenticacao.autenticar.mockReturnValue(
      throwError(() => new Error("Credenciais inválidas")),
    );
    componente.formulario.setValue({
      email: "cliente.demo@email.com",
      senha: "cliente9090@",
    });

    componente.entrar();

    expect(componente.erro()).toBe(
      "Não foi possível entrar. Confira suas credenciais e tente novamente.",
    );
    expect(componente.carregando()).toBe(false);
    expect(referencia.close).not.toHaveBeenCalled();
  });
});
