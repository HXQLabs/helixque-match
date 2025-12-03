import { describe, it, expect } from "vitest";
import { env } from "../env";

describe("Env Config", () => {
  it("should export env object", () => {
    expect(env).toBeDefined();
    expect(typeof env).toBe("object");
  });

  it("should have NODE_ENV property", () => {
    expect(env).toHaveProperty("NODE_ENV");
    expect(typeof env.NODE_ENV).toBe("string");
  });

  it("should have PORT property as number", () => {
    expect(env).toHaveProperty("PORT");
    expect(typeof env.PORT).toBe("number");
    expect(env.PORT).toBeGreaterThan(0);
  });

  it("should have LOG_LEVEL property", () => {
    expect(env).toHaveProperty("LOG_LEVEL");
    expect(typeof env.LOG_LEVEL).toBe("string");
  });

  it("should have valid default values or parsed values", () => {
    expect(["development", "production", "test"]).toContain(
      env.NODE_ENV || "development"
    );
    expect(env.PORT).toBeGreaterThan(0);
    expect(env.PORT).toBeLessThan(65536);
    expect(env.LOG_LEVEL.length).toBeGreaterThan(0);
  });

  it("should parse PORT from environment variable as number", () => {
    expect(Number.isInteger(env.PORT)).toBe(true);
  });
});

