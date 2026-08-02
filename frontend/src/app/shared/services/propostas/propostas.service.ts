import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { ambiente } from '../../../environment';
import { DadosSimulacao, PropostaSimulada } from '../../../core/models/proposal.model';

@Injectable({ providedIn: 'root' })
export class PropostasService {
  private readonly http = inject(HttpClient);

  simular(dados: DadosSimulacao) {
    return this.http.post<PropostaSimulada>(`${ambiente.apiUrl}/propostas/simular`, dados);
  }
}
