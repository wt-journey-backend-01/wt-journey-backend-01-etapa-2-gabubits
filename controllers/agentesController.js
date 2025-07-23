import * as agentesRepository from "../repositories/agentesRepository.js";

// GET /agentes
export function getAgentes(req, res) {
  res.status(200).json(agentesRepository.obterTodosAgentes());
}
