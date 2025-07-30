<sup>Esse é um feedback gerado por IA, ele pode conter erros.</sup>

Você tem 5 créditos restantes para usar o sistema de feedback AI.

# Feedback para gabubits:

Nota final: **95.6/100**

# Feedback para gabubits 🚓✨

Olá, gabubits! Primeiro, parabéns pelo excelente trabalho! 🎉 Você entregou uma API bem estruturada, com rotas, controladores e repositórios organizados, além de implementar os métodos HTTP essenciais para os recursos `/agentes` e `/casos`. Seu tratamento de erros está muito bom, e é visível o cuidado que você teve com validações usando o Zod — isso é fundamental para garantir a robustez da API. 👏

Além disso, você conseguiu implementar alguns bônus importantes, como a filtragem de casos por status e agente, o que mostra que você está indo além do básico e buscando entregar uma solução mais completa. Isso é sensacional! 🚀

---

## 🕵️ Análise detalhada e pontos de atenção

### 1. Penalidades: Alteração do ID em métodos PUT

Um ponto que chamou atenção (e que gerou desconto) foi a possibilidade de alterar o campo `id` tanto de agentes quanto de casos via método PUT. Isso é um problema fundamental, pois o `id` deve ser imutável, já que ele é a chave única que identifica cada recurso.

No seu código, notei que no `controllers/agentesController.js`, na função `atualizarAgente`, você faz:

```js
delete body_parse.data.id;

const agente_atualizado = agentesRepository.atualizarAgente(
  id_parse.data.id,
  body_parse.data
);
```

E no repositório:

```js
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
```

Aqui, você está **deletando o `id` do corpo da requisição** antes de atualizar, o que é ótimo para evitar alteração direta, mas o problema é que o Zod, na validação do schema, permite que o `id` esteja presente e seja modificado. Ou seja, o cliente pode enviar um `id` diferente, e o sistema só ignora depois, mas isso pode causar confusão.

O ideal é que o schema de validação para o método PUT **não permita o campo `id` no corpo da requisição**. Assim, o cliente nem consegue enviar o `id` para alterar.

O mesmo acontece no `controllers/casosController.js` e no repositório `casosRepository.js`.

---

### Como corrigir?

No seu schema Zod para PUT (ex: `agenteSchema` e `casoSchema`), remova ou torne o campo `id` **proibido** ou **omitido** para que o corpo da requisição não aceite esse campo.

Por exemplo, no seu arquivo `schemas.js`, para o agente:

```js
import { z } from "zod";

export const agenteSchema = z.object({
  // NÃO incluir o campo id aqui!
  nome: z.string(),
  cargo: z.string(),
  dataDeIncorporacao: z.string().refine(date => !isNaN(Date.parse(date)), {
    message: "Data inválida",
  }),
  // outros campos...
});
```

Dessa forma, se o cliente enviar o campo `id`, o Zod vai rejeitar a requisição com erro 400, evitando a alteração indevida.

---

### 2. Falha no endpoint de busca do agente responsável pelo caso (`GET /casos/:caso_id/agente`)

Você implementou a rota e o controlador para buscar o agente responsável por um caso:

```js
// routes/casosRoutes.js
router.get("/casos/:caso_id/agente", casosController.obterAgenteDoCaso);
```

E no controlador:

```js
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
        id: `O ID '${caso_id_parse.data.caso_id}' não existe nos casos`,
      });

    const { agente_id } = caso_encontrado;

    const agente_existe = obterUmAgente(agente_id);

    if (!agente_existe)
      throw new Errors.IdNotFoundError({
        agente_id: `O agente_id '${agente_id}' não existe nos agentes`,
      });

    res.status(200).json(agente_existe);
  } catch (e) {
    next(e);
  }
}
```

Porém, notei que você importou `obterUmAgente` do repositório de agentes assim:

```js
import { obterUmAgente } from "../repositories/agentesRepository.js";
```

Mas, ao analisar o arquivo `repositories/agentesRepository.js`, essa função está exportada como:

```js
export function obterUmAgente(id) {
  return agentesRepository.find((agente) => agente.id === id);
}
```

Até aqui, tudo certo. Porém, na função `obterAgenteDoCaso`, você chamou:

