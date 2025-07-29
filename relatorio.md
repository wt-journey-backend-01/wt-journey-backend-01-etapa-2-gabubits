<sup>Esse é um feedback gerado por IA, ele pode conter erros.</sup>

Você tem 8 créditos restantes para usar o sistema de feedback AI.

# Feedback para gabubits:

Nota final: **80.8/100**

# Feedback para gabubits 🚓✨

Olá, gabubits! Antes de tudo, parabéns pelo empenho e pela entrega da sua API para o Departamento de Polícia! 🎉 Eu dei uma boa fuçada no seu código e já vou começar destacando as coisas que você mandou muito bem, para a gente celebrar juntos:

---

## 🎉 Pontos Fortes e Conquistas Bônus

- Você estruturou muito bem seu projeto, com rotas, controllers e repositories separados, exatamente como esperado. Isso ajuda muito na organização e manutenção do código!
- Os endpoints básicos de agentes e casos estão todos implementados e funcionando, com os métodos HTTP corretos.
- A validação dos dados com Zod está bem aplicada, e o tratamento de erros customizados também está presente na maior parte do código.
- Você conseguiu implementar os filtros simples para casos por status e por agente, que são bônus importantes.
- Os endpoints de busca por palavras-chave e de obtenção do agente responsável pelo caso estão criados, mesmo que precisem de ajustes.
- Parabéns também pelo uso do Swagger para documentação, isso mostra cuidado com a API e facilita o uso para outros desenvolvedores.

---

## 🔎 Onde podemos melhorar? Vamos analisar os pontos que precisam de atenção para você chegar no próximo nível!

---

### 1. **Problema com alteração do ID nos métodos PUT**

Eu percebi que há uma penalidade porque seu código permite alterar o ID de agentes e casos via método PUT, o que não deveria acontecer, pois o ID é um identificador único e imutável.

No `controllers/agentesController.js`, dentro da função `atualizarAgente`, você faz:

```js
delete body_parse.data.id;
```

Mas isso só remove o `id` do objeto que será enviado para o repositório, porém no seu repositório você atualiza o agente com:

```js
for (const chave of Object.keys(dados)) {
  agentesRepository[index_agente][chave] = dados[chave];
}
```

Se por algum motivo o `id` ainda está chegando no `dados`, ele será atualizado. O ideal é garantir que o `id` nunca seja atualizado, nem mesmo vindo do corpo da requisição.

**Sugestão de melhoria:**

No controller, antes de chamar o repositório, remova o campo `id` do objeto de atualização ou ignore-o no repositório. Por exemplo, no controller:

```js
if (body_parse.data.id) delete body_parse.data.id;
```

E no repositório, para garantir, ignore qualquer atualização no campo `id`:

```js
for (const chave of Object.keys(dados)) {
  if (chave !== "id") {
    agentesRepository[index_agente][chave] = dados[chave];
  }
}
```

Faça o mesmo para os casos no `casosRepository.js` e `casosController.js`. Isso evita que o ID seja alterado por acidente.

---

### 2. **Endpoint GET /casos/:caso_id/agente não está funcionando conforme esperado**

Você implementou a rota e o controller para obter o agente responsável por um caso:

```js
router.get("/casos/:caso_id/agente", casosController.obterAgenteDoCaso);
```

No controller:

```js
const caso_encontrado = casosRepository.obterUmCaso(caso_id_parse.data.caso_id);

if (!caso_encontrado)
  throw new Errors.IdNotFoundError({
    id: `O ID '${caso_id_parse.data.caso_id}' não existe nos casos`,
  });

const { agente_id } = caso_encontrado;

const agente_existe = obterUmAgente(agente_id);

if (!agente_existe)
  throw new Errors.IdNotFoundError({
    agente_id: `O agente_id '${agente_id}' não existe nos agentes`,
  });

res.status(200).json(obterUmAgente(agente_id));
```

**O que observei:**  
A função `obterUmAgente` foi importada incorretamente da forma:

```js
import { obterUmAgente } from "../repositories/agentesRepository.js";
```

