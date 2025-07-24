import { z } from "zod";

export const idSchema = (id = "id") =>
  z.uuidv4({
    error: (issue) =>
      issue.input === undefined
        ? `O atributo '${id}' é obrigatório.`
        : `O atributo '${id}' não representa um UUID válido.`,
  });

export const agenteSchema = z.object({
  nome: z
    .string("O atributo 'nome' deve ser do tipo string.")
    .min(1, "O atributo 'nome' é obrigatório."),
  dataDeIncorporacao: z.iso.date({
    error: (issue) =>
      issue.input === undefined
        ? "O atributo 'dataDeIncorporacao' é obrigatório."
        : "O atributo 'dataDeIncorporacao' não representa uma data válida.",
  }),
  cargo: z.preprocess(
    (val) => val.toLowerCase(),
    z.enum(["inspetor", "delegado"], {
      error: (issue) =>
        issue.input === undefined
          ? "O atributo 'cargo' é obrigatório"
          : "O atributo 'cargo' deve ser 'inspetor' ou 'delegado'.",
    })
  ),
});

export const casoSchema = z.object({
  titulo: z
    .string("O atributo 'titulo' deve ser do tipo string.")
    .min(1, "O atributo 'titulo' é obrigatório."),
  descricao: z
    .string("O atributo 'descricao' deve ser do tipo string.")
    .min(1, "O atributo 'descricao' é obrigatório."),
  status: z.preprocess(
    (val) => val.toLowerCase(),
    z.enum(["aberto", "solucionado"], {
      error: (issue) =>
        issue.input === undefined
          ? "O atributo 'status' é obrigatório"
          : "O atributo 'status' deve ser 'aberto' ou 'solucionado'.",
    })
  ),
  agente_id: idSchema("agente_id"),
});
