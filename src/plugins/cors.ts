import cors from "@fastify/cors";
import { FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";

const corsPlugin: FastifyPluginAsync = async (app) => {
  await app.register(cors, {
    origin: true,
    credentials: true,
  });
};

export default fp(corsPlugin, {
  name: "cors-plugin",
});
