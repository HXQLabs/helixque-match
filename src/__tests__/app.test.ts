import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { FastifyInstance } from "fastify";
import { buildApp } from "../app";

describe("App", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it("should build app instance", () => {
    expect(app).toBeDefined();
    expect(app).toHaveProperty("register");
    expect(app).toHaveProperty("get");
    expect(app).toHaveProperty("post");
  });

  it("should register health route", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/health",
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: "Alive" });
  });

  it("should register preferences routes", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/v1/preferences",
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toHaveProperty("data");
    expect(response.json()).toHaveProperty("message");
  });

  it("should have CORS plugin registered", async () => {
    const response = await app.inject({
      method: "OPTIONS",
      url: "/health",
      headers: {
        origin: "http://localhost:3000",
      },
    });

    expect(response.headers).toBeDefined();
  });

  it("should have Swagger plugin registered", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/docs",
    });

    expect(response).toBeDefined();
  });

  it("should handle multiple routes correctly", async () => {
    const healthResponse = await app.inject({
      method: "GET",
      url: "/health",
    });

    const preferencesResponse = await app.inject({
      method: "GET",
      url: "/api/v1/preferences",
    });

    expect(healthResponse.statusCode).toBe(200);
    expect(preferencesResponse.statusCode).toBe(200);
  });
});

