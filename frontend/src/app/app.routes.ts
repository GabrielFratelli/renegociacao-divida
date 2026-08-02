import { Routes } from '@angular/router';

export const rotas: Routes = [
  {
    path: 'dividas',
    loadComponent: () => import('./features/dividas/dividas.component')
      .then((m) => m.ListaDividasComponent)
  },
  {
    path: 'simular',
    loadComponent: () => import('./features/propostas/propostas.component')
      .then((m) => m.SimuladorPropostaComponent)
  },
  { path: '', pathMatch: 'full', redirectTo: 'dividas' },
  { path: '**', redirectTo: 'dividas' }
];
