import { FastifyReply, FastifyRequest } from "fastify";
import {
  InternalJoinRequestSchema,
  InternalJoinResponse,
  InternalCancelRequestSchema,
  InternalCancelResponse,
  InternalFeedbackRequestSchema,
  InternalMarkEndRequestSchema,
  SuccessResponse,
  ErrorResponse
} from "../schemas/api.schema";

// Mock data store (in production, this would be Redis/Postgres)
const mockQueues = new Map<string, any[]>();
const mockMatches = new Map<string, any>();
const mockUsers = new Map<string, any>();

/**
 * Internal endpoint: Join matching queue
 * POST /match/join
 */
export const joinMatch = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const result = InternalJoinRequestSchema.safeParse(request.body);
    
    if (!result.success) {
      return reply.status(400).send({
        success: false,
        error: {
          code: 400,
          message: "Invalid request payload",
          details: result.error.message
        }
      } as ErrorResponse);
    }

    const { userId, mode, preferences, requestId } = result.data;

    // Check for idempotency
    if (requestId && mockUsers.has(`${userId}:${requestId}`)) {
      const existingResponse = mockUsers.get(`${userId}:${requestId}`);
      return reply.send(existingResponse);
    }

    // Mock user validation (check if banned, etc.)
    const user = mockUsers.get(userId) || { id: userId, status: 'ONLINE', banned: false };
    
    if (user.banned) {
      return reply.status(403).send({
        success: false,
        error: {
          code: 403,
          message: "User is banned from matching"
        }
      } as ErrorResponse);
    }

    // Mock matching logic
    const queueKey = mode === 'strict' ? 'strict_queue' : `loose_${preferences.language}`;
    const queue = mockQueues.get(queueKey) || [];
    
    // Simple mock matching: if queue has someone, match immediately
    if (queue.length > 0) {
      const partner = queue.shift();
      mockQueues.set(queueKey, queue);
      
      const matchId = `match_${Date.now()}`;
      const match = {
        id: matchId,
        userAId: partner.userId,
        userBId: userId,
        mode: mode.toUpperCase(),
        createdAt: new Date(),
        status: 'active'
      };
      
      mockMatches.set(matchId, match);
      
      const response: InternalJoinResponse = {
        status: "matched",
        matchId,
        peerId: partner.userId,
        prefKey: mode === 'strict' ? generatePrefKey(preferences) : undefined
      };

      if (requestId) {
        mockUsers.set(`${userId}:${requestId}`, response);
      }

      return reply.send(response);
    } else {
      // Add to queue
      queue.push({ userId, preferences, joinedAt: new Date() });
      mockQueues.set(queueKey, queue);
      
      const response: InternalJoinResponse = {
        status: "waiting"
      };

      if (requestId) {
        mockUsers.set(`${userId}:${requestId}`, response);
      }

      return reply.send(response);
    }
  } catch (error) {
    request.log.error({ error }, "Error in joinMatch");
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
 * Internal endpoint: Cancel matching
 * POST /match/cancel
 */
export const cancelMatch = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const result = InternalCancelRequestSchema.safeParse(request.body);
    
    if (!result.success) {
      return reply.status(400).send({
        success: false,
        error: {
          code: 400,
          message: "Invalid request payload"
        }
      } as ErrorResponse);
    }

    const { userId, mode } = result.data;

    // Remove user from all relevant queues
    const queuesToCheck = mode ? 
      [mode === 'strict' ? 'strict_queue' : 'loose_queue'] :
      Array.from(mockQueues.keys());

    for (const queueKey of queuesToCheck) {
      const queue = mockQueues.get(queueKey) || [];
      const filteredQueue = queue.filter(item => item.userId !== userId);
      mockQueues.set(queueKey, filteredQueue);
    }

    const response: InternalCancelResponse = {
      status: "cancelled"
    };

    return reply.send(response);
  } catch (error) {
    request.log.error({ error }, "Error in cancelMatch");
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
 * Internal endpoint: Submit feedback
 * POST /match/feedback
 */
export const submitFeedback = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const result = InternalFeedbackRequestSchema.safeParse(request.body);
    
    if (!result.success) {
      return reply.status(400).send({
        success: false,
        error: {
          code: 400,
          message: "Invalid feedback payload"
        }
      } as ErrorResponse);
    }

    const { matchId, fromUserId, toUserId, rating, tags } = result.data;

    // Mock: Store feedback and update user rating
    const feedbackId = `feedback_${Date.now()}`;
    const feedback = {
      id: feedbackId,
      matchId,
      fromUserId,
      toUserId,
      rating,
      tags,
      createdAt: new Date()
    };

    // Mock: Update user rating (simplified moving average)
    const user = mockUsers.get(toUserId) || { id: toUserId, ratingScore: 0, ratingCount: 0 };
    const newRatingCount = user.ratingCount + 1;
    const newRatingScore = (user.ratingScore * user.ratingCount + rating) / newRatingCount;
    
    user.ratingScore = newRatingScore;
    user.ratingCount = newRatingCount;
    mockUsers.set(toUserId, user);

    const response: SuccessResponse = {
      success: true,
      message: "Feedback submitted successfully",
      data: { feedbackId }
    };

    return reply.send(response);
  } catch (error) {
    request.log.error({ error }, "Error in submitFeedback");
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
 * Internal endpoint: Mark match as ended
 * POST /match/mark_end
 */
export const markMatchEnd = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const result = InternalMarkEndRequestSchema.safeParse(request.body);
    
    if (!result.success) {
      return reply.status(400).send({
        success: false,
        error: {
          code: 400,
          message: "Invalid request payload"
        }
      } as ErrorResponse);
    }

    const { matchId, userId, reason } = result.data;

    // Mock: Update match record
    const match = mockMatches.get(matchId);
    if (!match) {
      return reply.status(404).send({
        success: false,
        error: {
          code: 404,
          message: "Match not found"
        }
      } as ErrorResponse);
    }

    match.endedAt = new Date();
    match.endedBy = userId;
    match.endReason = reason;
    match.status = 'ended';
    
    mockMatches.set(matchId, match);

    // Mock: Update user statuses to ONLINE
    const userA = mockUsers.get(match.userAId) || { id: match.userAId };
    const userB = mockUsers.get(match.userBId) || { id: match.userBId };
    
    userA.status = 'ONLINE';
    userB.status = 'ONLINE';
    userA.currentMatchId = undefined;
    userB.currentMatchId = undefined;
    
    mockUsers.set(match.userAId, userA);
    mockUsers.set(match.userBId, userB);

    const response: SuccessResponse = {
      success: true,
      message: "Match ended successfully"
    };

    return reply.send(response);
  } catch (error) {
    request.log.error({ error }, "Error in markMatchEnd");
    return reply.status(500).send({
      success: false,
      error: {
        code: 500,
        message: "Internal server error"
      }
    } as ErrorResponse);
  }
};

// Helper function to generate preference key for strict matching
function generatePrefKey(preferences: any): string {
  const keys = [
    `lang=${preferences.language}`,
    `domain=${preferences.domain}`,
    `exp=${preferences.experience}`,
    `stack=${preferences.techStack.sort().join(',')}`
  ];
  return keys.join('|');
}