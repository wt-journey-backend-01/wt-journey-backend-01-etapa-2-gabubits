import express from "express";
import * as agentesController from "../controllers/agentesController.js";

const router = express.Router();

router.get(
  "/",
  agentesController.obterAgentes,
  agentesController.obterAgentesCargo,
  agentesController.obterAgentesSort
);

router.get("/:id", agentesController.obterUmAgente);

router.post("/", agentesController.criarAgente);

router.put("/:id", agentesController.atualizarAgente);

router.patch("/:id", agentesController.atualizarAgente);

router.delete("/:id", agentesController.apagarAgente);

export default router;
