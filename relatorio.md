<sup>Esse é um feedback gerado por IA, ele pode conter erros.</sup>

Você tem 3 créditos restantes para usar o sistema de feedback AI.

# Feedback para gabubits:

Nota final: **95.6/100**

# Feedback do seu desafio da API do Departamento de Polícia 🚨✨

Olá, gabubits! Tudo bem? 😄 Parabéns pelo empenho e pela entrega do seu projeto! Você fez um trabalho muito sólido, e isso é visível logo de cara! Vamos conversar um pouco sobre o que você mandou, destacando os pontos fortes e também algumas oportunidades para deixar sua API ainda mais incrível! 💪🚀

---

## 🎉 Pontos Fortes que Merecem Aplausos

- Você implementou com sucesso todos os métodos HTTP essenciais para os recursos `/agentes` e `/casos` (GET, POST, PUT, PATCH, DELETE). Isso é fundamental e está muito bem feito! 👏
- A organização do seu código está excelente, seguindo a arquitetura modular com rotas, controllers e repositories, exatamente como esperado. Isso facilita muito a manutenção e escalabilidade do projeto. 📁➡️📂
- As validações de dados com o Zod estão muito bem utilizadas, tratando erros de forma clara e consistente com status HTTP corretos (400, 404, etc). Isso mostra cuidado com a integridade dos dados e a experiência do cliente da API. 🛡️
- Você conseguiu implementar filtros simples para os casos por status e agente, que são funcionalidades bônus muito legais. Isso mostra que você foi além do básico e está pensando em usabilidade da API. 👏🎯

---

## 🕵️‍♂️ Análise Detalhada dos Pontos que Podem Melhorar

### 1. Penalidade: Permite alteração do campo `id` nos recursos `agente` e `caso` via PUT

👀 Ao analisar suas funções de atualização nos controllers, percebi que você está **deletando o campo `id` do payload** antes de atualizar o objeto no repositório, o que é ótimo, porém o problema está dentro do repositório, no método `atualizarAgente` e `atualizarCaso`.

Veja o trecho do `agentesRepository.js`:

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

E no `casosRepository.js`:

```js
export function atualizarCaso(id, dados) {
  const index_caso = casosRepository.findIndex((caso) => caso.id === id);

  if (index_caso === -1) return undefined;

  for (const chave of Object.keys(dados)) {
    if (chave !== "id") casosRepository[index_caso][chave] = dados[chave];
  }

  return casosRepository[index_caso];
}
```

Na teoria, isso impede a alteração do `id`, mas na prática, o problema está no seu controller, especificamente no método `atualizarCaso`:

```js
if (body_parse.data.agente_id) {
  const agente_existe = obterUmAgente(body_parse.data.agente_id);

  if (!agente_existe)
    throw new Errors.IdNotFoundError({
      agente_id: `O agente_id '${body_parse.data.agente_id}' não existe nos agentes`,
    });
}
```

Você não está removendo o campo `id` do corpo do request antes de passar para o repositório para atualização, enquanto no controller de agentes você faz `delete body_parse.data.id;`. Isso pode permitir que um `id` seja alterado caso venha no payload.

**Como corrigir?**  
No controller de casos, logo após validar o corpo da requisição, faça:

```js
delete body_parse.data.id;
```

antes de chamar o método `atualizarCaso`. Isso garante que o campo `id` nunca será alterado, mesmo que o cliente envie.

---

### 2. Falha na implementação dos endpoints bônus de filtragem e busca avançada

Você implementou corretamente os filtros simples para casos por `status` e `agente_id`, o que é ótimo! 👍

No entanto, percebi que os seguintes endpoints bônus ainda precisam de ajustes para funcionarem corretamente:

- **GET /casos/:caso_id/agente** — Buscar o agente responsável por um caso
- **GET /casos/search?q=keyword** — Buscar casos por palavras-chave no título ou descrição
- **Ordenação de agentes por data de incorporação (asc e desc)**

Ao analisar seu código, vejo que você já tem as funções para o endpoint `/casos/:caso_id/agente` no controller:

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

Porém, no seu arquivo de rotas `casosRoutes.js`, o endpoint está declarado assim:

```js
router.get("/casos/:caso_id/agente", casosController.obterAgenteDoCaso);
```

