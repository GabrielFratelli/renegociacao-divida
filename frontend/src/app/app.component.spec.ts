import { TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { signal } from '@angular/core';
import { AppComponent } from './app.component';
import { AutenticacaoService } from './core/authentication/services/autenticacao.service';
import { DialogoLoginComponent } from './core/authentication/components/dialogo-login/dialogo-login.component';

describe('AppComponent', () => {
  const autenticacao = {
    autenticado: signal(false),
    usuario: signal(null),
    restaurarSessao: jest.fn(),
    sair: jest.fn()
  };
  const dialogo = { open: jest.fn() };

  beforeEach(async () => {
    autenticacao.autenticado.set(false);
    autenticacao.usuario.set(null);
    autenticacao.restaurarSessao.mockClear();
    dialogo.open.mockClear();

    await TestBed.configureTestingModule({
      imports: [AppComponent, NoopAnimationsModule],
      providers: [
        provideRouter([]),
        { provide: AutenticacaoService, useValue: autenticacao }
      ]
    })
      .overrideComponent(AppComponent, { set: { providers: [{ provide: MatDialog, useValue: dialogo }] } })
      .compileComponents();
  });

  it('restaura a sessão e abre o login quando não há autenticação', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();

    expect(autenticacao.restaurarSessao).toHaveBeenCalledTimes(1);
    expect(dialogo.open).toHaveBeenCalledWith(DialogoLoginComponent, {
      disableClose: true,
      width: '420px',
      autoFocus: 'first-tabbable'
    });
  });
});
