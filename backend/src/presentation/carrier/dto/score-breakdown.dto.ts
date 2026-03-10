// --- AI-ASSISTED ---
// Tool: Claude 4.5 Sonnet
// Prompt: "Create DTO for score breakdown with individual factor scores"
// Modifications: Added API property decorators, validation
// --- END AI-ASSISTED ---

import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO: Score Breakdown
 *
 * Represents the individual factor scores that compose the total score.
 *
 * Used in API responses to show how each factor contributed to the final score.
 */
export class ScoreBreakdownDto {
  @ApiProperty({
    description: 'Safety rating score (0-100)',
    example: 25.0,
    minimum: 0,
    maximum: 100,
  })
  safetyRating: number;

  @ApiProperty({
    description: 'Out-of-service percentage score (0-100)',
    example: 17.5,
    minimum: 0,
    maximum: 100,
  })
  outOfServicePct: number;

  @ApiProperty({
    description: 'Crash total score (0-100)',
    example: 16.0,
    minimum: 0,
    maximum: 100,
  })
  crashTotal: number;

  @ApiProperty({
    description: 'Driver out-of-service percentage score (0-100)',
    example: 14.2,
    minimum: 0,
    maximum: 100,
  })
  driverOosPct: number;

  @ApiProperty({
    description: 'Insurance on file score (0-100)',
    example: 10.0,
    minimum: 0,
    maximum: 100,
  })
  insuranceOnFile: number;

  @ApiProperty({
    description: 'Authority status score (0-100)',
    example: 10.0,
    minimum: 0,
    maximum: 100,
  })
  authorityStatus: number;
}
