// Ponto de entrada do BFF: carrega a configuração, cria a aplicação Express e inicia o servidor HTTP.

import "dotenv/config";
import { criarAplicacao } from "./infrastructure/composition/application-factory.js";

const porta = Number(process.env.PORTA ?? 3000);
const aplicacao = criarAplicacao({
  origemPermitida: process.env.ORIGEM_PERMITIDA ?? "http://localhost:4200",
  segredoJwt: process.env.SEGREDO_JWT ?? "chave-apenas-para-desenvolvimento",
});

aplicacao.listen(porta, () =>
  console.info(`BFF disponível em http://localhost:${porta}`),
);
