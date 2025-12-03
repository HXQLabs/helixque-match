import { describe, it, expect, beforeEach, vi } from "vitest";
import { FastifyReply } from "fastify";
import { sendSuccess, sendError } from "../response";

describe("Response Utils", () => {
  let mockReply: Partial<FastifyReply>;

  beforeEach(() => {
    mockReply = {
      send: vi.fn().mockReturnThis(),
      status: vi.fn().mockReturnThis(),
    };
  });

  describe("sendSuccess", () => {
    it("should send success response with default message", () => {
      const data = { id: 1, name: "Test" };
      sendSuccess(mockReply as FastifyReply, data);

      expect(mockReply.send).toHaveBeenCalledWith({
        data,
        message: "OK",
      });
    });

    it("should send success response with custom message", () => {
      const data = { id: 1, name: "Test" };
      const customMessage = "Custom success message";
      sendSuccess(mockReply as FastifyReply, data, customMessage);

      expect(mockReply.send).toHaveBeenCalledWith({
        data,
        message: customMessage,
      });
    });

    it("should handle array data", () => {
      const data = [{ id: 1 }, { id: 2 }];
      sendSuccess(mockReply as FastifyReply, data);

      expect(mockReply.send).toHaveBeenCalledWith({
        data,
        message: "OK",
      });
    });

    it("should handle null data", () => {
      sendSuccess(mockReply as FastifyReply, null);

      expect(mockReply.send).toHaveBeenCalledWith({
        data: null,
        message: "OK",
      });
    });

    it("should handle empty object data", () => {
      const data = {};
      sendSuccess(mockReply as FastifyReply, data);

      expect(mockReply.send).toHaveBeenCalledWith({
        data,
        message: "OK",
      });
    });

    it("should handle empty array data", () => {
      const data: unknown[] = [];
      sendSuccess(mockReply as FastifyReply, data);

      expect(mockReply.send).toHaveBeenCalledWith({
        data,
        message: "OK",
      });
    });

    it("should return the reply object for chaining", () => {
      const data = { id: 1 };
      const result = sendSuccess(mockReply as FastifyReply, data);

      expect(result).toBe(mockReply);
    });
  });

  describe("sendError", () => {
    it("should send error response with status code and message", () => {
      const statusCode = 400;
      const message = "Bad Request";

      sendError(mockReply as FastifyReply, statusCode, message);

      expect(mockReply.status).toHaveBeenCalledWith(statusCode);
      expect(mockReply.send).toHaveBeenCalledWith({
        message,
      });
    });

    it("should send error response with details", () => {
      const statusCode = 422;
      const message = "Validation Error";
      const details = { field: "email", reason: "Invalid format" };

      sendError(mockReply as FastifyReply, statusCode, message, details);

      expect(mockReply.status).toHaveBeenCalledWith(statusCode);
      expect(mockReply.send).toHaveBeenCalledWith({
        message,
        details,
      });
    });

    it("should handle different status codes", () => {
      const statusCodes = [400, 401, 403, 404, 500];
      const message = "Error";

      statusCodes.forEach((code) => {
        sendError(mockReply as FastifyReply, code, message);
        expect(mockReply.status).toHaveBeenCalledWith(code);
      });
    });

    it("should handle null details", () => {
      const statusCode = 500;
      const message = "Internal Server Error";

      sendError(mockReply as FastifyReply, statusCode, message, null);

      expect(mockReply.status).toHaveBeenCalledWith(statusCode);
      expect(mockReply.send).toHaveBeenCalledWith({
        message,
        details: null,
      });
    });

    it("should handle undefined details", () => {
      const statusCode = 404;
      const message = "Not Found";

      sendError(mockReply as FastifyReply, statusCode, message, undefined);

      expect(mockReply.status).toHaveBeenCalledWith(statusCode);
      expect(mockReply.send).toHaveBeenCalledWith({
        message,
      });
    });

    it("should return the reply object for chaining", () => {
      const result = sendError(
        mockReply as FastifyReply,
        400,
        "Error"
      );

      expect(result).toBe(mockReply);
    });
  });
});

