import path from "path";
import { fileURLToPath } from "url";
import { required } from "zod/mini";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const option = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API para Departamento de Polícia",
      description:
        "Essa API foi implementada para entrega como atividade principal na etapa 2 do Journey Backend, realizado pelo WebTech Network e com apoio da Levty.",
      version: "1.0.0",
      license: {
        name: "MIT",
      },
    },
    servers: [
      {
        url: "http://localhost:3000/",
        description: "API Principal",
      },
    ],
    tags: [
      {
        name: "agentes",
        description:
          "Todas as informações disponíveis sobre agentes do departamento",
      },
      {
        name: "casos",
        description:
          "Todas as informações disponíveis sobre os casos do departamento",
      },
    ],
    paths: {
      "/agentes": {
        get: {
          tags: ["agentes"],
          summary: "Obtenha todos os agentes",
          description:
            "Obtenha todos os agentes cadastrados no departamento de polícia.",
          parameters: [
            {
              name: "cargo",
              in: "query",
              description: "Obter os agentes com o cargo especificado.",
              required: false,
              schema: {
                type: "string",
              },
            },
            {
              name: "sort",
              in: "query",
              description:
                "Obter os agentes ordenados por data de incorporação. Pode ser na ordem ascendente ou descendente.",
              required: false,
              schema: {
                type: "string",
                enum: ["dataDeIncorporacao", "-dataDeIncorporacao"],
              },
            },
          ],
          responses: {
            200: {
              $ref: "#/components/responses/AgenteArray",
            },
          },
        },
        post: {
          tags: ["agentes"],
          summary: "Cadastre um novo agente",
          description: "Somente o atributo ID não deve ser enviado.",
          requestBody: {
            description: "Cria um novo agente",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/idless/Agente",
                },
              },
            },
            required: true,
          },
          responses: {
            201: {
              $ref: "#/components/responses/Agente",
            },
            400: {
              $ref: "#/components/responses/MalformedData",
            },
          },
        },
      },
      "/agentes/{id}": {
        get: {
          tags: ["agentes"],
          summary: "Obtenha informações do agente pelo ID",
          description:
            "Retorna todas as informações referentes ao agente especificado pelo ID.",
          produces: "application/json",
          parameters: [{ $ref: "#/components/parameters/idParam" }],
          responses: {
            200: {
              $ref: "#/components/responses/Agente",
            },
          },
        },
        put: {
          tags: ["agentes"],
          summary: "Atualize todas as informações do agente",
          description:
            "Todos os parâmetros devem ser passados no corpo de requisição.",
          parameters: [{ $ref: "#/components/parameters/idParam" }],
          requestBody: {
            description: "Atualiza informações do agente",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/idless/Agente",
                },
              },
            },
          },
          responses: {
            200: {
              $ref: "#/components/responses/Agente",
            },
            400: {
              $ref: "#/components/responses/MalformedData",
            },
            404: {
              $ref: "#/components/responses/InvalidId",
            },
          },
        },
        patch: {
          tags: ["agentes"],
          summary: "Atualize algumas informações do agente",
          description:
            "Deve ser passado no mínimo um atributo no corpo de requisição.",
          parameters: [{ $ref: "#/components/parameters/idParam" }],
          requestBody: {
            description: "Atualiza informações do agente",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/idless/Agente",
                },
              },
            },
          },
          responses: {
            200: {
              $ref: "#/components/responses/Agente",
            },
            400: {
              $ref: "#/components/responses/MalformedData",
            },
            404: {
              $ref: "#/components/responses/InvalidId",
            },
          },
        },
        delete: {
          tags: ["agentes"],
          summary: "Apague um agente",
          description: "Apague um agente e todos os casos relacionados a ele.",
          parameters: [{ $ref: "#/components/parameters/idParam" }],
          responses: {
            204: {
              description: "O agente e seus casos foram apagados",
            },
          },
        },
      },
      "/casos": {
        get: {
          tags: ["casos"],
          summary: "Obtenha todos os casos",
          description:
            "Obtenha todos os casos cadastrados no departamento de polícia.",
          parameters: [
            {
              name: "agente_id",
              in: "query",
              description:
                "Obter todos os casos atribuídos à um agente específico.",
              required: false,
              schema: {
                type: "string",
                format: "uuid",
              },
            },
            {
              name: "status",
              in: "query",
              description: "Obter todos os casos com o status especificado.",
              required: false,
              schema: {
                type: "string",
                enum: ["aberto", "solucionado"],
              },
            },
          ],
          responses: {
            200: {
              $ref: "#/components/responses/CasoArray",
            },
          },
        },
        post: {
          tags: ["casos"],
          summary: "Cadastre um novo caso",
          description: "Somente o atributo ID não deve ser enviado.",
          requestBody: {
            description: "Cria um novo caso",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/idless/Caso",
                },
              },
            },
            required: true,
          },
          responses: {
            201: {
              $ref: "#/components/responses/Caso",
            },
            404: {
              $ref: "#/components/responses/InvalidId",
            },
            400: {
              $ref: "#/components/responses/MalformedData",
            },
          },
        },
      },
      "/casos/{id}": {
        get: {
          tags: ["casos"],
          summary: "Obtenha informações do caso pelo ID",
          description:
            "Retorna todas as informações referentes ao caso especificado pelo ID.",
          produces: "application/json",
          parameters: [{ $ref: "#/components/parameters/idParam" }],
          responses: {
            200: {
              $ref: "#/components/responses/Caso",
            },
          },
        },
        put: {
          tags: ["casos"],
          summary: "Atualize todas as informações do caso",
          description:
            "Todos os parâmetros devem ser passados no corpo de requisição.",
          parameters: [{ $ref: "#/components/parameters/idParam" }],
          requestBody: {
            description: "Atualiza informações do caso",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/idless/Caso",
                },
              },
            },
          },
          responses: {
            200: {
              $ref: "#/components/responses/Caso",
            },
            400: {
              $ref: "#/components/responses/MalformedData",
            },
            404: {
              $ref: "#/components/responses/InvalidId",
            },
          },
        },
        patch: {
          tags: ["casos"],
          summary: "Atualize algumas informações do caso",
          description:
            "Deve ser passado no mínimo um atributo no corpo de requisição.",
          parameters: [{ $ref: "#/components/parameters/idParam" }],
          requestBody: {
            description: "Atualiza informações do caso",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/idless/Caso",
                },
              },
            },
          },
          responses: {
            200: {
              $ref: "#/components/responses/Caso",
            },
            400: {
              $ref: "#/components/responses/MalformedData",
            },
            404: {
              $ref: "#/components/responses/InvalidId",
            },
          },
        },
        delete: {
          tags: ["casos"],
          summary: "Apague um caso",
          description: "Apague todas as informações de um caso.",
          parameters: [{ $ref: "#/components/parameters/idParam" }],
          responses: {
            204: {
              description: "O caso foi apagado",
            },
          },
        },
      },
      "/casos/{caso_id}/agente": {
        get: {
          tags: ["casos"],
          summary: "Obtenha informações do agente de um caso",
          description:
            "Retorna os dados completos do agente responsável por um caso específico.",
          produces: "application/json",
          parameters: [{ $ref: "#/components/parameters/caso_idParam" }],
          responses: {
            200: {
              $ref: "#/components/responses/Agente",
            },
            404: {
              $ref: "#/components/responses/InvalidId",
            },
          },
        },
      },
      "/casos/search": {
        get: {
          tags: ["casos"],
          summary: "Pesquisa de termos no título/descrição",
          description:
            "Retorna todos os casos em que a palavra da query string aparece no título e/ou descrição.",
          produces: "application/json",
          parameters: [
            {
              name: "q",
              in: "query",
              description: "Termos de pesquisa",
              required: true,
              schema: {
                type: "string",
              },
            },
          ],
          responses: {
            200: {
              $ref: "#/components/responses/CasoArray",
            },
          },
        },
      },
    },
    components: {
      schemas: {
        Agente: {
          type: "object",
          properties: {
            id: {
              type: "string",
              format: "uuid",
            },
            nome: {
              type: "string",
            },
            dataDeIncorporacao: {
              type: "string",
              format: "date",
            },
            cargo: {
              type: "string",
            },
          },
        },

        Caso: {
          type: "object",
          properties: {
            id: {
              type: "string",
              format: "uuid",
            },
            titulo: {
              type: "string",
            },
            descricao: {
              type: "string",
            },
            status: {
              type: "string",
              enum: ["aberto", "solucionado"],
            },
            agente_id: {
              type: "string",
              format: "uuid",
            },
          },
        },
        Error: {
          type: "object",
          properties: {
            status: {
              type: "integer",
              enum: [400, 404],
            },
            message: {
              type: "string",
            },
            errors: {
              type: "array",
              items: {
                type: "object",
                additionalProperties: {
                  type: "string",
                },
              },
            },
          },
        },
      },
      examples: {
        ExempleAgente: {
          value: {
            id: "401bccf5-cf9e-489d-8412-446cd169a0f1",
            nome: "Rommel Carneiro",
            dataDeIncorporacao: "1992-10-04",
            cargo: "delegado",
          },
        },
        ExempleCaso: {
          value: {
            id: "f5fb2ad5-22a8-4cb4-90f2-8733517a0d46",
            titulo: "homicidio",
            descricao:
              "Disparos foram reportados às 22:33 do dia 10/07/2007 na região do bairro União, resultando na morte da vítima, um homem de 45 anos.",
            status: "aberto",
            agente_id: "401bccf5-cf9e-489d-8412-446cd169a0f1",
          },
        },
        ExempleArrayAgente: {
          value: [
            {
              id: "401bccf5-cf9e-489d-8412-446cd169a0f1",
              nome: "Rommel Carneiro",
              dataDeIncorporacao: "1992-10-04",
              cargo: "delegado",
            },
          ],
        },
        ExempleArrayCaso: {
          value: [
            {
              id: "f5fb2ad5-22a8-4cb4-90f2-8733517a0d46",
              titulo: "homicidio",
              descricao:
                "Disparos foram reportados às 22:33 do dia 10/07/2007 na região do bairro União, resultando na morte da vítima, um homem de 45 anos.",
              status: "aberto",
              agente_id: "401bccf5-cf9e-489d-8412-446cd169a0f1",
            },
          ],
        },
        Error400: {
          value: {
            status: 400,
            message: "Atributos inválidos",
            errors: [
              {
                dataDeIncorporacao:
                  "O campo dataDeIncorporacao não representa uma data válida",
              },
            ],
          },
        },
        Error404: {
          value: {
            status: 404,
            message: "ID inválido",
            errors: [
              {
                id: "O ID '401bccf5-cf9e-489d-8412-446cd169a0f1' não existe nos agentes",
              },
            ],
          },
        },
      },

      responses: {
        InvalidId: {
          description: "O ID é inválido ou é inexistente",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Error",
              },
              examples: {
                Error: {
                  $ref: "#/components/examples/Error404",
                },
              },
            },
          },
        },
        MalformedData: {
          description: "Algum ou todos os parâmetros passados são inválidos",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Error",
              },
              examples: {
                Error: {
                  $ref: "#/components/examples/Error400",
                },
              },
            },
          },
        },
        Agente: {
          description: "Operação bem-sucedida",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Agente",
              },
              examples: {
                Agente: {
                  $ref: "#/components/examples/ExempleAgente",
                },
              },
            },
          },
        },
        AgenteArray: {
          description: "Operação bem-sucedida",
          content: {
            "application/json": {
              schema: {
                type: "array",
                items: {
                  $ref: "#/components/schemas/Agente",
                },
              },
              examples: {
                AgenteArray: {
                  $ref: "#/components/examples/ExempleArrayAgente",
                },
              },
            },
          },
        },
        Caso: {
          description: "Operação bem-sucedida",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Caso",
              },
              examples: {
                Caso: {
                  $ref: "#/components/examples/ExempleCaso",
                },
              },
            },
          },
        },
        CasoArray: {
          description: "Operação bem-sucedida",
          content: {
            "application/json": {
              schema: {
                type: "array",
                items: {
                  $ref: "#/components/schemas/Caso",
                },
              },
              examples: {
                CasoArray: {
                  $ref: "#/components/examples/ExempleArrayCaso",
                },
              },
            },
          },
        },
      },
      idless: {
        Agente: {
          type: "object",
          properties: {
            nome: {
              type: "string",
              example: "Suzana Alves",
            },
            dataDeIncorporacao: {
              type: "string",
              format: "date",
              example: "2021-07-10",
            },
            cargo: {
              type: "string",
              enum: ["inspetor", "delegado"],
            },
          },
        },

        Caso: {
          type: "object",
          properties: {
            titulo: {
              type: "string",
              example: "homicidio",
            },
            descricao: {
              type: "string",
              example:
                "Disparos foram reportados às 22:33 do dia 10/07/2007 na região do bairro União, resultando na morte da vítima, um homem de 45 anos.",
            },
            status: {
              type: "string",
              enum: ["aberto", "solucionado"],
            },
            agente_id: {
              type: "string",
              format: "uuid",
              example: "401bccf5-cf9e-489d-8412-446cd169a0f1",
            },
          },
        },
      },
      parameters: {
        idParam: {
          name: "id",
          in: "path",
          description: "ID único do objeto",
          required: true,
          schema: {
            type: "string",
            format: "uuid",
          },
        },
        caso_idParam: {
          name: "caso_id",
          in: "path",
          description: "ID único do caso",
          required: true,
          schema: {
            type: "string",
            format: "uuid",
          },
        },
      },
    },
  },
  apis: [path.join(__dirname, "../routes/*.js")],
};
