import { describe, it, expect, beforeEach, vi } from "vitest";
import { FastifyRequest, FastifyReply } from "fastify";
import {
  listPreferences,
  createPreference,
} from "../preferences.controller";

describe("Preferences Controller", () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;

  beforeEach(() => {
    mockRequest = {
      body: {},
    };

    mockReply = {
      send: vi.fn().mockReturnThis(),
      status: vi.fn().mockReturnThis(),
      code: vi.fn().mockReturnThis(),
    };
  });

  describe("listPreferences", () => {
    it("should return empty preferences list with success message", async () => {
      await listPreferences(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply
      );

      expect(mockReply.send).toHaveBeenCalledWith({
        data: [],
        message: "Preferences fetched",
      });
    });

    it("should return correct response structure", async () => {
      await listPreferences(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply
      );

      expect(mockReply.send).toHaveBeenCalledTimes(1);
      const callArgs = (mockReply.send as ReturnType<typeof vi.fn>).mock
        .calls[0][0];
      expect(callArgs).toHaveProperty("data");
      expect(callArgs).toHaveProperty("message");
      expect(Array.isArray(callArgs.data)).toBe(true);
    });
  });

  describe("createPreference", () => {
    it("should create preference with valid payload", async () => {
      const validPayload = {
        domain: "backend",
        experience: "senior",
        techStacks: ["Node.js"],
        languages: ["TypeScript"],
      };

      mockRequest.body = validPayload;

      await createPreference(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply
      );

      expect(mockReply.code).toHaveBeenCalledWith(201);
      expect(mockReply.send).toHaveBeenCalledWith({
        data: validPayload,
        message: "Preference created",
      });
    });

    it("should create preference with minimal required fields", async () => {
      const minimalPayload = {
        domain: "frontend",
        experience: "junior",
      };

      mockRequest.body = minimalPayload;

      await createPreference(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply
      );

      expect(mockReply.code).toHaveBeenCalledWith(201);
      expect(mockReply.send).toHaveBeenCalledWith({
        data: minimalPayload,
        message: "Preference created",
      });
    });

    it("should reject invalid payload - missing domain", async () => {
      const invalidPayload = {
        experience: "senior",
      };

      mockRequest.body = invalidPayload;

      await createPreference(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply
      );

      expect(mockReply.status).toHaveBeenCalledWith(400);
      expect(mockReply.send).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Invalid preference payload",
          errors: expect.any(Object),
        })
      );
    });

    it("should reject invalid payload - missing experience", async () => {
      const invalidPayload = {
        domain: "backend",
      };

      mockRequest.body = invalidPayload;

      await createPreference(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply
      );

      expect(mockReply.status).toHaveBeenCalledWith(400);
      expect(mockReply.send).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Invalid preference payload",
        })
      );
    });

    it("should reject invalid payload - wrong type for domain", async () => {
      const invalidPayload = {
        domain: 123,
        experience: "senior",
      };

      mockRequest.body = invalidPayload;

      await createPreference(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply
      );

      expect(mockReply.status).toHaveBeenCalledWith(400);
    });

    it("should reject invalid payload - wrong type for arrays", async () => {
      const invalidPayload = {
        domain: "backend",
        experience: "senior",
        techStacks: "not-an-array",
      };

      mockRequest.body = invalidPayload;

      await createPreference(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply
      );

      expect(mockReply.status).toHaveBeenCalledWith(400);
    });

    it("should accept valid optional arrays", async () => {
      const payload = {
        domain: "fullstack",
        experience: "mid",
        techStacks: ["React", "Node.js"],
        languages: ["TypeScript"],
      };

      mockRequest.body = payload;

      await createPreference(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply
      );

      expect(mockReply.code).toHaveBeenCalledWith(201);
      const callArgs = (mockReply.send as ReturnType<typeof vi.fn>).mock
        .calls[0][0];
      expect(callArgs.data.techStacks).toEqual(payload.techStacks);
      expect(callArgs.data.languages).toEqual(payload.languages);
    });
  });
});

