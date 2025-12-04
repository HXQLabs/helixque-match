import { FastifyReply, FastifyRequest } from "fastify";
import {
  BanUserRequestSchema,
  BanUserResponse,
  DeprioritizeUserRequestSchema,
  DeprioritizeUserResponse,
  QueueDebugResponse,
  ErrorResponse
} from "../schemas/api.schema";

// Mock data stores (same references as match controller)
const mockQueues = new Map<string, any[]>();
const mockUsers = new Map<string, any>();
const mockBannedUsers = new Set<string>();

/**
 * Admin endpoint: Ban a user
 * POST /admin/ban
 */
export const banUser = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const result = BanUserRequestSchema.safeParse(request.body);
    
    if (!result.success) {
      return reply.status(400).send({
        success: false,
        error: {
          code: 400,
          message: "Invalid request payload"
        }
      } as ErrorResponse);
    }

    const { userId, reason } = result.data;

    // Mock: Add user to banned list
    mockBannedUsers.add(userId);
    
    // Mock: Update user record
    const user = mockUsers.get(userId) || { id: userId };
    user.banned = true;
    user.banReason = reason;
    user.bannedAt = new Date();
    user.status = 'OFFLINE';
    mockUsers.set(userId, user);

    // Mock: Remove user from all queues
    for (const [queueKey, queue] of mockQueues) {
      const filteredQueue = queue.filter(item => item.userId !== userId);
      mockQueues.set(queueKey, filteredQueue);
    }

    const response: BanUserResponse = {
      success: true,
      message: `User ${userId} has been banned successfully`
    };

    return reply.send(response);
  } catch (error) {
    request.log.error({ error }, "Error in banUser");
    return reply.status(500).send({
      success: false,
      error: {
        code: 500,
        message: "Internal server error"
      }
    } as ErrorResponse);
  }
};

/**
 * Admin endpoint: Deprioritize a user
 * POST /admin/deprioritize
 */
export const deprioritizeUser = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const result = DeprioritizeUserRequestSchema.safeParse(request.body);
    
    if (!result.success) {
      return reply.status(400).send({
        success: false,
        error: {
          code: 400,
          message: "Invalid request payload"
        }
      } as ErrorResponse);
    }

    const { userId, reason, duration = 60 } = result.data;

    // Mock: Update user priority
    const user = mockUsers.get(userId) || { id: userId };
    user.deprioritized = true;
    user.deprioritizeReason = reason;
    user.deprioritizedAt = new Date();
    user.deprioritizeUntil = new Date(Date.now() + duration * 60 * 1000);
    mockUsers.set(userId, user);

    const response: DeprioritizeUserResponse = {
      success: true,
      message: `User ${userId} has been deprioritized for ${duration} minutes`
    };

    return reply.send(response);
  } catch (error) {
    request.log.error({ error }, "Error in deprioritizeUser");
    return reply.status(500).send({
      success: false,
      error: {
        code: 500,
        message: "Internal server error"
      }
    } as ErrorResponse);
  }
};

/**
 * Debug endpoint: Get queue information
 * GET /debug/queue/:key
 */
export const getQueueInfo = async (
  request: FastifyRequest<{ Params: { key: string }, Querystring: { page?: string, limit?: string } }>,
  reply: FastifyReply
) => {
  try {
    const { key } = request.params;
    const page = parseInt(request.query.page || '1');
    const limit = parseInt(request.query.limit || '10');
    const offset = (page - 1) * limit;

    const queue = mockQueues.get(key) || [];
    const total = queue.length;
    const paginatedUsers = queue.slice(offset, offset + limit);

    const response: QueueDebugResponse = {
      queueKey: key,
      length: total,
      users: paginatedUsers.map(user => ({
        userId: user.userId,
        joinedAt: user.joinedAt,
        preferences: user.preferences
      })),
      pagination: {
        page,
        limit,
        total
      }
    };

    return reply.send(response);
  } catch (error) {
    request.log.error({ error }, "Error in getQueueInfo");
    return reply.status(500).send({
      success: false,
      error: {
        code: 500,
        message: "Internal server error"
      }
    } as ErrorResponse);
  }
};