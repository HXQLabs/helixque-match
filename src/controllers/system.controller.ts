import { FastifyReply, FastifyRequest } from "fastify";
import {
  HealthCheckResponse,
  MetricsResponse,
  ErrorResponse
} from "../schemas/api.schema";

// Mock data stores
const mockQueues = new Map<string, any[]>();
const mockMatches = new Map<string, any>();
const startTime = Date.now();

/**
 * Health check endpoint
 * GET /healthz
 */
export const healthCheck = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    // Mock service health checks
    const redisHealthy = true; // In production: await redis.ping()
    const postgresHealthy = true; // In production: await db.raw('SELECT 1')

    if (!redisHealthy || !postgresHealthy) {
      return reply.status(503).send({
        success: false,
        error: {
          code: 503,
          message: "Service unhealthy",
          details: `Redis: ${redisHealthy ? 'OK' : 'FAIL'}, Postgres: ${postgresHealthy ? 'OK' : 'FAIL'}`
        }
      } as ErrorResponse);
    }

    const response: HealthCheckResponse = {
      status: "healthy",
      timestamp: new Date(),
      services: {
        redis: redisHealthy,
        postgres: postgresHealthy
      },
      uptime: Date.now() - startTime
    };

    return reply.send(response);
  } catch (error) {
    request.log.error({ error }, "Error in healthCheck");
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
 * Metrics endpoint for Prometheus
 * GET /metrics
 */
export const getMetrics = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    // Mock metrics calculation
    const queues = {
      strict_total: mockQueues.get('strict_queue')?.length || 0,
      loose_total: Array.from(mockQueues.entries())
        .filter(([key]) => key.startsWith('loose_'))
        .reduce((sum, [, queue]) => sum + queue.length, 0),
      by_language: {}
    } as any;

    // Calculate by language
    for (const [key, queue] of mockQueues.entries()) {
      if (key.startsWith('loose_')) {
        const language = key.replace('loose_', '');
        queues.by_language[language] = queue.length;
      }
    }

    const activeMatches = Array.from(mockMatches.values())
      .filter(match => match.status === 'active');

    const completedTodayMatches = Array.from(mockMatches.values())
      .filter(match => {
        if (!match.endedAt) return false;
        const today = new Date();
        const matchDate = new Date(match.endedAt);
        return matchDate.toDateString() === today.toDateString();
      });

    // Mock system metrics
    const response: MetricsResponse = {
      queues,
      matches: {
        total_active: activeMatches.length,
        completed_today: completedTodayMatches.length,
        average_wait_time: calculateAverageWaitTime()
      },
      system: {
        memory_usage: process.memoryUsage().heapUsed / 1024 / 1024, // MB
        cpu_usage: Math.random() * 100, // Mock CPU usage
        connections: mockQueues.size + mockMatches.size
      }
    };

    return reply.send(response);
  } catch (error) {
    request.log.error({ error }, "Error in getMetrics");
    return reply.status(500).send({
      success: false,
      error: {
        code: 500,
        message: "Internal server error"
      }
    } as ErrorResponse);
  }
};

// Helper function to calculate average wait time
function calculateAverageWaitTime(): number {
  let totalWaitTime = 0;
  let userCount = 0;

  for (const queue of mockQueues.values()) {
    for (const user of queue) {
      if (user.joinedAt) {
        totalWaitTime += Date.now() - user.joinedAt.getTime();
        userCount++;
      }
    }
  }

  return userCount > 0 ? totalWaitTime / userCount / 1000 : 0; // Return in seconds
}