O problema está na função `obterUmAgente` que você está importando de `../repositories/agentesRepository.js` dentro do controller `casosController.js`:

```js
import { obterUmAgente } from "../repositories/agentesRepository.js";
```

Mas a função `obterUmAgente` **retorna o agente diretamente**, não uma Promise ou callback, o que está correto. O problema é que você está chamando essa função diretamente, mas ela pode retornar `undefined` se o agente não existir, o que você trata corretamente.

O detalhe que observei é que no controller você está usando `obterUmAgente` da forma correta, mas no repositório de agentes, essa função está assim:

```js
export function obterUmAgente(id) {
  return agentesRepository.find((agente) => agente.id === id);
}
```

Tudo certo aqui. Então, o problema pode estar em algum detalhe do `caso_id` que você recebe na rota.

**Sugestão:** Verifique se o parâmetro da rota está sendo interpretado corretamente. Por exemplo, no seu schema `casoIdSchema` você espera o parâmetro como `caso_id`, e na rota você declarou:

```js
router.get("/casos/:caso_id/agente", casosController.obterAgenteDoCaso);
```

Mas no controller, você usa:

```js
const caso_id_parse = casoIdSchema.safeParse(req.params);
```

E depois:

```js
const caso_encontrado = casosRepository.obterUmCaso(caso_id_parse.data.caso_id);
```

Ou seja, está correto.

**Porém, no repositório de casos, a função `obterUmCaso` usa `id` como parâmetro:**

```js
export function obterUmCaso(id) {
  return casosRepository.find((caso) => caso.id === id);
}
```

Isso está coerente.

**Então, o problema pode estar no fato de que você está usando um array chamado `casosRepository` que é uma variável `let` e você a está reatribuindo no método `apagarCasosDeAgente`:**

```js
export function apagarCasosDeAgente(agente_id) {
  casosRepository = casosRepository.filter(
    (caso) => caso.agente_id !== agente_id
  );
}
```

Isso pode causar problemas de referência em outras partes do código, já que você está reatribuindo o array ao invés de modificar ele diretamente. Isso pode causar inconsistências na busca de casos e agentes.

**Como melhorar?**  
Use `splice` para modificar o array in-place, assim:

```js
export function apagarCasosDeAgente(agente_id) {
  for (let i = casosRepository.length - 1; i >= 0; i--) {
    if (casosRepository[i].agente_id === agente_id) {
      casosRepository.splice(i, 1);
    }
  }
}
```

Isso evita que outras referências ao array fiquem desatualizadas.

---

### 3. Ordenação de agentes por data de incorporação (bônus)

Você tem as funções no repositório para ordenar agentes por data de incorporação ascendente e descendente:

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

No controller você faz o seguinte para o endpoint `/agentes?sort=1` ou `/agentes?sort=-1`:

```js
export function obterAgentesSort(req, res, next) {
  if (!req.query.sort) return next();
  try {
    const sort_parse = sortSchema.safeParse(req.query);

    if (!sort_parse.success)
      throw new Errors.InvalidQueryError(
        z.flattenError(sort_parse.error).fieldErrors
      );

    const sort = sort_parse.data.sort;

    let agentes_encontrados;

    if (sort === 1) {
      agentes_encontrados =
        agentesRepository.obterAgentesOrdenadosPorDataIncorpAsc();
    }

    if (sort === -1) {
      agentes_encontrados =
        agentesRepository.obterAgentesOrdenadosPorDataIncorpDesc();
    }

    res.status(200).json(agentes_encontrados);
  } catch (e) {
    next(e);
  }
}
```

**Aqui o problema está no uso do nome `agentesRepository` dentro do controller, que está importado como:**

```js
import * as agentesRepository from "../repositories/agentesRepository.js";
```

Mas você está chamando `agentesRepository.obterAgentesOrdenadosPorDataIncorpAsc()`, que está correto.

Então, o problema pode estar no schema `sortSchema` que valida o query param `sort`. Se ele não estiver aceitando números corretamente, o filtro não funciona.

Verifique seu schema `sortSchema` em `utils/schemas.js`. Ele deve aceitar valores numéricos `1` e `-1` como números, e não como strings.

Se o query param chega como string (`"1"` ou `"-1"`), o Zod pode rejeitar.

**Como resolver?**  
No schema, permita coerção para número:

