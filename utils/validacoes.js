import { z } from "zod";

export const agenteSchema = z.object({
  nome: z
    .string("'nome' deve ser do tipo string.")
    .min(1, "'nome' é um campo obrigatório."),
  dataDeIncorporacao: z.iso.date(
    "Formato de 'dataDeIncorporacao' não representa uma data válida."
  ),
  cargo: z.enum(
    ["inspetor", "delegado"],
    "O atributo 'cargo' é obrigatório e deve ser 'inspetor' ou 'delegado'"
  ),
});
