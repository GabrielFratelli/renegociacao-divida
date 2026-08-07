import { HttpClient } from "@angular/common/http";
import { Injectable, computed, inject, signal } from "@angular/core";
import { Observable, tap } from "rxjs";
import { environment } from "../../../environment";
import { TSessao, IRespostaLogin } from "../../models/autenticacao.model";

@Injectable({ providedIn: "root" })
export class AutenticacaoService {
  private readonly http = inject(HttpClient);
  private readonly chaveSessao = "sessao-renegociacao";
  private readonly sessaoInterna = signal<TSessao | null>(null);

  readonly usuario = computed(() => this.sessaoInterna()?.usuario ?? null);
  readonly token = computed(() => this.sessaoInterna()?.token ?? null);
  readonly autenticado = computed(() => this.token() !== null);

  constructor() {
    this.restaurarSessao();
  }

  autenticarConta(email: string, senha: string): Observable<IRespostaLogin> {
    return this.http
      .post<IRespostaLogin>(`${environment.apiUrl}/auth/login`, { email, senha })
      .pipe(tap((resposta) => this.gravarSessao(resposta)));
  }

  restaurarSessao(): void {
    const armazenada = sessionStorage.getItem(this.chaveSessao);
    if (!armazenada) return;
    try {
      const sessao: unknown = JSON.parse(armazenada);
      if (!this.ehSessaoValida(sessao)) throw new Error("Sessão inválida");
      this.sessaoInterna.set(sessao);
    } catch {
      sessionStorage.removeItem(this.chaveSessao);
      this.sessaoInterna.set(null);
    }
  }

  sairDaConta(): void {
    sessionStorage.removeItem(this.chaveSessao);
    this.sessaoInterna.set(null);
  }

  private gravarSessao(sessao: TSessao): void {
    sessionStorage.setItem(this.chaveSessao, JSON.stringify(sessao));
    this.sessaoInterna.set(sessao);
  }

  private ehSessaoValida(valor: unknown): valor is TSessao {
    if (!valor || typeof valor !== "object") return false;
    const sessao = valor as Record<string, unknown>;
    const usuario = sessao["usuario"];
    if (!usuario || typeof usuario !== "object") return false;
    const dadosUsuario = usuario as Record<string, unknown>;

    return (
      typeof sessao["token"] === "string" &&
      sessao["token"].length > 0 &&
      typeof dadosUsuario["id"] === "string" &&
      typeof dadosUsuario["nome"] === "string" &&
      typeof dadosUsuario["email"] === "string"
    );
  }
}
