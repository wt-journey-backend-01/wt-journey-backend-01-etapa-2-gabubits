import * as agentesRepository from "../repositories/agentesRepository.js";
import { apagarCasosDeAgente } from "../repositories/casosRepository.js";
import * as Errors from "../utils/errorHandler.js";
import {
  agentePatchSchema,
  agenteSchema,
  idSchema,
  agentesQuerySchema,
} from "../utils/schemas.js";
import { z } from "zod";

// GET /agentes | GET /agentes?cargo | GET /agentes?sort
export function obterAgentes(req, res, next) {
  if (!Object.keys(req.query).length)
    return res.status(200).json(agentesRepository.obterTodosAgentes());

  try {
    const query_parser = agentesQuerySchema.safeParse(req.query);

    if (!query_parser.success) {
      throw new Errors.InvalidQueryError({
        query:
          "Formato de uso da query inválida! É permitido somente cargo ou sort, além de não serem vazias.",
      });
    }

    const { cargo, sort } = query_parser.data;
    const agentes_encontrados = cargo
      ? agentesRepository.obterAgentesDoCargo(cargo)
      : agentesRepository.obterAgentesOrdenadosPorDataIncorp(sort);

    res.status(200).json(agentes_encontrados);
  } catch (e) {
    next(e);
  }
}

// GET /agentes/:id
export function obterUmAgente(req, res, next) {
  try {
    const id_parse = idSchema.safeParse(req.params);

    if (!id_parse.success)
      throw new Errors.InvalidIdError(
        z.flattenError(id_parse.error).fieldErrors
      );

    const agente_encontrado = agentesRepository.obterUmAgente(id_parse.data.id);

    if (!agente_encontrado)
      throw new Errors.IdNotFoundError({
        id: `O ID '${id}' não existe nos agentes`,
      });

    res.status(200).json(agente_encontrado);
  } catch (e) {
    next(e);
  }
}

// POST /agentes
export function criarAgente(req, res, next) {
  try {
    const body_parse = agenteSchema.safeParse(req.body);

    if (!body_parse.success) {
      const { formErrors, fieldErrors } = z.flattenError(body_parse.error);
      throw new Errors.InvalidFormatError({
        ...(formErrors.length ? { bodyFormat: formErrors } : {}),
        ...fieldErrors,
      });
    }

    res.status(201).json(agentesRepository.adicionarAgente(body_parse.data));
  } catch (e) {
    next(e);
  }
}

// PUT /agentes/:id | PATCH /agentes/:id
export function atualizarAgente(req, res, next) {
  try {
    const id_parse = idSchema.safeParse(req.params);

    if (!id_parse.success)
      throw new Errors.InvalidIdError(
        z.flattenError(id_parse.error).fieldErrors
      );

    const body_parse =
      req.method === "PUT"
        ? agenteSchema.safeParse(req.body)
        : agentePatchSchema.safeParse(req.body);

    if (!body_parse.success) {
      const { formErrors, fieldErrors } = z.flattenError(body_parse.error);
      throw new Errors.InvalidFormatError({
        ...(formErrors.length ? { bodyFormat: formErrors } : {}),
        ...fieldErrors,
      });
    }

    const agente_atualizado = agentesRepository.atualizarAgente(
      id_parse.data.id,
      body_parse.data
    );

    if (!agente_atualizado)
      throw new Errors.IdNotFoundError({
        id: `O ID '${id_parse.data.id}' não existe nos agentes`,
      });

    res.status(200).json(agente_atualizado);
  } catch (e) {
    next(e);
  }
}

// DELETE /agentes/:id
export function apagarAgente(req, res, next) {
  try {
    const id_parse = idSchema.safeParse(req.params);

    if (!id_parse.success)
      throw new Errors.InvalidIdError(
        z.flattenError(id_parse.error).fieldErrors
      );

    const agente_apagado = agentesRepository.apagarAgente(id_parse.data.id);

    if (!agente_apagado)
      throw new Errors.IdNotFoundError({
        id: `O ID '${id_parse.data.id}' não existe nos agentes`,
      });

    apagarCasosDeAgente(id_parse.data.id);
    res.sendStatus(204);
  } catch (e) {
    next(e);
  }
}
