import { FastifyPluginAsync } from "fastify";
import {
  healthCheck,
  getMetrics
} from "../controllers/system.controller";
import {
  HealthCheckResponseSchema,
  MetricsResponseSchema,
  ErrorResponseSchema
} from "../schemas/api.schema";

const systemRoutes: FastifyPluginAsync = async (app) => {
  // GET /healthz - Health check endpoint
  app.get("/healthz", {
    schema: {
      description: "System health check - returns 200 if service is up and connected to Redis & Postgres",
      tags: ["System"]
    }
  }, healthCheck);

  // GET /metrics - Prometheus metrics endpoint
  app.get("/metrics", {
    schema: {
      description: "Prometheus metrics endpoint - exposes internal metrics (queue lengths, latencies)",
      tags: ["System"]
    }
  }, getMetrics);
};

export default systemRoutes;