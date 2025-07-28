import express from "express";
import agentesRoutes from "./routes/agentesRoutes.js";
import casosRoutes from "./routes/casosRoutes.js";
import { errorHandler, NotFoundRouteError } from "./utils/errorHandler.js";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { option } from "./docs/swagger.js";

const app = express();
const PORT = 3000;
const specs = swaggerJSDoc(option);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/docs", swaggerUi.serve, swaggerUi.setup(specs));

app.use(agentesRoutes);
app.use(casosRoutes);

app.use((req, res, next) => {
  next(
    new NotFoundRouteError({
      endpoint: `O endpoint '${req.method} ${req.url}' não existe nessa aplicação.`,
    })
  );
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(
    `Servidor do Departamento de Polícia rodando em localhost:${PORT}`
  );
});