Mas `obterUmAgente` está no repositório de agentes, e você importou corretamente, então isso está certo. Porém, o problema pode estar no fato de que você chama `obterUmAgente` duas vezes para o mesmo `agente_id` — uma para verificar se existe e outra para retornar — o que é redundante, mas não erro.

O mais provável é que o problema esteja no fato de que a rota usa `:caso_id`, e no controller você usa `caso_id_parse.data.caso_id`, mas esse parâmetro é `req.params.caso_id`. Isso está correto.

Porém, a variável `obterUmAgente` está importada, mas no controller você chama `obterUmAgente(agente_id)` sem `await` e sem checar se é síncrono. Como seu repositório é síncrono, isso deve funcionar.

**Possível causa raiz:**  
O problema pode estar na forma como você está lidando com erros, ou na forma como o endpoint está sendo chamado. Verifique também se não há conflito com outras rotas, especialmente porque você tem:

```js
router.get("/casos/:id", casosController.obterUmCaso);
```

E o endpoint `/casos/:caso_id/agente` pode conflitar com `/casos/:id`. A ordem das rotas importa!

**Sugestão:**

No arquivo `routes/casosRoutes.js`, coloque a rota mais específica antes da rota genérica:

```js
router.get("/casos/search", casosController.pesquisarCasos);
router.get("/casos/:caso_id/agente", casosController.obterAgenteDoCaso);
router.get("/casos/:id", casosController.obterUmCaso);
```

Se a rota `/casos/:id` estiver antes de `/casos/:caso_id/agente`, a primeira vai capturar as requisições para `/casos/:caso_id/agente` e o segundo endpoint nunca será chamado.

---

### 3. **Busca por palavras-chave no endpoint `/casos/search` não está funcionando corretamente**

Você implementou o endpoint `/casos/search` no `casosRoutes.js` e no controller `pesquisarCasos`, que filtra casos pelo título ou descrição.

O código parece correto:

```js
export function pesquisarCasos(req, res, next) {
  try {
    const query_parser = searchQuerySchema.safeParse(req.query);

    if (!query_parser.success) {
      throw new Errors.InvalidQueryError({
        query:
          "Formato de uso da query inválida! É permitido somente q e não deve ser vazia.",
      });
    }

    const { q } = query_parser.data;

    const casos_encontrados = casosRepository.pesquisarCasos(q);
    res.status(200).json(casos_encontrados);
  } catch (e) {
    next(e);
  }
}
```

No repositório:

```js
export function pesquisarCasos(termo) {
  const termoLower = termo.toLowerCase();
  return casosRepository.filter(
    ({ titulo, descricao }) =>
      titulo.toLowerCase().includes(termoLower) ||
      descricao.toLowerCase().includes(termoLower)
  );
}
```

**Possível problema:**  
No controller `obterUmCaso`, você faz uma verificação:

```js
if (req.params.id.includes("search")) {
  return next();
}
```

Isso é para evitar conflito entre `/casos/search` e `/casos/:id`. Porém, essa abordagem pode gerar confusão e não é a melhor prática.

**Sugestão:**  
No arquivo de rotas, coloque a rota `/casos/search` antes da rota `/casos/:id`, assim o Express já sabe qual rota chamar sem precisar de gambiarras no controller:

```js
router.get("/casos/search", casosController.pesquisarCasos);
router.get("/casos/:id", casosController.obterUmCaso);
```

Depois, remova o `if (req.params.id.includes("search"))` do controller `obterUmCaso`.

---

### 4. **Filtros por data de incorporação e ordenação para agentes não estão funcionando**

Você tem o endpoint `/agentes?sort=` para ordenar agentes pela data de incorporação, mas os testes bônus indicam que isso não está passando.

No seu repositório `obterAgentesOrdenadosPorDataIncorp`:

```js
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
```

Aqui, o parâmetro `ordem` vem do query string e provavelmente é uma string, não um número. Isso pode causar um comportamento inesperado na multiplicação.

**Sugestão:**  
No controller `obterAgentes`, converta o parâmetro `sort` para número:

```js
const sortNumber = sort === "1" ? 1 : sort === "-1" ? -1 : 1;
const agentes_encontrados = cargo
  ? agentesRepository.obterAgentesDoCargo(cargo)
  : agentesRepository.obterAgentesOrdenadosPorDataIncorp(sortNumber);
```

