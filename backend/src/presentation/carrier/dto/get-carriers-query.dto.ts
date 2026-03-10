// --- AI-ASSISTED ---
// Tool: Claude 4.5 Sonnet
// Prompt: "Create query parameter DTO for GET carriers endpoint with validation"
// Modifications: Added class-validator decorators, API property decorators
// --- END AI-ASSISTED ---

import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO: Get Carriers Query Parameters
 *
 * Validates query parameters for GET /api/carriers endpoint.
 *
 * Supports:
 * - Filtering by minimum score
 * - Pagination (limit, skip)
 */
export class GetCarriersQueryDto {
  @ApiPropertyOptional({
    description: 'Maximum number of carriers to return',
    example: 50,
    minimum: 1,
    maximum: 1000,
    default: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(1000)
  limit?: number = 100;

  @ApiPropertyOptional({
    name: 'min_score',
    description: 'Minimum score threshold (0-100)',
    example: 70,
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100)
  min_score?: number;

  @ApiPropertyOptional({
    description: 'Number of carriers to skip (for pagination)',
    example: 0,
    minimum: 0,
    default: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  skip?: number = 0;
}
