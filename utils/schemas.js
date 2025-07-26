import { z } from "zod";

const baseIdSchema = (id = "id") => ({
  [id]: z.uuidv4({
    error: (issue) =>
      issue.input === undefined
        ? `'${id}' é obrigatório.`
        : `'${id}' não representa um UUID válido.`,
  }),
});

export const idSchema = z.object(baseIdSchema());

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
    .pipe(z.transform((val) => val.toLowerCase()))
    .pipe(
      z.enum(values, {
        error: (issue) => {
          if (issue.code === "invalid_value")
            return `${fieldName} deve ser ${values.join(" ou ")}.`;
        },
      })
    ),
});

export const agenteSchema = z.object(
  {
    ...baseStringSchema("nome"),
    ...baseDateSchema("dataDeIncorporacao"),
    ...baseEnumSchema("cargo", ["inspetor", "delegado"]),
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

export const statusOnlySchema = casoSchema.pick({ status: true });

export const querySchema = z.union(
  [
    z
      .object({
        sort: z
          .templateLiteral([z.enum(["-", ""]), "dataDeIncorporacao"])
          .transform((val) => (val[0] === "-" ? -1 : 1)),
      })
      .strict(),
    z
      .object({
        cargo: z.preprocess(
          (val) => (val !== undefined ? val.toLowerCase() : undefined),
          z.enum(["inspetor", "delegado"])
        ),
      })
      .strict(),
  ],
  {
    error: (issue) => {
      if (issue.code === "invalid_type")
        return "O corpo de requisição deve ser um OBJETO.";
    },
  }
);
