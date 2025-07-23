import { v4 as uuidv4 } from "uuid";

const casosRepository = [
  {
    id: "f5fb2ad5-22a8-4cb4-90f2-8733517a0d46",
    titulo: "homicidio",
    descricao:
      "Disparos foram reportados às 22:33 do dia 10/07/2007 na região do bairro União, resultando na morte da vítima, um homem de 45 anos.",
    status: "aberto",
    agente_id: "401bccf5-cf9e-489d-8412-446cd169a0f1",
  },
];

// GET /casos
export function obterTodosCasos() {
  return casosRepository;
}

// GET /casos/:id
export function obterUmCaso(id) {
  return casosRepository.find((caso) => caso.id === id);
}

// POST /casos
export function adicionarCaso(dados) {
  const index_ultimo = casosRepository.push({ id: uuidv4(), ...dados });
  return casosRepository[index_ultimo];
}

// PUT /casos/:id | PATCH /casos/:id
export function atualizarCaso(id, dados) {
  const index_caso = casosRepository.findIndex((caso) => caso.id === id);

  if (index_caso === -1) return undefined;

  for (const chave of Object.keys(dados)) {
    casosRepository[index_caso][chave] = dados[chave];
  }

  return casosRepository[index_caso];
}

// DELETE /casos/:id
export function apagarCaso(id) {
  const index_caso = casosRepository.findIndex((caso) => caso.id === id);

  if (index_caso === -1) return false;

  casosRepository.splice(index_caso, 1);
  return true;
}

// GET /casos?agente_id=uuid
export function obterCasosDeUmAgente(agente_id) {
  return casosRepository.find((caso) => caso.agente_id === agente_id);
}

// GET /casos?status=aberto
export function obterCasosEmAberto() {
  return casosRepository.find(({ status }) => status === "aberto");
}

// GET /casos/search?q=homicídio
export function pesquisarCasos(termo) {
  return casosRepository.find(
    ({ titulo, descricao }) =>
      titulo.search(termo) + descricao.search(termo) > -2
  );
}
