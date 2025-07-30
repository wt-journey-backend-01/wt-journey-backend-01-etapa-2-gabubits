<sup>Esse é um feedback gerado por IA, ele pode conter erros.</sup>

Você tem 2 créditos restantes para usar o sistema de feedback AI.

# Feedback para gabubits:

Nota final: **95.6/100**

Olá, gabubits! 👋🚀

Antes de tudo, parabéns pelo empenho e pela nota incrível que você conquistou! 🎉 Você construiu uma API com uma estrutura muito bem organizada, modularizada e com muitos detalhes importantes implementados. Isso mostra maturidade e cuidado no desenvolvimento. Vamos juntos analisar o que está brilhando e onde podemos dar aquele upgrade para deixar seu projeto ainda mais sólido? 😄✨

---

## 🎯 Pontos Fortes que Merecem Destaque

1. **Arquitetura Modular e Organização**  
   Sua separação clara entre `routes`, `controllers`, `repositories` e `utils` está muito bem feita! Isso facilita a manutenção e a escalabilidade do projeto.  
   Exemplo:  
   ```js
   import agentesRoutes from "./routes/agentesRoutes.js";
   import casosRoutes from "./routes/casosRoutes.js";

   app.use("/agentes", agentesRoutes);
   app.use("/casos", casosRoutes);
   ```
   Essa organização é fundamental para projetos reais. Parabéns! 👏

2. **Implementação Completa dos Endpoints Obrigatórios**  
   Você implementou todos os métodos HTTP esperados para `/agentes` e `/casos`, incluindo GET, POST, PUT, PATCH e DELETE. Isso é essencial para uma API RESTful completa.

3. **Validações com Zod e Tratamento de Erros**  
   O uso do Zod para validar schemas e o tratamento personalizado de erros com classes específicas (`InvalidIdError`, `InvalidFormatError`, etc.) mostram um cuidado especial com a qualidade da API e a experiência do cliente. Isso é um diferencial! 💪

4. **Filtros Simples Funcionando**  
   Você implementou filtros por `status` e `agente_id` em `/casos` e por `cargo` e `sort` em `/agentes`, que funcionam corretamente. Isso já é um passo além do básico e mostra que você vai bem nos bônus! 🌟

---

## 🔍 Oportunidades de Melhoria e Aprendizado

### 1. Penalidade: Alteração do campo `id` nos métodos PUT

**O que aconteceu?**  
Percebi que nos métodos PUT (e PATCH) tanto para agentes quanto para casos, você permite que o campo `id` seja alterado, o que não deveria acontecer. O `id` é o identificador único e imutável do recurso na sua API, e permitir sua alteração pode causar inconsistências graves.

**Onde está no seu código?**  
No `controllers/agentesController.js`, na função `atualizarAgente`:

```js
delete body_parse.data.id;

const agente_atualizado = agentesRepository.atualizarAgente(
  id_parse.data.id,
  body_parse.data
);
```

Você tenta deletar o `id` do corpo, mas só após a validação com Zod, o que não impede que o usuário envie um `id` diferente no payload. Além disso, a validação do schema do agente não impede que o campo `id` seja enviado.

**Por que isso é um problema?**  
Porque o usuário pode enviar um `id` diferente no corpo, e, dependendo da sua lógica, isso pode atualizar o `id` no repositório, o que não é correto.

**Como corrigir?**  
Você precisa garantir que o schema de validação para atualização (`agenteSchema` e `agentePatchSchema`) não permita o campo `id`. Ou seja, o `id` deve ser excluído ou ignorado *antes* da validação.

Outra abordagem é ajustar o seu schema para que o `id` seja opcional e sempre removido, ou usar um schema específico para atualização que não aceite `id`.

Exemplo de ajuste no controller:

```js
// Antes de validar, remova o id do corpo para evitar problemas
if ('id' in req.body) delete req.body.id;

const body_parse =
  req.method === "PUT"
    ? agenteSchema.safeParse(req.body)
    : agentePatchSchema.safeParse(req.body);
```

Ou, melhor ainda, ajustar o schema para não aceitar `id` no corpo.

O mesmo vale para `casosController.js`, na função `atualizarCaso`.

---

### 2. Falha nos Testes Bônus Relacionados a Filtros e Busca Avançada

Você teve sucesso em filtros simples, mas os filtros mais complexos e a busca por keywords não funcionaram completamente.

**Analisando o endpoint de busca de agente responsável por caso:**

No seu `casosRoutes.js`:

```js
router.get("/:caso_id/agente", casosController.obterAgenteDoCaso);
```

E no `casosController.js`:

```js
import { obterUmAgente } from "../repositories/agentesRepository.js";

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

**Ponto de atenção:**  
Você está importando `obterUmAgente` do repositório, mas no começo do arquivo você importou assim:

```js
import { obterUmAgente } from "../repositories/agentesRepository.js";
```

Porém, no `agentesRepository.js`, `obterUmAgente` é exportado como função normal, não como default. Isso está correto, mas o problema pode estar na forma que você chama essa função: `const agente_existe = obterUmAgente(agente_id);`

Se `obterUmAgente` retorna `undefined`, sua lógica está correta. Então o problema pode ser outro: **a rota `/casos/:caso_id/agente` está sendo definida após o router.get("/:id")?**

Na sua `casosRoutes.js`, a ordem é:

```js
router.get(
  "/",
  casosController.obterCasos,
  casosController.obterCasosAgenteId,
  casosController.obterCasosStatus
);

router.get("/:caso_id/agente", casosController.obterAgenteDoCaso);

