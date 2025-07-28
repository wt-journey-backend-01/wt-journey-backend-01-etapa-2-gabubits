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
          responses: {
            200: {
              description: "Operação bem-sucedida",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: {
                      $ref: "#/components/schemas/Agente",
                    },
                  },
                },
              },
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
            200: {
              description: "Operação bem-sucedida - Agente cadastrado",
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
            "Retorna todas as informações referentes ao agente especificado pelo ID",
          produces: "application/json",
          parameters: [
            {
              name: "id",
              in: "path",
              description: "ID do agente",
              required: true,
              schema: {
                type: "string",
                format: "uuid",
              },
            },
          ],
          responses: {
            200: {
              description: "Operação bem-sucedida",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Agente",
                  },
                  examples: {
                    Agente: {
                      $ref: "#/components/examples/ExampleAgente",
                    },
                  },
                },
              },
            },
            404: {
              $ref: "#/components/responses/InvalidId",
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
              enum: ["inspetor", "delegado"],
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
            id: "f5fb2ad5-22a8-4cb4-90f2-8733517a0d46",
            titulo: "homicidio",
            descricao:
              "Disparos foram reportados às 22:33 do dia 10/07/2007 na região do bairro União, resultando na morte da vítima, um homem de 45 anos.",
            status: "aberto",
            agente_id: "401bccf5-cf9e-489d-8412-446cd169a0f1",
          },
        },
        ExempleCaso: {
          value: {
            id: "401bccf5-cf9e-489d-8412-446cd169a0f1",
            nome: "Rommel Carneiro",
            dataDeIncorporacao: "1992-10-04",
            cargo: "delegado",
          },
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
    },
  },
  apis: [path.join(__dirname, "../routes/*.js")],
};
