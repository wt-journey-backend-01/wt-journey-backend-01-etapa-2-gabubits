import { v4 as uuidv4 } from "uuid";

let casosRepository = [];

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
  return casosRepository[index_ultimo - 1];
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
  return casosRepository.filter((caso) => caso.agente_id === agente_id);
}

// GET /casos?status=aberto
export function obterCasosEmAberto() {
  return casosRepository.filter(({ status }) => status === "aberto");
}

// GET /casos/search?q=homicídio
export function pesquisarCasos(termo) {
  return casosRepository.filter(
    ({ titulo, descricao }) =>
      titulo.toLowerCase().search(termo) !== -1 ||
      descricao.toLowerCase().search(termo) !== -1
  );
}

export function apagarCasosDeAgente(agente_id) {
  casosRepository = casosRepository.filter(
    (caso) => caso.agente_id !== agente_id
  );
}
