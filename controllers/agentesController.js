import * as agentesRepository from "../repositories/agentesRepository.js";

// GET /agentes
export function getAgentes(req, res) {
  res.status(200).json(agentesRepository.obterTodosAgentes());
}

// GET /agentes/:id
export function getAgentesId(req, res) {
  const { id } = req.params;
  const agente_encontrado = agentesRepository.obterUmAgente(id);

  if (!agente_encontrado) {
    res.status(404).json({
      status: 404,
      message: "ID inexistente",
      errors: {
        id: `O usuário com o ID '${id}' não foi encontrador no sistema.`,
      },
    });
  } else {
    res.status(200).json(agente_encontrado);
  }
}
