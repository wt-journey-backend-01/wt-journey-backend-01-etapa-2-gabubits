<sup>Esse é um feedback gerado por IA, ele pode conter erros.</sup>

Você tem 9 créditos restantes para usar o sistema de feedback AI.

# Feedback para gabubits:

Nota final: **78.6/100**

Olá, gabubits! 👋🚀

Primeiramente, parabéns pelo empenho e pelo que você já conquistou nesse desafio! 🎉 Construir uma API RESTful com Node.js e Express.js não é tarefa fácil, e você já fez um ótimo trabalho implementando os endpoints básicos para os recursos `/agentes` e `/casos`, com suas rotas, controladores e repositórios bem organizados. Também mandou muito bem ao implementar filtros simples e o tratamento de erros personalizados em vários pontos. Isso mostra que você está no caminho certo! 👏

---

## 🎯 O que você já acertou e merece destaque

- Sua **estrutura de pastas e arquivos** está muito bem organizada, seguindo o modelo esperado com rotas, controllers, repositories, utils e docs separados. Isso facilita muito a manutenção e escalabilidade do projeto.
- Os endpoints principais de `/agentes` e `/casos` estão todos implementados, com métodos HTTP variados (GET, POST, PUT, PATCH, DELETE).
- Você tratou muito bem as validações usando o Zod, com schemas claros e consistentes.
- O tratamento de erros personalizados está presente, e você usou middlewares para capturar erros e rotas não encontradas.
- Os filtros simples para casos por status e agente estão funcionando corretamente.
- Implementou a documentação Swagger, o que é um diferencial muito legal para APIs.

---

## 🕵️‍♂️ Analisando os pontos que precisam de atenção

Agora, vamos conversar sobre alguns detalhes que impactaram o funcionamento da sua API, para que você possa destravar esses pontos e deixar sua aplicação ainda mais robusta. Vou explicar com calma para você entender a raiz do problema e como corrigir.

---

### 1. Problema ao criar agentes e atualizar com PUT/PATCH: ID sendo alterável e validação de data de incorporação

Você mencionou que os testes de criação do agente e atualização com PUT e PATCH falharam, e há uma penalidade relacionada a permitir que o ID do agente seja alterado e que a data de incorporação possa ser uma data futura.

**O que eu vi no seu código:**

No arquivo `controllers/agentesController.js`, no método `atualizarAgente`, você faz a validação do corpo da requisição com o schema `agenteSchema` ou `agentePatchSchema`. Porém, não há nenhuma restrição explícita para impedir que o campo `id` seja enviado e alterado.

Além disso, no seu schema (que está em `utils/schemas.js`, não enviado aqui), provavelmente o campo `dataDeIncorporacao` não está validando se a data é anterior ou igual à data atual, permitindo datas no futuro.

**Por que isso é um problema?**

- O campo `id` deve ser gerenciado internamente pelo sistema, nunca alterado pelo cliente. Permitir que o ID seja modificado pode corromper a integridade dos dados.
- Permitir datas futuras para `dataDeIncorporacao` não faz sentido no contexto, pois um agente não pode ser incorporado no futuro. Isso pode gerar inconsistências na sua base de dados.

**Como corrigir?**

- No controlador, antes de atualizar, remova o campo `id` do objeto de dados que será usado para atualizar, para garantir que ele não seja alterado.
- No schema do agente, adicione uma validação que impeça datas futuras para `dataDeIncorporacao`.

Exemplo para impedir alteração do id no controller:

```js
// Antes de atualizar, remova o campo id para evitar alterações
delete body_parse.data.id;
```

Exemplo de validação de data no Zod (no seu schema):

```js
import { z } from "zod";

const agenteSchema = z.object({
  // outros campos...
  dataDeIncorporacao: z
    .string()
    .refine((date) => new Date(date) <= new Date(), {
      message: "A data de incorporação não pode ser no futuro",
    }),
  // ...
});
```

**Recomendo fortemente que você assista a este vídeo para entender melhor validação de dados em APIs com Node.js e Express:**

