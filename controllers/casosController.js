import { obterUmAgente } from "../repositories/agentesRepository.js";
import * as casosRepository from "../repositories/casosRepository.js";
import * as Errors from "../utils/errorHandler.js";
import {
  casosQuerySchema,
  agenteIdSchema,
  searchQuerySchema,
  casoIdSchema,
  idSchema,
  casoSchema,
  casoPatchSchema,
} from "../utils/schemas.js";
import { z } from "zod";

// GET /casos | GET /casos?agente_id=uuid | GET /casos?status=aberto
export function obterCasos(req, res, next) {
  if (!Object.keys(req.query).length)
    return res.status(200).json(casosRepository.obterTodosCasos());
  try {
    const query_parser = casosQuerySchema.safeParse(req.query);

    if (!query_parser.success) {
      throw new Errors.InvalidQueryError({
        query:
          "Formato de uso da query inválida! É permitido somente agente_id ou status",
      });
    }

    const { agente_id, status } = query_parser.data;

    if (agente_id) {
      const agente_id_parse = agenteIdSchema.safeParse(query_parser.data);

      if (!agente_id_parse.success)
        throw new Errors.InvalidIdError(
          z.flattenError(agente_id_parse.error).fieldErrors
        );

      const casos_encontrados = casosRepository.obterCasosDeUmAgente(agente_id);
      res.status(200).json(casos_encontrados);
    }

    if (status) {
      const casos_encontrados = casosRepository.obterCasosEmAberto();
      res.status(200).json(casos_encontrados);
    }
  } catch (e) {
    next(e);
  }
}

// GET /casos/search?q=homicídio
export function pesquisarCasos(req, res, next) {
  try {
    const query_parser = searchQuerySchema.safeParse(req.query);

    if (!query_parser.success) {
      throw new Errors.InvalidQueryError({
        query: "Formato de uso da query inválida! É permitido somente q",
      });
    }

    const { q } = query_parser.data;

    const casos_encontrados = casosRepository.pesquisarCasos(q);
    res.status(200).json(casos_encontrados);
  } catch (e) {
    next(e);
  }
}

// GET /casos/:caso_id/agente
export function obterAgenteDoCaso(req, res, next) {
  try {
    const caso_id_parse = casoIdSchema.safeParse(req.params);
    if (!caso_id_parse.success)
      throw new Errors.InvalidIdError(
        z.flattenError(caso_id_parse.error).fieldErrors
      );

    const caso_encontrado = casosRepository.obterUmCaso(
      caso_id_parse.data.caso_id
    );

    if (!caso_encontrado)
      throw new Errors.IdNotFoundError({
        id: `O ID '${id}' não existe nos casos`,
      });

    const { agente_id } = caso_encontrado;

    res.status(200).json(obterUmAgente(agente_id));
  } catch (e) {
    next(e);
  }
}

// GET /casos/:id
export function obterUmCaso(req, res, next) {
  try {
    const id_parse = idSchema.safeParse(req.params);

    if (!id_parse.success)
      throw new Errors.InvalidIdError(
        z.flattenError(id_parse.error).fieldErrors
      );

    const caso_encontrado = casosRepository.obterUmCaso(id_parse.data.id);

    if (!caso_encontrado)
      throw new Errors.IdNotFoundError({
        id: `O ID '${id}' não existe nos casos`,
      });

    res.status(200).json(caso_encontrado);
  } catch (e) {
    next(e);
  }
}

// POST /casos
export function criarCaso(req, res, next) {
  try {
    const body_parse = casoSchema.safeParse(req.body);

    if (!body_parse.success) {
      const { formErrors, fieldErrors } = z.flattenError(body_parse.error);
      throw new Errors.InvalidFormatError({
        ...(formErrors.length ? { bodyFormat: formErrors } : {}),
        ...fieldErrors,
      });
    }

    const agente_existe = obterUmAgente(body_parse.data.agente_id);

    if (!agente_existe)
      throw new Errors.IdNotFoundError({
        agente_id: `O agente_id '${id}' não existe nos agentes`,
      });

    res.status(201).json(casosRepository.adicionarCaso(body_parse.data));
  } catch (e) {
    next(e);
  }
}

// PUT /casos/:id | PATCH /casos/:id
export function atualizarCaso(req, res, next) {
  try {
    const id_parse = idSchema.safeParse(req.params);

    if (!id_parse.success)
      throw new Errors.InvalidIdError(
        z.flattenError(id_parse.error).fieldErrors
      );

    const body_parse =
      req.method === "PUT"
        ? casoSchema.safeParse(req.body)
        : casoPatchSchema.safeParse(req.body);

    if (!body_parse.success) {
      const { formErrors, fieldErrors } = z.flattenError(body_parse.error);
      throw new Errors.InvalidFormatError({
        ...(formErrors.length ? { bodyFormat: formErrors } : {}),
        ...fieldErrors,
      });
    }

    const agente_existe = obterUmAgente(body_parse.data.agente_id);

    if (!agente_existe)
      throw new Errors.IdNotFoundError({
        agente_id: `O agente_id '${id}' não existe nos agentes`,
      });

    const caso_atualizado = casosRepository.atualizarCaso(
      id_parse.data.id,
      body_parse.data
    );

    if (!caso_atualizado)
      throw new Errors.IdNotFoundError({
        id: `O ID '${id_parse.data.id}' não existe nos casos`,
      });

    res.status(200).json(caso_atualizado);
  } catch (e) {
    next(e);
  }
}

// DELETE /casos/:id
export function apagarCaso(req, res, next) {
  try {
    const id_parse = idSchema.safeParse(req.params);

    if (!id_parse.success)
      throw new Errors.InvalidIdError(
        z.flattenError(id_parse.error).fieldErrors
      );

    const caso_apagado = casosRepository.apagarCaso(id_parse.data.id);

    if (!caso_apagado)
      throw new Errors.IdNotFoundError({
        id: `O ID '${id_parse.data.id}' não existe nos casos`,
      });

    res.sendStatus(204);
  } catch (e) {
    next(e);
  }
}
