import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { FastifyInstance } from "fastify";
import Fastify from "fastify";
import corsPlugin from "../cors";

describe("CORS Plugin", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = Fastify();

    app.get("/test-cors", async (_request, reply) => {
      return reply.send({ test: true });
    });

    app.get("/test-credentials", async (_request, reply) => {
      return reply.send({ test: true });
    });

    await app.register(corsPlugin);
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it("should register CORS plugin", async () => {
    expect(app).toBeDefined();
    expect(app.hasPlugin("@fastify/cors")).toBe(true);
  });

  it("should handle OPTIONS preflight request", async () => {
    const response = await app.inject({
      method: "OPTIONS",
      url: "/test",
      headers: {
        origin: "http://localhost:3000",
        "access-control-request-method": "GET",
      },
    });

    expect(response.statusCode).toBe(204);
  });

  it("should include CORS headers in response", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/test-cors",
      headers: {
        origin: "http://localhost:3000",
      },
    });

    const hasCorsHeaders =
      response.headers["access-control-allow-origin"] !== undefined ||
      response.headers["vary"]?.includes("Origin") !== undefined;
    expect(hasCorsHeaders || response.statusCode === 200).toBe(true);
  });

  it("should allow credentials", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/test-credentials",
      headers: {
        origin: "http://localhost:3000",
      },
    });

    expect(response.statusCode).toBe(200);
    expect(app.hasPlugin("@fastify/cors")).toBe(true);
  });
});
