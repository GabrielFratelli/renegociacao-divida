// Controlador de dívidas: encaminha o cliente autenticado ao caso de uso e devolve a listagem pela API.

import { Response } from "express";
import { ListarDividas } from "../../application/use-cases/list-debts.js";
import { RequisicaoAutenticada } from "../middlewares/authenticate.js";

export class ControladorDividas {
  constructor(private readonly listarDividas: ListarDividas) {}

  listar = async (
    requisicao: RequisicaoAutenticada,
    resposta: Response,
  ): Promise<void> => {
    const dividas = await this.listarDividas.executar(requisicao.usuario!.id);
    resposta.json(dividas);
  };
}
