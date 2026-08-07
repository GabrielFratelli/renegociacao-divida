import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { environment } from "../../../environment";
import {
  IAcordo,
  IDadosSimulacao,
  IPropostaSimulada,
} from "../../../core/models/proposal.model";

@Injectable({ providedIn: "root" })
export class PropostasService {
  private readonly http = inject(HttpClient);

  simularDivida(dados: IDadosSimulacao) {
    return this.http.post<IPropostaSimulada>(
      `${environment.apiUrl}/propostas/simular`,
      dados,
    );
  }

  aceitarProposta(propostaId: string) {
    return this.http.post<IAcordo>(
      `${environment.apiUrl}/propostas/${encodeURIComponent(propostaId)}/aceitar`,
      {},
    );
  }
}
