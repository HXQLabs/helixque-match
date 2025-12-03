import { describe, it, expect } from "vitest";
import { PreferenceSchema } from "../preferences.schema";

describe("PreferenceSchema", () => {
  describe("Valid inputs", () => {
    it("should validate minimal required fields", () => {
      const validInput = {
        domain: "backend",
        experience: "senior",
      };

      const result = PreferenceSchema.safeParse(validInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.domain).toBe("backend");
        expect(result.data.experience).toBe("senior");
      }
    });

    it("should validate with all optional fields", () => {
      const validInput = {
        domain: "frontend",
        experience: "junior",
        techStacks: ["React", "Vue"],
        languages: ["JavaScript", "TypeScript"],
      };

      const result = PreferenceSchema.safeParse(validInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.domain).toBe("frontend");
        expect(result.data.experience).toBe("junior");
        expect(result.data.techStacks).toEqual(["React", "Vue"]);
        expect(result.data.languages).toEqual(["JavaScript", "TypeScript"]);
      }
    });

    it("should validate with empty optional arrays", () => {
      const validInput = {
        domain: "devops",
        experience: "mid",
        techStacks: [],
        languages: [],
      };

      const result = PreferenceSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it("should validate with only techStacks", () => {
      const validInput = {
        domain: "backend",
        experience: "senior",
        techStacks: ["Node.js"],
      };

      const result = PreferenceSchema.safeParse(validInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.techStacks).toEqual(["Node.js"]);
        expect(result.data.languages).toBeUndefined();
      }
    });

    it("should validate with only languages", () => {
      const validInput = {
        domain: "frontend",
        experience: "junior",
        languages: ["TypeScript"],
      };

      const result = PreferenceSchema.safeParse(validInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.languages).toEqual(["TypeScript"]);
        expect(result.data.techStacks).toBeUndefined();
      }
    });
  });

  describe("Invalid inputs", () => {
    it("should reject missing domain", () => {
      const invalidInput = {
        experience: "senior",
      };

      const result = PreferenceSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it("should reject missing experience", () => {
      const invalidInput = {
        domain: "backend",
      };

      const result = PreferenceSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it("should accept empty domain string (Zod allows empty strings by default)", () => {
      const input = {
        domain: "",
        experience: "senior",
      };

      const result = PreferenceSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("should reject wrong type for domain", () => {
      const invalidInput = {
        domain: 123,
        experience: "senior",
      };

      const result = PreferenceSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it("should reject wrong type for experience", () => {
      const invalidInput = {
        domain: "backend",
        experience: 123,
      };

      const result = PreferenceSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it("should reject wrong type for techStacks", () => {
      const invalidInput = {
        domain: "backend",
        experience: "senior",
        techStacks: "not-an-array",
      };

      const result = PreferenceSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it("should reject wrong type for languages", () => {
      const invalidInput = {
        domain: "backend",
        experience: "senior",
        languages: "not-an-array",
      };

      const result = PreferenceSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it("should reject non-string items in techStacks", () => {
      const invalidInput = {
        domain: "backend",
        experience: "senior",
        techStacks: [123, "Node.js"],
      };

      const result = PreferenceSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it("should reject non-string items in languages", () => {
      const invalidInput = {
        domain: "backend",
        experience: "senior",
        languages: [true, "TypeScript"],
      };

      const result = PreferenceSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it("should reject empty object", () => {
      const invalidInput = {};

      const result = PreferenceSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it("should reject null", () => {
      const result = PreferenceSchema.safeParse(null);
      expect(result.success).toBe(false);
    });

    it("should reject undefined", () => {
      const result = PreferenceSchema.safeParse(undefined);
      expect(result.success).toBe(false);
    });
  });
});

