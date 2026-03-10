// --- AI-ASSISTED ---
// Tool: Claude 4.5 Sonnet
// Prompt: "Create DTO for CCF processing summary response"
// Modifications: Added API property decorators
// --- END AI-ASSISTED ---

import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO: Processing Summary
 *
 * Represents the result of processing a CCF file.
 *
 * Returned by POST /api/ccf/upload endpoint.
 *
 * Provides metrics on:
 * - Total carriers processed
 * - How many were unchanged (hash matched)
 * - How many were updated (hash changed)
 * - How many were new
 */
export class ProcessingSummaryDto {
  @ApiProperty({
    description: 'Total number of carriers processed',
    example: 100,
    minimum: 0,
  })
  total: number;

  @ApiProperty({
    description: 'Number of carriers that were unchanged (hash matched)',
    example: 90,
    minimum: 0,
  })
  unchanged: number;

  @ApiProperty({
    description: 'Number of existing carriers that were updated (hash changed)',
    example: 8,
    minimum: 0,
  })
  updated: number;

  @ApiProperty({
    description: 'Number of new carriers created',
    example: 2,
    minimum: 0,
  })
  new: number;

  @ApiProperty({
    description: 'Correlation ID for request tracing (optional)',
    example: 'abc123-def456',
    required: false,
  })
  correlationId?: string;
}
