import { FastifyPluginAsync } from "fastify";
import {
  createPreference,
  listPreferences,
} from "../controllers/preferences.controller";

const preferencesRoutes: FastifyPluginAsync = async (app) => {
  app.get("/", listPreferences);
  app.post("/", createPreference);
};

export default preferencesRoutes;