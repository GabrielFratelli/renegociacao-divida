import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { tap } from 'rxjs';
import { ambiente } from '../../../environment';

interface RespostaLogin {
  token: string;
  usuario: { id: string; nome: string; email: string };
}

interface Sessao extends RespostaLogin {}

@Injectable({ providedIn: 'root' })
export class AutenticacaoService {
  private readonly http = inject(HttpClient);
  private readonly chaveSessao = 'sessao-renegociacao';
  private readonly sessaoInterna = signal<Sessao | null>(null);

  readonly usuario = computed(() => this.sessaoInterna()?.usuario ?? null);
  readonly token = computed(() => this.sessaoInterna()?.token ?? null);
  readonly autenticado = computed(() => this.token() !== null);

  autenticar(email: string, senha: string) {
    return this.http.post<RespostaLogin>(`${ambiente.apiUrl}/auth/login`, { email, senha }).pipe(
      tap((resposta) => this.gravarSessao(resposta))
    );
  }

  restaurarSessao(): void {
    const armazenada = sessionStorage.getItem(this.chaveSessao);
    if (!armazenada) return;
    try {
      this.sessaoInterna.set(JSON.parse(armazenada) as Sessao);
    } catch {
      sessionStorage.removeItem(this.chaveSessao);
    }
  }

  sair(): void {
    sessionStorage.removeItem(this.chaveSessao);
    this.sessaoInterna.set(null);
  }

  private gravarSessao(sessao: Sessao): void {
    sessionStorage.setItem(this.chaveSessao, JSON.stringify(sessao));
    this.sessaoInterna.set(sessao);
  }
}