Assim, a ordenação vai funcionar corretamente para valores `"1"` e `"-1"`.

---

### 5. **Mensagens de erro customizadas para argumentos inválidos não estão 100% implementadas**

Os testes bônus falharam para mensagens de erro customizadas para agentes e casos inválidos. No seu código, você já usa erros customizados em `utils/errorHandler.js` e lança erros com mensagens específicas.

Por exemplo:

```js
throw new Errors.InvalidIdError(
  z.flattenError(id_parse.error).fieldErrors
);
```

Isso é ótimo! O que pode estar faltando é garantir que todos os erros de validação estejam usando essas classes e que as mensagens estejam coerentes e completas.

**Sugestão:**  
Revise seu `utils/errorHandler.js` para garantir que as classes de erro estejam bem definidas, e revise todos os pontos onde erros são lançados para usar essas classes e mensagens personalizadas.

---

### 6. **Arquitetura e organização do projeto**

Sua estrutura de arquivos está perfeita, conforme o esperado:

```
.
├── controllers/
├── repositories/
├── routes/
├── utils/
├── docs/
├── package.json
└── server.js
```

Isso é ótimo e demonstra que você compreende bem a arquitetura MVC aplicada a APIs REST com Node.js e Express.

---

## 📚 Recursos recomendados para você aprofundar

- Para evitar alteração do ID e entender melhor o fluxo de atualização de recursos:  
  https://youtu.be/RSZHvQomeKE (vídeo sobre fundamentos de API REST e Express.js)

- Para organizar rotas e evitar conflitos entre rotas dinâmicas e estáticas:  
  https://expressjs.com/pt-br/guide/routing.html

- Para validação de dados e tratamento de erros com Zod e Express:  
  https://youtu.be/yNDCRAz7CM8?si=Lh5u3j27j_a4w3A_

- Para manipulação correta de query parameters e ordenação:  
  https://youtu.be/--TQwiNIw28

- Para entender melhor o uso de arrays e métodos como `filter` e `sort`:  
  https://youtu.be/glSgUKA5LjE?si=t9G2NsC8InYAU9cI

---

## 📝 Resumo rápido dos pontos para focar

- 🔒 **Evitar alteração do campo `id` em PUT/PATCH para agentes e casos.** Garanta remoção ou ignorância do `id` no corpo da requisição e no repositório.

- 🚦 **Organizar a ordem das rotas para evitar conflitos entre rotas dinâmicas e estáticas, principalmente `/casos/:id` e `/casos/search` ou `/casos/:caso_id/agente`.**

- 🔢 **Converter o parâmetro de ordenação `sort` para número antes de usar na função de ordenação.**

- 📝 **Revisar mensagens de erro customizadas para garantir que estejam completas e consistentes em todos os endpoints.**

- 🧹 **Remover trechos de código "gambiarras" como `if (req.params.id.includes("search"))` e resolver isso via ordem correta das rotas.**

---

## Finalizando...

Você está com uma base muito sólida e um código bem organizado, gabubits! 👏 Com esses ajustes finos, sua API vai ficar ainda mais robusta e alinhada com as melhores práticas. Continue assim, estudando e aprimorando, que você vai longe! 🚀

Se precisar, volte aqui para conversarmos mais sobre essas melhorias, vou adorar ajudar! ✨

Um abraço e bons códigos! 👊😄

> Caso queira tirar uma dúvida específica, entre em contato com o Chapter no nosso [discord](https://discord.gg/DryuHVnz).



---
<sup>Made By the Autograder Team.</sup><br>&nbsp;&nbsp;&nbsp;&nbsp;<sup><sup>- [Arthur Carvalho](https://github.com/ArthurCRodrigues)</sup></sup><br>&nbsp;&nbsp;&nbsp;&nbsp;<sup><sup>- [Arthur Drumond](https://github.com/drumondpucminas)</sup></sup><br>&nbsp;&nbsp;&nbsp;&nbsp;<sup><sup>- [Gabriel Resende](https://github.com/gnvr29)</sup></sup>