```js
import { z } from "zod";

export const sortSchema = z.object({
  sort: z.preprocess((val) => Number(val), z.enum([1, -1])),
});
```

Ou use `z.coerce.number()` (se sua versão do Zod permitir):

```js
export const sortSchema = z.object({
  sort: z.coerce.number().refine((val) => val === 1 || val === -1),
});
```

Isso garante que o valor vindo da query string será convertido para número antes da validação.

---

### 4. Organização da Estrutura de Diretórios

Sua estrutura está muito bem organizada e segue o padrão esperado:

```
.
├── controllers
│   ├── agentesController.js
│   └── casosController.js
├── routes
│   ├── agentesRoutes.js
│   └── casosRoutes.js
├── repositories
│   ├── agentesRepository.js
│   └── casosRepository.js
├── utils
│   ├── errorHandler.js
│   └── schemas.js
├── docs
│   └── swagger.js
├── server.js
├── package.json
```

Perfeito! Isso facilita muito a leitura e manutenção do projeto. Continue assim! 🎯

---

## 📚 Recursos para você aprimorar ainda mais

- Para evitar alterações indevidas do `id` ao atualizar recursos, recomendo revisar conceitos de manipulação segura de dados em APIs REST:  
  https://developer.mozilla.org/pt-BR/docs/Web/HTTP/Status/400  
  https://youtu.be/yNDCRAz7CM8?si=Lh5u3j27j_a4w3A_

- Para entender melhor como validar e transformar query params com Zod e evitar erros de tipo:  
  https://zod.dev/?id=preprocess

- Para manipulação correta de arrays em memória, especialmente para remoção sem perder referências:  
  https://youtu.be/glSgUKA5LjE?si=t9G2NsC8InYAU9cI

- Para aprofundar nos conceitos de rotas, controllers e arquitetura MVC em Node.js com Express:  
  https://youtu.be/bGN_xNc4A1k?si=Nj38J_8RpgsdQ-QH

---

## 📝 Resumo rápido para focar na próxima rodada

- ⚠️ Garanta que o campo `id` **nunca seja alterado** no PUT/PATCH, deletando-o do payload em todos os controllers antes de atualizar o repositório.
- ⚠️ Evite reatribuir arrays do repositório (como em `casosRepository = ...`), prefira modificar o array in-place para manter a referência correta.
- ⚠️ Ajuste o schema de validação do query param `sort` para aceitar números vindos da query string (que são strings por padrão).
- ⚠️ Revise a implementação dos endpoints bônus `/casos/:caso_id/agente` e `/casos/search` para garantir que o fluxo de dados e validações estejam corretos.
- ✅ Continue mantendo a estrutura modular do projeto, com controllers, rotas e repositórios bem separados.
- ✅ Continue usando o Zod para validações e tratamento de erros personalizados — isso é um diferencial!

---

## Finalizando

Gabubits, você está muito no caminho certo! Seu código está limpo, organizado, e você já domina vários conceitos importantes de APIs RESTful. Com pequenos ajustes nas validações e manipulação dos dados, seu projeto ficará ainda mais robusto e completo. 🚀

Continue assim, explorando os detalhes e buscando sempre entender o porquê de cada parte do código funcionar (ou não). Isso vai te levar longe! Se precisar de ajuda, estarei por aqui para bater um papo e te ajudar a destravar qualquer dúvida. 😉

Bons códigos e até a próxima! 👊✨

---

Se quiser dar uma revisada geral em conceitos de API REST com Express, recomendo este vídeo que é super didático:  
https://youtu.be/RSZHvQomeKE

Você está arrasando! 🎉👏

> Caso queira tirar uma dúvida específica, entre em contato com o Chapter no nosso [discord](https://discord.gg/DryuHVnz).



---
<sup>Made By the Autograder Team.</sup><br>&nbsp;&nbsp;&nbsp;&nbsp;<sup><sup>- [Arthur Carvalho](https://github.com/ArthurCRodrigues)</sup></sup><br>&nbsp;&nbsp;&nbsp;&nbsp;<sup><sup>- [Arthur Drumond](https://github.com/drumondpucminas)</sup></sup><br>&nbsp;&nbsp;&nbsp;&nbsp;<sup><sup>- [Gabriel Resende](https://github.com/gnvr29)</sup></sup>