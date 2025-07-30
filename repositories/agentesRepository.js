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
  return agentesRepository.filter(
    (agente) => agente.cargo.toLowerCase() === cargo.toLowerCase()
  );
}

// GET /agentes?sort=dataDeIncorporacao
export function obterAgentesOrdenadosPorDataIncorpAsc() {
  const agentes_copia = agentesRepository.slice();
  const agentes_ordenados = agentes_copia.sort((agente1, agente2) => {
    const dIncorpA1 = new Date(agente1.dataDeIncorporacao).getTime();
    const dIncorpA2 = new Date(agente2.dataDeIncorporacao).getTime();

    return dIncorpA1 - dIncorpA2;
  });

  return agentes_ordenados;
}

// GET /agentes?sort=dataDeIncorporacao
export function obterAgentesOrdenadosPorDataIncorpDesc() {
  const agentes_copia = agentesRepository.slice();
  const agentes_ordenados = agentes_copia.sort((agente1, agente2) => {
    const dIncorpA1 = new Date(agente1.dataDeIncorporacao).getTime();
    const dIncorpA2 = new Date(agente2.dataDeIncorporacao).getTime();

    return dIncorpA1 - dIncorpA2;
  });

  return agentes_ordenados;
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
    if (chave !== "id") agentesRepository[index_agente][chave] = dados[chave];
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
