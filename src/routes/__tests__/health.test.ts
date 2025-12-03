import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { FastifyInstance } from "fastify";
import { buildTestApp, closeTestApp } from "../../utils/__tests__/test-helpers";

describe("Health Route", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildTestApp();
  });

  afterAll(async () => {
    await closeTestApp(app);
  });

  it("should return health status", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/health",
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: "Alive" });
  });

  it("should have correct content type", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/health",
    });

    expect(response.headers["content-type"]).toContain("application/json");
  });
});
