// --- AI-ASSISTED ---
// Tool: Claude 4.5 Sonnet
// Prompt: "Create a health check controller for Docker and monitoring"
// Modifications: Added basic health check endpoint with uptime
// --- END AI-ASSISTED ---

import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

/**
 * Health Controller
 *
 * Provides health check endpoint for:
 * - Docker health checks
 * - Load balancer health probes
 * - Monitoring systems
 *
 * Endpoint:
 * - GET /api/health
 */
@ApiTags('Health')
@Controller('api/health')
export class HealthController {
  /**
   * GET /api/health
   *
   * Returns service health status.
   *
   * Response:
   * - status: "ok"
   * - uptime: process uptime in seconds
   * - timestamp: current ISO timestamp
   */
  @Get()
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({
    status: 200,
    description: 'Service is healthy',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        uptime: { type: 'number', example: 123.45 },
        timestamp: { type: 'string', example: '2025-03-09T12:34:56.789Z' },
      },
    },
  })
  getHealth() {
    return {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  }
}
