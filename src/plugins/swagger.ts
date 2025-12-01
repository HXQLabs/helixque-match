import swagger from "@fastify/swagger";
import swaggerUI from "@fastify/swagger-ui";
import { FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";

const swaggerPlugin: FastifyPluginAsync = async (app) => {
  await app.register(swagger, {
    openapi: {
      info: {
        title: "Helixque Match API",
        version: "1.0.0",
        description: "API documentation for Helixque Match backend",
      },
      servers: [
        {
          url: "http://localhost:4000",
          description: "Local development server",
        },
      ],
    },
  });

  await app.register(swaggerUI, {
    routePrefix: "/docs",
    staticCSP: true,
  });
};

export default fp(swaggerPlugin, {
  name: "swagger-plugin",
});
