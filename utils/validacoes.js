import { z } from "zod";

export const agenteSchema = z.object({
  nome: z
    .string("'nome' deve ser do tipo string.")
    .min(1, "'nome' é um campo obrigatório."),
  dataDeIncorporacao: z.iso.date(
    "Formato de 'dataDeIncorporacao' não representa uma data válida."
  ),
  cargo: z.enum(["inspetor", "delegado"], {
    error: (issue) =>
      issue.input === undefined
        ? "O atributo 'cargo' é obrigatório"
        : "O atributo 'cargo' deve ser 'inspetor' ou 'delegado'.",
  }),
});

export const casoSchema = z.object({});
