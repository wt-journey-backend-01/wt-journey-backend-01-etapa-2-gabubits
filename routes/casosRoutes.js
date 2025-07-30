import express from "express";
import * as casosController from "../controllers/casosController.js";

const router = express.Router();

router.get(
  "/casos",
  casosController.obterCasos,
  casosController.obterCasosAgenteId,
  casosController.obterCasosStatus
);

router.get("/casos/:caso_id/agente", casosController.obterAgenteDoCaso);

router.get("/casos/search", casosController.pesquisarCasos);

router.get("/casos/:id", casosController.obterUmCaso);

router.post("/casos", casosController.criarCaso);

router.put("/casos/:id", casosController.atualizarCaso);

router.patch("/casos/:id", casosController.atualizarCaso);

router.delete("/casos/:id", casosController.apagarCaso);

export default router;
