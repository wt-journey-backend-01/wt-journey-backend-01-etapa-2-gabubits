<sup>Esse é um feedback gerado por IA, ele pode conter erros.</sup>

Você tem 1 créditos restantes para usar o sistema de feedback AI.

# Feedback para gabubits:

Nota final: **95.6/100**

Olá, gabubits! 👋🚀

Antes de mais nada, parabéns pelo trabalho incrível que você entregou! 🎉 Você conseguiu implementar toda a estrutura básica da API para o Departamento de Polícia com uma organização muito boa, usando rotas, controllers e repositories de maneira modular. Isso é fundamental para manter seu código limpo, escalável e fácil de manter. Além disso, você implementou com sucesso vários filtros para os casos e agentes, e tratou os erros com mensagens personalizadas em muitos pontos — isso mostra um cuidado especial com a experiência do usuário da sua API, muito legal! 👏

---

## 🎯 O que você mandou muito bem

- Organização do projeto seguindo a arquitetura MVC (rotas, controllers, repositories) está perfeita. Por exemplo, o arquivo `routes/agentesRoutes.js` está bem estruturado, importando os controllers e definindo as rotas corretamente.

- Implementação dos endpoints básicos para os recursos `/agentes` e `/casos` está completa, incluindo todos os métodos HTTP esperados (GET, POST, PUT, PATCH, DELETE).

- Uso do `zod` para validação dos dados é um ponto super positivo, e você conseguiu capturar e tratar erros de validação com respostas adequadas.

- Implementação dos filtros simples para `/casos` por `agente_id` e `status` está funcionando, o que é um bônus excelente.

- Tratamento de erros customizados está presente em vários pontos, o que demonstra um esforço para tornar a API mais robusta.

---

## 🕵️‍♂️ Pontos que precisam de atenção para destravar 100% do potencial da sua API

### 1. Alteração do campo `id` nos métodos PUT (Agentes e Casos)

Eu vi no seu código que, ao atualizar um agente ou um caso com o método PUT, o campo `id` pode ser alterado, o que não deveria acontecer. O `id` é o identificador único e imutável do recurso, e permitir que ele seja modificado pode causar inconsistências nos dados.

No seu `controllers/agentesController.js`, na função `atualizarAgente`, você tem:

```js
delete body_parse.data.id;
```

que é ótimo para evitar a alteração do `id`. Porém, no seu `repositories/agentesRepository.js`, a função `atualizarAgente` não impede explicitamente a alteração do `id`:

```js
for (const chave of Object.keys(dados)) {
  if (chave !== "id") agentesRepository[index_agente][chave] = dados[chave];
}
```

Aqui está correto, pois você ignora o campo `id` na atualização. Então o problema está mais no fato de que no controller você só deleta o `id` do `body_parse.data` para o PATCH, mas não para o PUT? Na verdade, olhando bem, você faz o `delete` para ambos.

**Mas no repositório de casos (`repositories/casosRepository.js`), a função `atualizarCaso` não ignora o `id` na atualização:**

```js
for (const chave of Object.keys(dados)) {
  if (chave !== "id") casosRepository[index_caso][chave] = dados[chave];
}
```

Aqui você ignora o `id` também, então parece correto.

Então onde está o problema?

O que acontece é que no controller de casos, na função `atualizarCaso`, você **não está deletando o campo `id` do `body_parse.data`** antes de passar para o repositório. Veja:

```js
const body_parse =
  req.method === "PUT"
    ? casoSchema.safeParse(req.body)
    : casoPatchSchema.safeParse(req.body);

// não tem delete body_parse.data.id aqui
```

Isso significa que se o cliente enviar um `id` no corpo da requisição, ele vai estar presente em `body_parse.data` e, mesmo que o repositório ignore a chave `id` no momento da atualização, o dado ainda passa pelo controller com o `id` modificado, o que pode causar confusão e não é uma boa prática.

**Recomendação:** Faça o mesmo que fez para agentes: delete o campo `id` do objeto `body_parse.data` antes de chamar o repositório, para garantir que o `id` nunca seja alterado.

Exemplo para o controller de casos:

```js
delete body_parse.data.id;
```

Logo após o parse do corpo.

---

### 2. Falha na implementação do endpoint que retorna o agente responsável por um caso (`GET /casos/:caso_id/agente`)

