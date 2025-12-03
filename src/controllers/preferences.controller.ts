import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { PreferenceSchema } from "../schemas/preferences.schema";

type PreferencePayload = z.infer<typeof PreferenceSchema>;

export const listPreferences = async (
  _request: FastifyRequest,
  reply: FastifyReply
) => {
  return reply.send({ data: [], message: "Preferences fetched" });
};

export const createPreference = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const result = PreferenceSchema.safeParse(request.body);

  if (!result.success) {
    return reply.status(400).send({
      message: "Invalid preference payload",
      errors: result.error.flatten(),
    });
  }

  const payload: PreferencePayload = result.data;

  // TODO: Persist payload to data store.
  return reply.code(201).send({ data: payload, message: "Preference created" });
};