router.get("/search", casosController.pesquisarCasos);

router.get("/:id", casosController.obterUmCaso);
```

Aqui há um problema clássico de roteamento: o Express avalia as rotas na ordem em que são declaradas. A rota `/:id` é muito genérica e vai capturar qualquer requisição que tenha um parâmetro depois de `/casos/`, incluindo `/casos/:caso_id/agente`. Isso faz com que o endpoint `/casos/:caso_id/agente` nunca seja alcançado.

**Como corrigir?**  
Reorganize a ordem das rotas para que as mais específicas venham antes das mais genéricas. Por exemplo:

```js
router.get("/search", casosController.pesquisarCasos);

router.get("/:caso_id/agente", casosController.obterAgenteDoCaso);

router.get("/:id", casosController.obterUmCaso);
```

Assim, o Express vai primeiro tentar casar as rotas `/search` e `/:caso_id/agente` antes de cair no `/casos/:id`.

---

### 3. Busca por Keywords no Endpoint `/casos/search`

Você implementou o endpoint `/casos/search` e a função `pesquisarCasos` no controller, que parece correta:

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

No `casosRepository.js`:

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

**Possível causa do problema:**  
No arquivo `casosRoutes.js`, a rota `/search` está declarada depois da rota `/:caso_id/agente` e antes da rota `/:id`, o que é bom. Mas lembre-se que o middleware `obterUmCaso` tem uma lógica para ignorar requisições que contenham "search" no `req.params.id`:

```js
if (req.params.id.includes("search")) {
  return next();
}
```

Porém, isso só funciona se a rota `/search` não for capturada pela rota `/casos/:id` — o que você já corrigiu na reorganização das rotas.

Assim, reorganizar as rotas como sugerido acima também vai ajudar a fazer a busca funcionar corretamente.

---

### 4. Ordenação por Data de Incorporação em `/agentes?sort=1` e `/agentes?sort=-1`

Você já implementou as funções para ordenar agentes por data de incorporação ascendente e descendente, e o controller chama corretamente essas funções:

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

No entanto, a validação do `sort` no schema `sortSchema` pode estar esperando um número, mas o query string geralmente vem como string. Isso pode causar falha na validação.

**Sugestão:**  
No seu schema de validação (em `utils/schemas.js`), certifique-se de que o campo `sort` aceita string "1" e "-1" e converte para número, ou no controller converta `req.query.sort` para número antes de validar.

Exemplo simples no controller:

```js
const sortValue = Number(req.query.sort);

const sort_parse = sortSchema.safeParse({ sort: sortValue });
```

Isso evita que o schema rejeite o valor por ser string.

---

### 5. Recomendação Sobre Estrutura de Diretórios

Sua estrutura está alinhada com o esperado, parabéns! Isso é essencial para projetos profissionais e para facilitar o entendimento do seu código por outras pessoas.

---

## 📚 Recursos para Aprofundar

- Para entender melhor a questão do roteamento e ordem das rotas no Express.js, recomendo muito este artigo oficial:  
  https://expressjs.com/pt-br/guide/routing.html

- Para aprofundar em validação de dados com Zod e evitar problemas com campos indesejados no payload, veja este vídeo:  
  https://youtu.be/yNDCRAz7CM8?si=Lh5u3j27j_a4w3A_

- Para garantir que o campo `id` não seja alterado no PUT/PATCH, entenda como separar schemas para criação e atualização:  
  https://youtu.be/bGN_xNc4A1k?si=Nj38J_8RpgsdQ-QH (MVC e organização de schemas)

- Para manipulação correta de query strings e conversão de tipos (string para number) no Express:  
  https://youtu.be/--TQwiNIw28

---

## 📝 Resumo Rápido para Você Focar

- 🚫 **Não permita alteração do campo `id` nos métodos PUT e PATCH:** remova o campo do corpo antes da validação ou ajuste os schemas para não aceitar `id`.

- 🔄 **Reorganize as rotas no arquivo `casosRoutes.js` para que rotas específicas venham antes das genéricas:** coloque `/search` e `/:caso_id/agente` antes de `/:id`.

- 🔢 **Converta valores de query string para o tipo esperado antes da validação:** por exemplo, converta `sort` de string para número antes de validar com Zod.

- 🔎 **Verifique se os schemas de validação estão alinhados com os tipos que chegam via HTTP (strings na query, objetos no body).**

- 📂 **Continue mantendo a organização modular e a clareza no código, isso é um ponto forte seu!**

---

Gabubits, seu projeto está muito bem encaminhado! Com esses ajustes você vai destravar os bônus e evitar problemas de integridade nos dados. Continue nessa pegada, pois você está construindo bases sólidas para APIs profissionais! 🚀💙

Se quiser, posso te ajudar a fazer essas mudanças passo a passo. Conte comigo! 😉

Um abraço forte e até a próxima revisão! 👊✨

> Caso queira tirar uma dúvida específica, entre em contato com o Chapter no nosso [discord](https://discord.gg/DryuHVnz).



---
<sup>Made By the Autograder Team.</sup><br>&nbsp;&nbsp;&nbsp;&nbsp;<sup><sup>- [Arthur Carvalho](https://github.com/ArthurCRodrigues)</sup></sup><br>&nbsp;&nbsp;&nbsp;&nbsp;<sup><sup>- [Arthur Drumond](https://github.com/drumondpucminas)</sup></sup><br>&nbsp;&nbsp;&nbsp;&nbsp;<sup><sup>- [Gabriel Resende](https://github.com/gnvr29)</sup></sup>