import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { FastifyInstance } from "fastify";
import Fastify from "fastify";
import swaggerPlugin from "../swagger";

describe("Swagger Plugin", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = Fastify();
    await app.register(swaggerPlugin);
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it("should register Swagger plugin", async () => {
    expect(app).toBeDefined();
    expect(app.hasPlugin("@fastify/swagger")).toBe(true);
  });

  it("should register Swagger UI plugin", async () => {
    expect(app.hasPlugin("@fastify/swagger-ui")).toBe(true);
  });

  it("should have Swagger UI accessible at /docs", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/docs",
    });

    expect(response.statusCode).toBeGreaterThanOrEqual(200);
    expect(response.statusCode).toBeLessThan(400);
  });

  it("should have OpenAPI JSON schema available", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/docs/json",
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body).toHaveProperty("openapi");
    expect(body.info).toBeDefined();
    expect(body.info.title).toBe("Helixque Match API");
    expect(body.info.version).toBe("1.0.0");
  });

  it("should have correct API information in schema", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/docs/json",
    });

    const body = response.json();
    expect(body.info.description).toBe("API documentation for Helixque Match backend");
    expect(body.servers).toBeDefined();
    expect(Array.isArray(body.servers)).toBe(true);
    expect(body.servers[0].url).toBe("http://localhost:4000");
  });
});

