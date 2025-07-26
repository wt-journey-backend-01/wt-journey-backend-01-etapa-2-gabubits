import express from "express";
import agentesRoutes from "./routes/agentesRoutes.js";
import casosRoutes from "./routes/casosRoutes.js";

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(agentesRoutes);
app.use(casosRoutes);

app.use((req, res) => {
  res.status(404).json({
    status: 404,
    message: "Endpoint inexistente",
    errors: {
      endpoint: `O endpoint '${req.method} ${req.url}' não existe nessa aplicação.`,
    },
  });
});

app.listen(PORT, () => {
  console.log(
    `Servidor do Departamento de Polícia rodando em localhost:${PORT}`
  );
});
