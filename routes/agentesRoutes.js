import express from "express";
import * as agentesController from "../controllers/agentesController.js";

const router = express.Router();

router.get("/agentes", agentesController.getAgentes);

export default router;
