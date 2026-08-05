import cors from "cors";
import express, { Express, NextFunction, Request, Response } from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { AceitarProposta } from "../../application/use-cases/accept-proposal.js";
import { ListarDividas } from "../../application/use-cases/list-debts.js";
import { SimularProposta } from "../../application/use-cases/simulate-proposal.js";
import { ControladorAutenticacao } from "../../presentation/controllers/authentication-controller.js";
import { ControladorDividas } from "../../presentation/controllers/debts-controller.js";
import { ControladorPropostas } from "../../presentation/controllers/proposals-controller.js";
import { autenticar } from "../../presentation/middlewares/authenticate.js";
import { RepositorioAcordosMemoria } from "../repositories/in-memory-agreements-repository.js";
import { RepositorioDividasMemoria } from "../repositories/in-memory-debts-repository.js";
import { RepositorioPropostasMemoria } from "../repositories/in-memory-proposals-repository.js";
import { ServicoJwt } from "../security/jwt-service.js";

interface ConfiguracaoAplicacao {
  origemPermitida: string;
  segredoJwt: string;
}

export const criarAplicacao = (
  configuracao: ConfiguracaoAplicacao,
): Express => {
  const aplicacao = express();
  const repositorioDividas = new RepositorioDividasMemoria();
  const repositorioPropostas = new RepositorioPropostasMemoria();
  const repositorioAcordos = new RepositorioAcordosMemoria();
  const servicoToken = new ServicoJwt(configuracao.segredoJwt);
  const controladorAutenticacao = new ControladorAutenticacao(servicoToken);
  const controladorDividas = new ControladorDividas(
    new ListarDividas(repositorioDividas),
  );
  const controladorPropostas = new ControladorPropostas(
    new SimularProposta(repositorioDividas, repositorioPropostas),
    new AceitarProposta(
      repositorioPropostas,
      repositorioAcordos,
      repositorioDividas,
    ),
  );

  aplicacao.disable("x-powered-by");
  aplicacao.use(helmet());
  aplicacao.use(
    cors({
      origin: configuracao.origemPermitida,
      methods: ["GET", "POST"],
      allowedHeaders: ["Content-Type", "Authorization"],
    }),
  );
  aplicacao.use(express.json({ limit: "30kb" }));
  aplicacao.use(
    "/api",
    rateLimit({
      windowMs: 60_000,
      limit: 100,
      standardHeaders: "draft-8",
      legacyHeaders: false,
    }),
  );

  aplicacao.get("/api/saude", (_: Request, resposta: Response) =>
    resposta.json({ status: "ok" }),
  );
  aplicacao.post("/api/auth/login", controladorAutenticacao.login);
  aplicacao.get(
    "/api/dividas",
    autenticar(servicoToken),
    controladorDividas.listar,
  );
  aplicacao.post(
    "/api/propostas/simular",
    autenticar(servicoToken),
    controladorPropostas.simular,
  );
  aplicacao.post(
    "/api/propostas/:id/aceitar",
    autenticar(servicoToken),
    controladorPropostas.aceitar,
  );
  aplicacao.use(
    (erro: unknown, _: Request, resposta: Response, __: NextFunction) => {
      console.error(erro);
      resposta.status(500).json({ mensagem: "Erro inesperado." });
    },
  );

  return aplicacao;
};
