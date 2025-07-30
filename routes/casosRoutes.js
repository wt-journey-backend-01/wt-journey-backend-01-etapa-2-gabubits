import express from "express";
import * as casosController from "../controllers/casosController.js";

const router = express.Router();

router.get(
  "/",
  casosController.obterCasos,
  casosController.obterCasosAgenteId,
  casosController.obterCasosStatus
);

router.get("/:id/agente", casosController.obterAgenteDoCaso);

router.get(
  "/search",
  casosController.paginaSearch,
  casosController.pesquisarCasos
);

router.get("/:id", casosController.obterUmCaso);

router.post("/", casosController.criarCaso);

router.put("/:id", casosController.atualizarCaso);

router.patch("/:id", casosController.atualizarCaso);

router.delete("/:id", casosController.apagarCaso);

export default router;