👉 [Validação de dados em APIs Node.js/Express](https://youtu.be/yNDCRAz7CM8?si=Lh5u3j27j_a4w3A_)

---

### 2. Falha ao criar caso com `agente_id` inválido/inexistente

Você implementou o endpoint para criar casos (`POST /casos`), mas o sistema não está retornando o status 404 quando o `agente_id` informado não existe. Isso indica que a validação da existência do agente não está funcionando corretamente.

**O que eu encontrei no seu código:**

No `controllers/casosController.js`, dentro da função `criarCaso`, você faz a verificação:

```js
const agente_existe = obterUmAgente(body_parse.data.agente_id);

if (!agente_existe)
  throw new Errors.IdNotFoundError({
    agente_id: `O agente_id '${body_parse.data.agente_id}' não existe nos agentes`,
  });
```

Porém, a função `obterUmAgente` que você importou está vindo do `repositories/agentesRepository.js`, e olhando lá, a função é síncrona e retorna o agente ou undefined.

O problema pode estar na forma como você está importando ou usando essa função. No seu código você fez:

```js
import { obterUmAgente } from "../repositories/agentesRepository.js";
```

Mas em `controllers/casosController.js` você tem essa linha no topo:

```js
import { obterUmAgente } from "../repositories/agentesRepository.js";
```

No entanto, no começo do arquivo, você fez:

```js
import { obterUmAgente } from "../repositories/agentesRepository.js";
import * as casosRepository from "../repositories/casosRepository.js";
```

Tudo certo até aqui.

O problema pode estar que a função `obterUmAgente` está retornando `undefined` mesmo quando o agente existe, ou você está passando um `agente_id` inválido.

**Possível causa raiz:**

- O `obterUmAgente` retorna o agente se encontrar, ou `undefined` se não. Mas no seu código, quando você chama `obterUmAgente(body_parse.data.agente_id)` dentro do controller, pode ser que o `agente_id` venha mal formatado ou errado.
- Outra possibilidade: o `obterUmAgente` está funcionando, mas você não está tratando o caso em que o agente não existe corretamente, ou a validação do ID não está acontecendo antes.

**Sugestão para reforçar a validação:**

Antes de tentar criar o caso, valide o formato do `agente_id` (UUID) e depois verifique se o agente existe:

```js
import { agenteIdSchema } from "../utils/schemas.js"; // ou idSchema, conforme seu esquema

// Dentro do criarCaso
const agenteIdParse = agenteIdSchema.safeParse(body_parse.data.agente_id);
if (!agenteIdParse.success) {
  throw new Errors.InvalidIdError({
    agente_id: "Formato de agente_id inválido",
  });
}

const agente_existe = obterUmAgente(body_parse.data.agente_id);
if (!agente_existe) {
  throw new Errors.IdNotFoundError({
    agente_id: `O agente_id '${body_parse.data.agente_id}' não existe nos agentes`,
  });
}
```

Assim você garante que IDs inválidos já são rejeitados antes de tentar buscar no repositório.

---

### 3. Falhas em endpoints de busca e filtros avançados

Você conseguiu implementar os filtros simples, como filtrar casos por status e agente, mas os testes indicam que:

- O endpoint para buscar o agente responsável por um caso (`GET /casos/:caso_id/agente`) não está funcionando corretamente.
- A busca por keywords no título e descrição dos casos (`GET /casos/search?q=...`) também não está funcionando.
- O filtro de agentes por data de incorporação com ordenação crescente e decrescente não está correto.
- As mensagens de erro customizadas para argumentos inválidos não estão completas.

**Vamos olhar alguns detalhes no seu código:**

#### a) Endpoint `/casos/:caso_id/agente`

No `routes/casosRoutes.js`:

```js
router.get("/casos/:caso_id/agente", casosController.obterAgenteDoCaso);
```

No `controllers/casosController.js`:

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
        id: `O ID '${id}' não existe nos casos`,
      });

    const { agente_id } = caso_encontrado;

    res.status(200).json(obterUmAgente(agente_id));
  } catch (e) {
    next(e);
  }
}
```

**Problema aqui:**

- A variável `id` usada na mensagem de erro não está definida. Você está usando `id` em:

```js
if (!caso_encontrado)
  throw new Errors.IdNotFoundError({
    id: `O ID '${id}' não existe nos casos`,
  });
```

Mas deveria usar `caso_id_parse.data.caso_id` ou algo assim.

- Além disso, a função `obterUmAgente(agente_id)` retorna um objeto, mas você está retornando diretamente sem verificar se o agente existe. O correto é validar e tratar o caso de agente não encontrado.

**Correção sugerida:**

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
    const agente = obterUmAgente(agente_id);

    if (!agente)
      throw new Errors.IdNotFoundError({
        agente_id: `O agente_id '${agente_id}' não existe nos agentes`,
      });

    res.status(200).json(agente);
  } catch (e) {
    next(e);
  }
}
```

---

#### b) Busca por keywords em `/casos/search`

Você implementou o endpoint e o método `pesquisarCasos` no repositório, mas a busca não está funcionando corretamente porque o termo de busca não está sendo transformado para lowercase, ou a comparação está errada.

No seu repositório:

```js
export function pesquisarCasos(termo) {
  return casosRepository.filter(
    ({ titulo, descricao }) =>
      titulo.toLowerCase().search(termo) !== -1 ||
      descricao.toLowerCase().search(termo) !== -1
  );
}
```

**Problema:**

- Você está usando `search(termo)` sem transformar `termo` para lowercase, então a busca pode falhar se o termo tiver letras maiúsculas.
- Além disso, o método `search` retorna o índice da ocorrência ou -1, mas o ideal é usar `includes` para simplificar.