```js
const agente_existe = obterUmAgente(agente_id);
```

E depois faz:

```js
if (!agente_existe)
  throw new Errors.IdNotFoundError({
    agente_id: `O agente_id '${agente_id}' não existe nos agentes`,
  });

res.status(200).json(agente_existe);
```

O que pode estar acontecendo é que, dependendo do valor de `agente_existe`, ele pode ser `undefined` se o agente não existir, e isso está correto. Mas se o agente existir, você retorna ele.

O problema é que o teste de bônus que verifica esse endpoint falhou, o que indica que talvez a rota não esteja sendo corretamente reconhecida, ou que o middleware de roteamento esteja conflitando.

**Uma hipótese importante:** No seu controlador `obterUmCaso`, você tem esse trecho:

```js
if (req.params.id.includes("search")) {
  return next();
}
```

Isso é para evitar conflito com a rota `/casos/search`, o que é ótimo. Mas pode ser que, na ordem das rotas, o Express esteja confundindo `/casos/:id` com `/casos/:caso_id/agente`.

No seu arquivo de rotas `routes/casosRoutes.js`, a ordem está assim:

```js
router.get("/casos", casosController.obterCasos);

router.get("/casos/:caso_id/agente", casosController.obterAgenteDoCaso);

router.get("/casos/search", casosController.pesquisarCasos);

router.get("/casos/:id", casosController.obterUmCaso);
```

Aqui, a rota `/casos/:caso_id/agente` está antes de `/casos/:id`, o que é correto para evitar conflito.

Se você está recebendo erros no bônus dessa funcionalidade, vale a pena verificar se o parâmetro de rota está correto (ex: `caso_id` no schema e no controlador) e se o `casoIdSchema` está validando corretamente.

---

### 3. Falha na busca por palavras-chave nos casos (`GET /casos/search?q=...`)

Você implementou o endpoint de busca por termo na query:

```js
router.get("/casos/search", casosController.pesquisarCasos);
```

No controlador, a função `pesquisarCasos` está assim:

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

No repositório, a função `pesquisarCasos` está correta, fazendo o filtro por título e descrição.

Se o bônus falhou aqui, pode ser que o schema `searchQuerySchema` não esteja validando corretamente o parâmetro `q`, ou que o cliente esteja enviando uma query string diferente.

Recomendo verificar seu schema `searchQuerySchema` para garantir que ele exija o parâmetro `q` como string não vazia.

---

### 4. Falha na filtragem dos agentes por data de incorporação com ordenação (sort)

Você implementou os métodos no repositório para ordenar agentes por data de incorporação, tanto ascendente quanto descendente:

```js
export function obterAgentesOrdenadosPorDataIncorpAsc() {
  return agentesRepository.slice().sort((agente1, agente2) => {
    const dIncorpA1 = new Date(agente1.dataDeIncorporacao).getTime();
    const dIncorpA2 = new Date(agente2.dataDeIncorporacao).getTime();

    return dIncorpA1 - dIncorpA2;
  });
}

export function obterAgentesOrdenadosPorDataIncorpDesc() {
  return agentesRepository.slice().sort((agente1, agente2) => {
    const dIncorpA1 = new Date(agente1.dataDeIncorporacao).getTime();
    const dIncorpA2 = new Date(agente2.dataDeIncorporacao).getTime();

    return dIncorpA2 - dIncorpA1;
  });
}
```

No controlador `obterAgentes`, você chama essas funções dependendo do valor do `sort`:

```js
if (sort === 1) {
  agentes_encontrados =
    agentesRepository.obterAgentesOrdenadosPorDataIncorpAsc();
}

if (sort === -1) {
  agentes_encontrados =
    agentesRepository.obterAgentesOrdenadosPorDataIncorpDesc();
}
```

O problema pode estar no tipo do valor `sort` vindo da query string, que sempre é uma string. Então, `req.query.sort` será `"1"` ou `"-1"`, e a comparação `sort === 1` (número) falha.

**Solução:** Converter o valor para número antes da comparação.

Exemplo:

```js
const sortValue = Number(sort);

if (sortValue === 1) {
  agentes_encontrados =
    agentesRepository.obterAgentesOrdenadosPorDataIncorpAsc();
}

if (sortValue === -1) {
  agentes_encontrados =
    agentesRepository.obterAgentesOrdenadosPorDataIncorpDesc();
}
```

