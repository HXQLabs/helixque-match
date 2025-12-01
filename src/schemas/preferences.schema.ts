import { z } from "zod";

export const PreferenceSchema = z.object({
  domain: z.string(),
  techStacks: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
  experience: z.string()
});
