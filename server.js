import express from "express";
import agentesRoutes from "./routes/agentesRoutes";
import casosRoutes from "./routes/casosRoutes";

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(agentesRoutes);
app.use(casosRoutes);

app.get("/", (req, res) => {
  res.json([{ oi: "oi" }]);
});

app.listen(PORT, () => {
  console.log(
    `Servidor do Departamento de Polícia rodando em localhost:${PORT}`
  );
});
