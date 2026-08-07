import { Routes } from "@angular/router";
import { protegerSimulacao } from "./core/authentication/guards/authentication.guard";


export const rotas: Routes = [
  {
    path: "dividas",
    loadComponent: () =>
      import("./features/dividas/dividas.component").then(
        (m) => m.ListaDividasComponent,
      ),
  },
  {
    path: "simular",
    canActivate: [protegerSimulacao],
    loadComponent: () =>
      import("./features/propostas/propostas.component").then(
        (m) => m.SimuladorPropostaComponent,
      ),
  },
  { path: "", pathMatch: "full", redirectTo: "dividas" },
  { path: "**", redirectTo: "dividas" },
];
