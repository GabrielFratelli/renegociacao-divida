import { spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const diretorioFrontend = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "..",
);
const raiz = resolve(diretorioFrontend, "..");
const diretorioImagens = resolve(diretorioFrontend, "src/app/assets/image");
const processos = [];

const iniciar = (argumentos, diretorio) => {
  const processo = spawn("npm", argumentos, {
    cwd: diretorio,
    detached: true,
    stdio: "inherit",
  });
  processos.push(processo);
  return processo;
};

const encerrarProcessos = () => {
  for (const processo of processos) {
    if (!processo.pid || processo.killed) continue;
    try {
      process.kill(-processo.pid, "SIGTERM");
    } catch {
      // O processo já foi encerrado.
    }
  }
};

const esperarUrl = async (url) => {
  for (let tentativa = 0; tentativa < 60; tentativa += 1) {
    try {
      const resposta = await fetch(url);
      if (resposta.ok) return;
    } catch {
      // Aguarda a próxima tentativa enquanto o servidor inicia.
    }
    await new Promise((resolver) => setTimeout(resolver, 500));
  }
  throw new Error(`O servidor não respondeu em ${url}.`);
};

const autenticar = async (pagina) => {
  const dialogo = pagina.getByRole("dialog");
  await dialogo.getByLabel("E-mail").fill("cliente.demo@email.com");
  await dialogo.getByLabel("Senha").fill("cliente9090@");
  await dialogo.getByRole("button", { name: "Entrar" }).click();
  await pagina.getByRole("heading", { name: "Suas dívidas" }).waitFor();
  await pagina.getByText("Cartão de crédito final 4832").waitFor();
};

const capturar = async (pagina, caminho) => {
  await pagina.screenshot({ path: caminho, fullPage: true });
};

const prepararPagina = async (pagina) => {
  await pagina.addStyleTag({
    content: ".barra-principal { position: static !important; }",
  });
};

const gerar = async () => {
  await mkdir(resolve(diretorioImagens, "web"), { recursive: true });
  await mkdir(resolve(diretorioImagens, "mobile"), { recursive: true });

  iniciar(["run", "dev"], resolve(raiz, "backend"));
  iniciar(["start"], diretorioFrontend);
  await Promise.all([
    esperarUrl("http://localhost:3000/api/saude"),
    esperarUrl("http://localhost:4200"),
  ]);

  const navegador = await chromium.launch({ headless: true });
  try {
    const desktop = await navegador.newContext({
      viewport: { width: 1440, height: 900 },
      locale: "pt-BR",
      timezoneId: "America/Sao_Paulo",
    });
    const paginaDesktop = await desktop.newPage();
    await paginaDesktop.goto("http://localhost:4200/dividas");
    await prepararPagina(paginaDesktop);
    await paginaDesktop.getByRole("heading", { name: /Bem-vindo/ }).waitFor();
    await capturar(paginaDesktop, resolve(diretorioImagens, "web/login.png"));
    await autenticar(paginaDesktop);
    await capturar(paginaDesktop, resolve(diretorioImagens, "web/dividas.png"));
    await paginaDesktop
      .getByRole("button", { name: "Simular acordo" })
      .first()
      .click();
    await paginaDesktop
      .getByRole("heading", { name: "Simular proposta" })
      .waitFor();
    await capturar(
      paginaDesktop,
      resolve(diretorioImagens, "web/simulacao.png"),
    );
    await paginaDesktop
      .getByRole("button", { name: "Calcular proposta" })
      .click();
    await paginaDesktop
      .getByText("Proposta simulada", { exact: true })
      .waitFor();
    await capturar(
      paginaDesktop,
      resolve(diretorioImagens, "web/proposta.png"),
    );
    await paginaDesktop
      .getByRole("button", { name: "Aceitar proposta" })
      .click();
    await paginaDesktop
      .getByRole("button", { name: "Confirmar acordo" })
      .click();
    await paginaDesktop
      .getByText("Em acordo", { exact: true })
      .first()
      .waitFor();
    await capturar(paginaDesktop, resolve(diretorioImagens, "web/acordo.png"));
    await desktop.close();

    const mobile = await navegador.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 1,
      isMobile: true,
      locale: "pt-BR",
      timezoneId: "America/Sao_Paulo",
    });
    const paginaMobile = await mobile.newPage();
    await paginaMobile.goto("http://localhost:4200/dividas");
    await prepararPagina(paginaMobile);
    await autenticar(paginaMobile);
    await capturar(
      paginaMobile,
      resolve(diretorioImagens, "mobile/dividas.png"),
    );
    await paginaMobile
      .getByRole("button", { name: "Simular acordo" })
      .first()
      .click();
    await paginaMobile
      .getByRole("heading", { name: "Simular proposta" })
      .waitFor();
    await paginaMobile
      .getByRole("button", { name: "Calcular proposta" })
      .click();
    await paginaMobile
      .getByText("Proposta simulada", { exact: true })
      .waitFor();
    await capturar(
      paginaMobile,
      resolve(diretorioImagens, "mobile/simulacao.png"),
    );
    await paginaMobile
      .getByRole("button", { name: "Aceitar proposta" })
      .click();
    await paginaMobile
      .getByRole("button", { name: "Confirmar acordo" })
      .click();
    await paginaMobile
      .getByText("Em acordo", { exact: true })
      .first()
      .waitFor();
    await capturar(
      paginaMobile,
      resolve(diretorioImagens, "mobile/acordo.png"),
    );
    await mobile.close();
  } finally {
    await navegador.close();
  }
};

try {
  await gerar();
} finally {
  encerrarProcessos();
}