Ou ajustar o schema `agentesQuerySchema` para já fazer essa conversão.

Esse detalhe simples pode estar impedindo a filtragem funcionar corretamente.

---

### 5. Mensagens de erro customizadas para IDs inválidos

Os bônus que falharam indicam que as mensagens de erro customizadas para IDs inválidos (de agentes e casos) não estão 100% implementadas.

No seu código, você usa classes de erro customizadas, como `InvalidIdError` e `IdNotFoundError`, e utiliza o Zod para validar os IDs.

Isso está ótimo! Porém, para garantir que as mensagens fiquem bem claras, você pode revisar seu `utils/errorHandler.js` para verificar se está formatando os erros de forma amigável e consistente.

Também vale a pena garantir que, ao lançar erros, você sempre passe uma mensagem clara, como:

```js
throw new Errors.IdNotFoundError({
  id: `O ID '${id_parse.data.id}' não existe nos agentes`,
});
```

Se a API estiver retornando mensagens genéricas, o cliente pode não entender o motivo do erro.

---

### 6. Estrutura do projeto

Sua estrutura de diretórios está organizada conforme o esperado:

```
.
├── controllers/
├── docs/
├── repositories/
├── routes/
├── server.js
├── package.json
└── utils/
```

Isso é perfeito e ajuda muito na manutenção e escalabilidade do projeto. Continue assim! 👍

---

## 📚 Recomendações de aprendizado para você

- Para reforçar a imutabilidade do campo `id` e validação de schemas:  
  [Validação de dados em APIs Node.js/Express com Zod](https://youtu.be/yNDCRAz7CM8?si=Lh5u3j27j_a4w3A_)

- Para entender melhor o roteamento no Express e evitar conflitos entre rotas com parâmetros:  
  [Documentação oficial do Express sobre roteamento](https://expressjs.com/pt-br/guide/routing.html)

- Para aprender a manipular query strings e converter tipos corretamente:  
  [Manipulação de Requisições e Respostas no Express](https://youtu.be/--TQwiNIw28)

- Para compreender melhor os códigos HTTP e suas aplicações (400, 404, 201, 204):  
  [Códigos HTTP - MDN](https://developer.mozilla.org/pt-BR/docs/Web/HTTP/Status)

---

## 📋 Resumo dos principais pontos para focar

- **Não permita alteração do campo `id` no corpo das requisições PUT/PATCH**: remova o campo `id` do schema de validação para evitar que o cliente envie e tente alterar o ID.

- **Corrija a conversão do parâmetro `sort` para número** antes de fazer comparações no filtro de agentes.

- **Revise o schema de validação para a query `q` no endpoint de busca de casos**, garantindo que a query seja obrigatória e não vazia.

- **Verifique o middleware de tratamento de erros para garantir mensagens claras e customizadas** para IDs inválidos ou não encontrados.

- **Confirme que os parâmetros de rota (`caso_id`, `id`) estejam consistentes entre rotas, controladores e schemas**, para evitar conflitos ou falhas nas rotas.

---

Gabubits, você está no caminho certo! Seu código está muito bem estruturado e você já domina conceitos importantes de API REST, Express.js, validação e tratamento de erros. Com os ajustes que conversamos, sua API vai ficar ainda mais robusta e profissional. Continue nessa pegada, você vai longe! 🚀💪

Se precisar de ajuda para implementar algum desses pontos, me chama aqui que a gente resolve juntos! 😉

Boa codada! 👊✨

> Caso queira tirar uma dúvida específica, entre em contato com o Chapter no nosso [discord](https://discord.gg/DryuHVnz).



---
<sup>Made By the Autograder Team.</sup><br>&nbsp;&nbsp;&nbsp;&nbsp;<sup><sup>- [Arthur Carvalho](https://github.com/ArthurCRodrigues)</sup></sup><br>&nbsp;&nbsp;&nbsp;&nbsp;<sup><sup>- [Arthur Drumond](https://github.com/drumondpucminas)</sup></sup><br>&nbsp;&nbsp;&nbsp;&nbsp;<sup><sup>- [Gabriel Resende](https://github.com/gnvr29)</sup></sup>