import { FastifyPluginAsync } from "fastify";

const healthRoute: FastifyPluginAsync = async (app) => {
  app.get("/health", async (_request, reply) => {
    reply.send({ status: "Alive" });
  });
};

export default healthRoute;
