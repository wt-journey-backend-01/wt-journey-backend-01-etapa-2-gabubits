import { v4 as uuidv4 } from "uuid";

const agentesRepository = [
  {
    id: "401bccf5-cf9e-489d-8412-446cd169a0f1",
    nome: "Rommel Carneiro",
    dataDeIncorporacao: "1992/10/04",
    cargo: "delegado",
  },
  {
    id: "a12f3d45-b678-4cde-91f2-2234f5678901",
    nome: "Mariana Lopes",
    dataDeIncorporacao: "2001/05/23",
    cargo: "inspetor",
  },
  {
    id: "b23c4e56-c789-5def-82a3-3345g6789012",
    nome: "Carlos Eduardo",
    dataDeIncorporacao: "2010/08/15",
    cargo: "delegado",
  },
  {
    id: "c34d5f67-d890-6efa-73b4-4456h7890123",
    nome: "Fernanda Silva",
    dataDeIncorporacao: "2018/02/10",
    cargo: "inspetor",
  },
  {
    id: "d45e6g78-e901-7fcb-64c5-5567i8901234",
    nome: "João Batista",
    dataDeIncorporacao: "1998/11/30",
    cargo: "delegado",
  },
  {
    id: "e56f7h89-f012-8gdc-55d6-6678j9012345",
    nome: "Patrícia Gomes",
    dataDeIncorporacao: "2022/07/05",
    cargo: "inspetor",
  },
  {
    id: "f67g8i90-0123-9hed-46e7-7789k0123456",
    nome: "Lucas Martins",
    dataDeIncorporacao: "2015/09/12",
    cargo: "inspetor",
  },
  {
    id: "g78h9j01-1234-0ife-37f8-8890l1234567",
    nome: "Ana Beatriz",
    dataDeIncorporacao: "2005/04/20",
    cargo: "delegado",
  },
];

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
  return agentesRepository.toSorted(
    (agente1, agente2) =>
      ordem *
      (Date.parse(agente1.dataDeIncorporacao) -
        Date.parse(agente2.dataDeIncorporacao))
  );
}

// POST /agentes
export function adicionarAgente(dados) {
  const index_ultimo = agentesRepository.push({ id: uuidv4(), ...dados });
  return agentesRepository[index_ultimo];
}

// PUT /agentes/:id | PATCH /agentes/:id
export function atualizarAgente(id, dados) {
  const index_agente = agentesRepository.findIndex(
    (agente) => agente.id === id
  );

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

  agentesRepository.splice(index_agente, 1);
}
