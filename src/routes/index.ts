import { FastifyPluginAsync } from "fastify";
import preferencesRoutes from "./preferences";

const routes: FastifyPluginAsync = async (app) => {
  app.register(preferencesRoutes, { prefix: "/preferences" });
};

export default routes;
