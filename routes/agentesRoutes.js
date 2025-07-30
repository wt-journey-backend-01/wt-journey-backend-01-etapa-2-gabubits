import express from "express";
import * as agentesController from "../controllers/agentesController.js";

const router = express.Router();

router.get(
  "/agentes",
  agentesController.obterAgentes,
  agentesController.obterAgentesCargo,
  agentesController.obterAgentesSort
);

router.get("/agentes/:id", agentesController.obterUmAgente);

router.post("/agentes", agentesController.criarAgente);

router.put("/agentes/:id", agentesController.atualizarAgente);

router.patch("/agentes/:id", agentesController.atualizarAgente);

router.delete("/agentes/:id", agentesController.apagarAgente);

export default router;
