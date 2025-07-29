import { v4 as uuidv4 } from "uuid";

const agentesRepository = [];

// GET /agentes
export function obterTodosAgentes() {
  return agentesRepository;
}

// GET /agentes/:id
export function obterUmAgente(id) {
  return agentesRepository.find((agente) => agente.id === id);
}

// GET /agentes?cargo=inspetor
export function obterAgentesDoCargo(cargo) {
  return agentesRepository.filter((agente) => agente.cargo === cargo);
}

// GET /agentes?sort=dataDeIncorporacao
export function obterAgentesOrdenadosPorDataIncorp(ordem) {
  return agentesRepository
    .slice()
    .sort(
      (agente1, agente2) =>
        ordem *
        (Date.parse(agente1.dataDeIncorporacao) -
          Date.parse(agente2.dataDeIncorporacao))
    );
}

// POST /agentes
export function adicionarAgente(dados) {
  const index_ultimo = agentesRepository.push({ id: uuidv4(), ...dados });
  return agentesRepository[index_ultimo - 1];
}

// PUT /agentes/:id | PATCH /agentes/:id
export function atualizarAgente(id, dados) {
  const index_agente = agentesRepository.findIndex(
    (agente) => agente.id === id
  );

  if (index_agente === -1) return undefined;

  for (const chave of Object.keys(dados)) {
    agentesRepository[index_agente][chave] = dados[chave];
  }

  return agentesRepository[index_agente];
}

// DELETE /agentes/:id
export function apagarAgente(id) {
  const index_agente = agentesRepository.findIndex(
    (agente) => agente.id === id
  );

  if (index_agente === -1) return false;

  agentesRepository.splice(index_agente, 1);
  return true;
}