**Sugestão de correção:**

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

---

#### c) Ordenação de agentes por data de incorporação

No repositório de agentes, você fez:

```js
export function obterAgentesOrdenadosPorDataIncorp(ordem) {
  return agentesRepository.toSorted(
    (agente1, agente2) =>
      ordem *
      (Date.parse(agente1.dataDeIncorporacao) -
        Date.parse(agente2.dataDeIncorporacao))
  );
}
```

**Problema:**

- O parâmetro `ordem` está sendo usado diretamente como multiplicador, mas não está claro se ele é um número (1 ou -1) ou uma string.
- Se o parâmetro `sort` na query for uma string como "asc" ou "desc", isso não vai funcionar.
- Além disso, o método `toSorted` é relativamente novo e pode não estar disponível em algumas versões do Node.js.

**Sugestão:**

- Converta o parâmetro `sort` para um valor numérico (1 para ascendente, -1 para descendente).
- Use o método `.slice().sort()` para garantir compatibilidade.

Exemplo:

```js
export function obterAgentesOrdenadosPorDataIncorp(ordem) {
  const ordemNum = ordem === "asc" ? 1 : ordem === "desc" ? -1 : 1;
  return agentesRepository
    .slice()
    .sort(
      (a, b) =>
        ordemNum *
        (Date.parse(a.dataDeIncorporacao) - Date.parse(b.dataDeIncorporacao))
    );
}
```

---

#### d) Mensagens de erro customizadas para argumentos inválidos

Vi que você está usando o Zod e criando erros personalizados, mas algumas mensagens não estão usando os dados corretos, como no exemplo do endpoint `/casos/:caso_id/agente` que mencionei acima.

Preste atenção especial para usar as variáveis corretas nas mensagens de erro, para que o cliente da API entenda exatamente o que está errado.

---

## 📚 Recursos recomendados para você

- Para entender melhor como validar dados e evitar alterações indevidas no ID, veja:  
  https://youtu.be/yNDCRAz7CM8?si=Lh5u3j27j_a4w3A_  
- Para organizar suas rotas e entender o fluxo do Express.js:  
  https://expressjs.com/pt-br/guide/routing.html  
- Para manipulação correta de arrays e ordenação:  
  https://youtu.be/glSgUKA5LjE?si=t9G2NsC8InYAU9cI  
- Para entender e aplicar corretamente os status HTTP 400 e 404:  
  https://developer.mozilla.org/pt-BR/docs/Web/HTTP/Status/400  
  https://developer.mozilla.org/pt-BR/docs/Web/HTTP/Status/404  

---

## 🗺️ Resumo dos principais pontos para focar

- **Impedir alteração do campo `id` em PUT/PATCH** nos agentes e casos, removendo o campo do corpo antes da atualização.
- **Validar que `dataDeIncorporacao` não seja uma data futura**, usando refinamento no schema Zod.
- **Garantir que o `agente_id` passado para criação/atualização de casos exista** e que o formato do ID seja válido.
- Corrigir variáveis usadas nas mensagens de erro para que reflitam o valor correto (ex: usar `caso_id` e não `id` indefinido).
- Ajustar a função de busca por keywords para usar `includes` com tratamento de caixa (lowercase).
- Ajustar a ordenação por data de incorporação para interpretar o parâmetro de ordenação corretamente e usar `.slice().sort()` para compatibilidade.
- Revisar todas as mensagens de erro para garantir clareza e customização adequada.

---

## 🌟 Finalizando…

gabubits, você já tem uma base muito sólida e está quase lá! Com essas correções, sua API vai ficar mais robusta, segura e alinhada com as boas práticas de desenvolvimento. Continue assim, revisando seu código com calma e testando cada cenário. Isso é o que diferencia um(a) desenvolvedor(a) excelente! 💪✨

Se precisar, volte aos recursos que recomendei e não hesite em experimentar! Você está crescendo muito, e o esforço já é visível. Parabéns e conte comigo nessa jornada! 🚓👮‍♂️🚨

Abraço forte e até a próxima revisão! 👋😊

> Caso queira tirar uma dúvida específica, entre em contato com o Chapter no nosso [discord](https://discord.gg/DryuHVnz).



---
<sup>Made By the Autograder Team.</sup><br>&nbsp;&nbsp;&nbsp;&nbsp;<sup><sup>- [Arthur Carvalho](https://github.com/ArthurCRodrigues)</sup></sup><br>&nbsp;&nbsp;&nbsp;&nbsp;<sup><sup>- [Arthur Drumond](https://github.com/drumondpucminas)</sup></sup><br>&nbsp;&nbsp;&nbsp;&nbsp;<sup><sup>- [Gabriel Resende](https://github.com/gnvr29)</sup></sup>