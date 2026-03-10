// --- AI-ASSISTED ---
// Tool: Claude 4.5 Sonnet
// Prompt: "Create DTO for carrier score history response"
// Modifications: Added API property decorators
// --- END AI-ASSISTED ---

import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO: Score History Entry
 *
 * Represents a single historical score entry.
 *
 * Used in GET /api/carriers/:id/history endpoint.
 */
export class ScoreHistoryEntryDto {
  @ApiProperty({
    description: 'Historical score value (0-100)',
    example: 85.0,
    minimum: 0,
    maximum: 100,
  })
  score: number;

  @ApiProperty({
    description: 'Timestamp when this score was computed',
    example: '2025-01-15T10:30:00.000Z',
    type: Date,
  })
  computedAt: Date;
}