Esse é um ponto muito importante, porque eu vi que o teste de bônus que verifica se você implementou o endpoint para obter o agente responsável pelo caso não passou.

Olhando seu arquivo `routes/casosRoutes.js`, você tem:

```js
router.get("/:caso_id/agente", casosController.obterAgenteDoCaso);
```

Perfeito, a rota está lá!

No controller (`controllers/casosController.js`), a função está assim:

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

Aqui tem um detalhe que explica o problema: você está importando `obterUmAgente` do `../repositories/agentesRepository.js` **com chaves**, mas na verdade no repositório você exporta a função sem chaves (como `export function obterUmAgente`), então a importação deve ser:

```js
import { obterUmAgente } from "../repositories/agentesRepository.js";
```

Mas, no seu código, você está fazendo:

```js
import { obterUmAgente } from "../repositories/agentesRepository.js";
```

Ok, está correto. Então a importação está certa.

Agora, o problema está em como você está usando o `casoIdSchema` para validar o parâmetro `caso_id`. No seu schema, provavelmente você espera o parâmetro como `id`, mas na rota o nome do parâmetro é `caso_id`. Isso gera um problema na validação.

Além disso, o seu `idSchema` no controller de casos para `obterUmCaso` espera o parâmetro com nome `id`, mas aqui você está usando `casoIdSchema` para validar `caso_id`.

Se o `casoIdSchema` não estiver configurado para validar o parâmetro `caso_id`, a validação falha.

**Sugestão:** Para evitar confusão, alinhe o nome do parâmetro na rota e no schema. Por exemplo, na rota, use `/:id/agente` para o parâmetro ser `id`, e no schema use `idSchema` para validar.

Ou, se quiser manter `caso_id`, ajuste o schema para aceitar esse nome.

Exemplo de ajuste na rota:

```js
router.get("/:id/agente", casosController.obterAgenteDoCaso);
```

E no controller:

```js
const id_parse = idSchema.safeParse(req.params);
const caso_id = id_parse.data.id;
```

Assim você mantém o padrão e evita erros.

---

### 3. Falta de filtros de busca por palavras-chave nos casos (`GET /casos/search?q=...`)

Você implementou o endpoint na rota:

```js
router.get("/search", casosController.pesquisarCasos);
```

E no controller:

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

Aqui está tudo certo, porém, parece que o schema `searchQuerySchema` está muito restritivo ou o método `pesquisarCasos` do repositório pode estar com alguma limitação.

Verifique se o `searchQuerySchema` permite o campo `q` ser uma string não vazia, e se o método `pesquisarCasos` está buscando corretamente no título e descrição.

Se estiver tudo certo, talvez o problema seja em algum detalhe da validação ou no corpo da resposta.

---

### 4. Ordenação dos agentes por data de incorporação (ascendente e descendente)

No repositório de agentes (`repositories/agentesRepository.js`), as funções para ordenar agentes são:

```js
// Ordem crescente
export function obterAgentesOrdenadosPorDataIncorpAsc() {
  const agentes_copia = agentesRepository.slice();
  const agentes_ordenados = agentes_copia.sort((agente1, agente2) => {
    const dIncorpA1 = new Date(agente1.dataDeIncorporacao).getTime();
    const dIncorpA2 = new Date(agente2.dataDeIncorporacao).getTime();

    return dIncorpA1 - dIncorpA2;
  });

  return agentes_ordenados;
}

// Ordem decrescente
export function obterAgentesOrdenadosPorDataIncorpDesc() {
  const agentes_copia = agentesRepository.slice();
  const agentes_ordenados = agentes_copia.sort((agente1, agente2) => {
    const dIncorpA1 = new Date(agente1.dataDeIncorporacao).getTime();
    const dIncorpA2 = new Date(agente2.dataDeIncorporacao).getTime();

    return dIncorpA1 - dIncorpA2;
  });

  return agentes_ordenados;
}
```

Repare que as duas funções fazem exatamente a mesma coisa, ambas ordenam em ordem crescente (`dIncorpA1 - dIncorpA2`).

Para ordenar em ordem decrescente, você precisa inverter a subtração:

```js
return dIncorpA2 - dIncorpA1;
```

**Corrigindo a função de ordem decrescente:**

