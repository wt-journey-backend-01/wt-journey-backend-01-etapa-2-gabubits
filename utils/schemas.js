import { z } from "zod";

const baseIdSchema = (id = "id") => ({
  [id]: z.uuidv4({
    error: (issue) =>
      issue.input === undefined
        ? `'${id}' é obrigatório.`
        : `'${issue.input}' não representa um UUID válido.`,
  }),
});

export const idSchema = z.object(baseIdSchema());
export const agenteIdSchema = z.object(baseIdSchema("agente_id"));
export const casoIdSchema = z.object(baseIdSchema("caso_id"));

const baseStringSchema = (fieldName) => ({
  [fieldName]: z
    .string({
      error: (issue) => {
        if (!issue.input) return `${fieldName} é um campo obrigatório.`;
        if (issue.code === "invalid_type")
          return `${fieldName} é um campo de tipo string`;
      },
    })
    .min(1, `${fieldName} não pode ser vazio`),
});

const baseDateSchema = (fieldName) => ({
  [fieldName]: z.iso.date({
    error: (issue) => {
      if (!issue.input) return `${fieldName} é um campo obrigatório.`;
      if (issue.code === "invalid_type")
        return `${fieldName} é um campo de tipo string`;
      if (issue.code === "invalid_format")
        return `Campo ${fieldName} não representa uma data válida`;
    },
  }),
});

const baseEnumSchema = (fieldName, values) => ({
  [fieldName]: z
    .string({
      error: (issue) => {
        if (!issue.input) return `${fieldName} é um campo obrigatório.`;
        if (issue.code === "invalid_type")
          return `${fieldName} é um campo de tipo string`;
      },
    })
    .toLowerCase()
    .pipe(
      z.enum(values, {
        error: (issue) => {
          if (issue.code === "invalid_value")
            return `${fieldName} deve ser ${values.join(" ou ")}.`;
        },
      })
    ),
});

const baseStringLCSchema = (fieldName) => ({
  [fieldName]: z
    .string({
      error: (issue) => {
        if (!issue.input) return `${fieldName} é um campo obrigatório.`;
        if (issue.code === "invalid_type")
          return `${fieldName} é um campo de tipo string`;
      },
    })
    .min(1, `${fieldName} não pode ser vazio`)
    .toLowerCase(),
});

export const agenteSchema = z.object(
  {
    ...baseStringSchema("nome"),
    ...baseDateSchema("dataDeIncorporacao"),
    ...baseStringLCSchema("cargo"),
  },
  {
    error: (issue) => {
      if (issue.code === "invalid_type")
        return "O corpo de requisição deve ser um OBJETO.";
    },
  }
);

export const casoSchema = z.object(
  {
    ...baseStringSchema("titulo"),
    ...baseStringSchema("descricao"),
    ...baseEnumSchema("status", ["aberto", "solucionado"]),
    ...baseIdSchema("agente_id"),
  },
  {
    error: (issue) => {
      if (issue.code === "invalid_type")
        return "O corpo de requisição deve ser um OBJETO.";
    },
  }
);

export const agentePatchSchema = agenteSchema.partial();
export const casoPatchSchema = casoSchema.partial();

export const agentesQuerySchema = z.union([
  z
    .object({
      sort: z
        .templateLiteral([z.enum(["-", ""]), "dataDeIncorporacao"])
        .transform((val) => (val[0] === "-" ? -1 : 1)),
    })
    .strict(),
  z.object({ ...baseStringLCSchema("cargo") }).strict(),
]);

export const casosQuerySchema = z.union([
  z.object({ ...baseIdSchema("agente_id") }).strict(),
  z
    .object({
      ...baseEnumSchema("status", ["aberto"]),
    })
    .strict(),
]);

export const searchQuerySchema = z
  .object({ ...baseStringLCSchema("q") })
  .strict();
