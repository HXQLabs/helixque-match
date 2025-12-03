import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { FastifyInstance } from "fastify";
import { buildTestApp, closeTestApp } from "../../utils/__tests__/test-helpers";

describe("Preferences Routes", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildTestApp();
  });

  afterAll(async () => {
    await closeTestApp(app);
  });

  describe("GET /api/v1/preferences", () => {
    it("should return empty preferences list", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/v1/preferences",
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body).toHaveProperty("data");
      expect(body).toHaveProperty("message");
      expect(body.data).toEqual([]);
      expect(body.message).toBe("Preferences fetched");
    });

    it("should have correct content type", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/v1/preferences",
      });

      expect(response.headers["content-type"]).toContain("application/json");
    });
  });

  describe("POST /api/v1/preferences", () => {
    it("should create a preference with valid payload", async () => {
      const validPayload = {
        domain: "backend",
        experience: "senior",
        techStacks: ["Node.js", "TypeScript"],
        languages: ["JavaScript", "TypeScript"],
      };

      const response = await app.inject({
        method: "POST",
        url: "/api/v1/preferences",
        payload: validPayload,
      });

      expect(response.statusCode).toBe(201);
      const body = response.json();
      expect(body).toHaveProperty("data");
      expect(body).toHaveProperty("message");
      expect(body.data).toEqual(validPayload);
      expect(body.message).toBe("Preference created");
    });

    it("should create a preference with minimal required fields", async () => {
      const minimalPayload = {
        domain: "frontend",
        experience: "junior",
      };

      const response = await app.inject({
        method: "POST",
        url: "/api/v1/preferences",
        payload: minimalPayload,
      });

      expect(response.statusCode).toBe(201);
      const body = response.json();
      expect(body.data.domain).toBe(minimalPayload.domain);
      expect(body.data.experience).toBe(minimalPayload.experience);
    });

    it("should reject invalid payload - missing required field", async () => {
      const invalidPayload = {
        experience: "senior",
      };

      const response = await app.inject({
        method: "POST",
        url: "/api/v1/preferences",
        payload: invalidPayload,
      });

      expect(response.statusCode).toBe(400);
      const body = response.json();
      expect(body).toHaveProperty("message");
      expect(body.message).toBe("Invalid preference payload");
      expect(body).toHaveProperty("errors");
    });

    it("should reject invalid payload - wrong type", async () => {
      const invalidPayload = {
        domain: 123,
        experience: "senior",
      };

      const response = await app.inject({
        method: "POST",
        url: "/api/v1/preferences",
        payload: invalidPayload,
      });

      expect(response.statusCode).toBe(400);
      const body = response.json();
      expect(body.message).toBe("Invalid preference payload");
    });

    it("should accept empty domain string (Zod allows empty strings by default)", async () => {
      const payload = {
        domain: "",
        experience: "senior",
      };

      const response = await app.inject({
        method: "POST",
        url: "/api/v1/preferences",
        payload,
      });

      expect(response.statusCode).toBe(201);
      const body = response.json();
      expect(body.data.domain).toBe("");
    });

    it("should accept valid optional arrays", async () => {
      const payload = {
        domain: "fullstack",
        experience: "mid",
        techStacks: ["React", "Node.js"],
        languages: ["TypeScript"],
      };

      const response = await app.inject({
        method: "POST",
        url: "/api/v1/preferences",
        payload,
      });

      expect(response.statusCode).toBe(201);
      const body = response.json();
      expect(body.data.techStacks).toEqual(payload.techStacks);
      expect(body.data.languages).toEqual(payload.languages);
    });

    it("should handle empty arrays in optional fields", async () => {
      const payload = {
        domain: "devops",
        experience: "senior",
        techStacks: [],
        languages: [],
      };

      const response = await app.inject({
        method: "POST",
        url: "/api/v1/preferences",
        payload,
      });

      expect(response.statusCode).toBe(201);
      const body = response.json();
      expect(body.data.techStacks).toEqual([]);
      expect(body.data.languages).toEqual([]);
    });
  });
});