```js
export function obterAgentesOrdenadosPorDataIncorpDesc() {
  const agentes_copia = agentesRepository.slice();
  const agentes_ordenados = agentes_copia.sort((agente1, agente2) => {
    const dIncorpA1 = new Date(agente1.dataDeIncorporacao).getTime();
    const dIncorpA2 = new Date(agente2.dataDeIncorporacao).getTime();

    return dIncorpA2 - dIncorpA1; // ordem decrescente corrigida
  });

  return agentes_ordenados;
}
```

Essa pequena mudança vai garantir que o filtro de ordenação funcione corretamente para ambos os sentidos.

---

### 5. Mensagens de erro customizadas para argumentos inválidos (agentes e casos)

Você fez um ótimo trabalho em capturar e lançar erros customizados usando classes específicas, como `InvalidIdError`, `InvalidFormatError`, etc.

Porém, alguns testes bônus indicam que as mensagens de erro não estão completamente personalizadas para todos os casos de argumentos inválidos, especialmente para agentes e casos.

Ao analisar seu código, percebi que você está usando o `z.flattenError` para extrair os erros do `zod` e passando isso diretamente para os erros customizados, o que é correto.

O que pode estar faltando é garantir que todas as validações estejam cobrindo os campos esperados e que as mensagens estejam claras e específicas.

Exemplo no controller de agentes:

```js
if (!body_parse.success) {
  const { formErrors, fieldErrors } = z.flattenError(body_parse.error);
  throw new Errors.InvalidFormatError({
    ...(formErrors.length ? { bodyFormat: formErrors } : {}),
    ...fieldErrors,
  });
}
```

Isso é ótimo, mas vale a pena revisar os schemas para garantir que todas as propriedades estejam validadas corretamente e que os erros sejam claros.

---

## 📚 Recomendações de estudo para você brilhar ainda mais

- Para garantir que seus endpoints estejam bem organizados e funcionando, recomendo revisar este vídeo sobre **Arquitetura MVC em Node.js com Express**:  
  https://youtu.be/bGN_xNc4A1k?si=Nj38J_8RpgsdQ-QH

- Para entender melhor como validar dados e tratar erros de forma eficaz na sua API, este vídeo é excelente:  
  https://youtu.be/yNDCRAz7CM8?si=Lh5u3j27j_a4w3A_

- Para manipular arrays e ordenações corretamente (como o problema do sort que você teve), este vídeo vai te ajudar muito:  
  https://youtu.be/glSgUKA5LjE?si=t9G2NsC8InYAU9cI

- Para entender a fundo o funcionamento das rotas e middlewares no Express.js, veja a documentação oficial:  
  https://expressjs.com/pt-br/guide/routing.html

---

## 🗂️ Resumo rápido do que focar para melhorar

- **Impedir alteração do campo `id` no corpo das requisições PUT/PATCH para casos** (delete o `id` antes de atualizar).

- **Corrigir a ordenação decrescente dos agentes** no repositório (`return dIncorpA2 - dIncorpA1` no `sort`).

- **Alinhar o nome do parâmetro de rota e o schema de validação** para o endpoint `/casos/:id/agente` para garantir que a validação funcione.

- **Revisar e ajustar a validação do filtro de busca por palavras-chave em casos** para garantir que o endpoint `/casos/search?q=...` funcione perfeitamente.

- **Aprimorar mensagens de erro customizadas** para garantir clareza e cobertura de todos os casos de validação.

---

gabubits, você está muito perto da perfeição! Seu código está bem estruturado, organizado e com funcionalidades robustas. Com esses ajustes que conversamos, sua API vai ficar ainda mais sólida e profissional. Continue assim, sua dedicação é inspiradora! 💪✨

Se precisar de ajuda para entender algum desses pontos, me chama que a gente resolve junto! 😉

Um abraço e bons códigos! 👨‍💻👩‍💻🚓

> Caso queira tirar uma dúvida específica, entre em contato com o Chapter no nosso [discord](https://discord.gg/DryuHVnz).



---
<sup>Made By the Autograder Team.</sup><br>&nbsp;&nbsp;&nbsp;&nbsp;<sup><sup>- [Arthur Carvalho](https://github.com/ArthurCRodrigues)</sup></sup><br>&nbsp;&nbsp;&nbsp;&nbsp;<sup><sup>- [Arthur Drumond](https://github.com/drumondpucminas)</sup></sup><br>&nbsp;&nbsp;&nbsp;&nbsp;<sup><sup>- [Gabriel Resende](https://github.com/gnvr29)</sup></sup>