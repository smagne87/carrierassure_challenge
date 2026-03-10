// --- AI-ASSISTED ---
// Tool: Claude 4.5 Sonnet
// Prompt: "Create DTO for carrier API response with all carrier details"
// Modifications: Added API property decorators, mapper from domain entity
// --- END AI-ASSISTED ---

import { ApiProperty } from '@nestjs/swagger';
import { Carrier } from '../../../domain/carrier/entities/carrier.entity.js';
import { ScoreBreakdownDto } from './score-breakdown.dto.js';

/**
 * DTO: Carrier Response
 *
 * Represents a carrier in API responses.
 *
 * This DTO:
 * - Exposes carrier data to API consumers
 * - Hides internal implementation details (value objects, etc.)
 * - Provides Swagger/OpenAPI documentation
 *
 * Mapping:
 * - Carrier entity → CarrierResponseDto (via fromEntity mapper)
 */
export class CarrierResponseDto {
  @ApiProperty({
    description: 'Unique carrier identifier (MC number)',
    example: 'MC-123456',
  })
  carrierId: string;

  @ApiProperty({
    description: 'USDOT number',
    example: '1234567',
  })
  dotNumber: string;

  @ApiProperty({
    description: 'Legal name of the carrier',
    example: 'Reliable Freight LLC',
  })
  legalName: string;

  @ApiProperty({
    description: 'USDOT safety rating',
    example: 'Satisfactory',
    enum: ['Satisfactory', 'Conditional', 'Unsatisfactory'],
  })
  safetyRating: string;

  @ApiProperty({
    description: 'Vehicle out-of-service percentage (0-100)',
    example: 12.5,
    minimum: 0,
    maximum: 100,
  })
  outOfServicePct: number;

  @ApiProperty({
    description: 'Total crashes in last 24 months',
    example: 2,
    minimum: 0,
  })
  crashTotal: number;

  @ApiProperty({
    description: 'Driver out-of-service percentage (0-100)',
    example: 5.3,
    minimum: 0,
    maximum: 100,
  })
  driverOosPct: number;

  @ApiProperty({
    description: 'Whether valid insurance is on file',
    example: true,
  })
  insuranceOnFile: boolean;

  @ApiProperty({
    description: 'Operating authority status',
    example: 'Active',
    enum: ['Active', 'Inactive', 'Revoked'],
  })
  authorityStatus: string;

  @ApiProperty({
    description: 'Date of last USDOT inspection',
    example: '2025-11-15T00:00:00.000Z',
    type: Date,
  })
  lastInspectionDate: Date;

  @ApiProperty({
    description: 'Number of vehicles in fleet',
    example: 45,
    minimum: 1,
  })
  fleetSize: number;

  @ApiProperty({
    description: 'Current composite safety score (0-100)',
    example: 87.5,
    minimum: 0,
    maximum: 100,
  })
  currentScore: number;

  @ApiProperty({
    description: 'Breakdown of score by individual factors',
    type: ScoreBreakdownDto,
  })
  scoreBreakdown: ScoreBreakdownDto;

  @ApiProperty({
    description: 'SHA-256 hash of carrier data (for change detection)',
    example: 'a1b2c3d4e5f6...',
  })
  currentHash: string;

  @ApiProperty({
    description: 'Timestamp when carrier was created',
    example: '2025-01-10T12:34:56.789Z',
    type: Date,
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Timestamp when carrier was last updated',
    example: '2025-03-09T15:22:11.456Z',
    type: Date,
  })
  updatedAt: Date;

  /**
   * Mapper: Carrier entity → CarrierResponseDto
   *
   * Converts domain entity to DTO for API response.
   *
   * @param carrier Carrier domain entity
   * @returns CarrierResponseDto
   */
  static fromEntity(carrier: Carrier): CarrierResponseDto {
    const dto = new CarrierResponseDto();
    dto.carrierId = carrier.carrierId.value;
    dto.dotNumber = carrier.dotNumber.value;
    dto.legalName = carrier.legalName;
    dto.safetyRating = carrier.safetyRating.value;
    dto.outOfServicePct = carrier.outOfServicePct;
    dto.crashTotal = carrier.crashTotal;
    dto.driverOosPct = carrier.driverOosPct;
    dto.insuranceOnFile = carrier.insuranceOnFile;
    dto.authorityStatus = carrier.authorityStatus.value;
    dto.lastInspectionDate = carrier.lastInspectionDate;
    dto.fleetSize = carrier.fleetSize;
    dto.currentScore = carrier.currentScore.total;
    dto.scoreBreakdown = carrier.currentScore.breakdown;
    dto.currentHash = carrier.currentHash.value;
    dto.createdAt = carrier.createdAt;
    dto.updatedAt = carrier.updatedAt;
    return dto;
  }
}
