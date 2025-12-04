import Fastify, { FastifyInstance } from "fastify";
import corsPlugin from "./plugins/cors";
import swaggerPlugin from "./plugins/swagger";
import routes from "./routes";
import systemRoutes from "./routes/system";
import logger from "./utils/logger";

export const buildApp = (): FastifyInstance => {
  const app = Fastify({ logger });

  app.register(corsPlugin);
  app.register(swaggerPlugin);
  app.register(systemRoutes); // Register system routes at root level
  app.register(routes, { prefix: "/api/v1" });

  return app;
};
