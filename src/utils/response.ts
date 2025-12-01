import { FastifyReply } from "fastify";

export const sendSuccess = <T>(
	reply: FastifyReply,
	data: T,
	message = "OK",
) => {
	return reply.send({ data, message });
};

export const sendError = (
	reply: FastifyReply,
	statusCode: number,
	message: string,
	details?: unknown,
) => {
	return reply.status(statusCode).send({ message, details });
};
