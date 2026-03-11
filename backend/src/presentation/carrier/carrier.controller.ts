// --- AI-ASSISTED ---
// Tool: Claude 4.5 Sonnet
// Prompt: "Create NestJS REST controller for carrier operations with file upload, queries, and CQRS integration"
// Modifications: Added Swagger decorators, file upload handling, CQRS command/query dispatching, DTO mappers
// --- END AI-ASSISTED ---

import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  NotFoundException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { ProcessCCFFileCommand } from '../../application/carrier/commands/process-ccf-file/process-ccf-file.command.js';
import { GetCarriersQuery } from '../../application/carrier/queries/get-carriers/get-carriers.query.js';
import { GetCarrierByIdQuery } from '../../application/carrier/queries/get-carrier-by-id/get-carrier-by-id.query.js';
import { GetCarrierHistoryQuery } from '../../application/carrier/queries/get-carrier-history/get-carrier-history.query.js';
import { Carrier } from '../../domain/carrier/entities/carrier.entity.js';
import { CarrierResponseDto } from './dto/carrier-response.dto.js';
import { ProcessingSummaryDto } from './dto/processing-summary.dto.js';
import { GetCarriersQueryDto } from './dto/get-carriers-query.dto.js';
import { ScoreHistoryEntryDto } from './dto/score-history.dto.js';
import { CCFData } from '../../domain/carrier/entities/carrier.entity.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Carrier Controller - REST API
 *
 * Provides HTTP endpoints for carrier operations:
 * - POST /api/ccf/upload - Upload and process CCF file
 * - GET /api/carriers - List carriers with filters
 * - GET /api/carriers/:id - Get single carrier
 * - GET /api/carriers/:id/history - Get score history
 *
 * Architecture Pattern:
 * - Uses CQRS (CommandBus for writes, QueryBus for reads)
 * - Maps between DTOs (API layer) and domain entities
 * - Provides Swagger/OpenAPI documentation
 *
 * Error Handling:
 * - BadRequestException for validation errors
 * - NotFoundException for missing resources
 * - Structured error responses
 */
@ApiTags('Carriers')
@Controller('api')
export class CarrierController {
  private readonly logger = new Logger(CarrierController.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  /**
   * POST /api/ccf/upload
   *
   * Uploads and processes a Carrier Compliance File (CCF).
   *
   * Request:
   * - Multipart form data with "file" field
   * - File must be valid JSON
   * - Max size: 10MB (configured in .env)
   *
   * Response:
   * - Processing summary: {total, unchanged, updated, new}
   *
   * Business Flow:
   * 1. Validate file format
   * 2. Parse JSON
   * 3. Dispatch ProcessCCFFileCommand
   * 4. Return summary
   */
  @Post('ccf/upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload and process a CCF file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'CCF JSON file',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'CCF file processed successfully',
    type: ProcessingSummaryDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid file format or missing file',
  })
  async uploadCCFFile(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ProcessingSummaryDto> {
    const correlationId = uuidv4();

    this.logger.log(
      `[${correlationId}] Received CCF upload: ${file?.originalname}`,
    );

    // Validate file presence
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // Validate file type
    if (file.mimetype !== 'application/json') {
      throw new BadRequestException('File must be JSON format');
    }

    // Parse JSON
    let ccfRecords: CCFData[];
    try {
      const fileContent = file.buffer.toString('utf-8');
      const parsed = JSON.parse(fileContent) as unknown;

      // Validate it's an array
      if (!Array.isArray(parsed)) {
        throw new BadRequestException(
          'CCF file must contain an array of carrier records',
        );
      }

      // Validate not empty
      if (parsed.length === 0) {
        throw new BadRequestException('CCF file cannot be empty');
      }

      ccfRecords = parsed as CCFData[];
    } catch (error: unknown) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new BadRequestException(`Invalid JSON format: ${errorMessage}`);
    }

    // Dispatch command
    const summary: ProcessingSummaryDto = await this.commandBus.execute(
      new ProcessCCFFileCommand(ccfRecords, correlationId),
    );

    this.logger.log(
      `[${correlationId}] CCF processing complete: ${JSON.stringify(summary)}`,
    );

    return summary;
  }

  /**
   * GET /api/carriers
   *
   * Lists carriers with optional filters and pagination.
   *
   * Query Parameters:
   * - limit: Max carriers to return (default: 100, max: 1000)
   * - min_score: Minimum score threshold (0-100)
   * - skip: Number to skip for pagination (default: 0)
   *
   * Response:
   * - Array of carriers sorted by score (descending)
   */
  @Get('carriers')
  @ApiOperation({ summary: 'List all carriers with filters' })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Max carriers to return',
  })
  @ApiQuery({
    name: 'min_score',
    required: false,
    type: Number,
    description: 'Minimum score threshold',
  })
  @ApiQuery({
    name: 'skip',
    required: false,
    type: Number,
    description: 'Number to skip for pagination',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Carriers retrieved successfully',
    type: [CarrierResponseDto],
  })
  async getCarriers(
    @Query() queryDto: GetCarriersQueryDto,
  ): Promise<CarrierResponseDto[]> {
    this.logger.log(`Get carriers: ${JSON.stringify(queryDto)}`);

    // Dispatch query
    const carriers: Carrier[] = await this.queryBus.execute(
      new GetCarriersQuery(queryDto.limit, queryDto.min_score, queryDto.skip),
    );

    // Map entities to DTOs
    return carriers.map((carrier: Carrier) =>
      CarrierResponseDto.fromEntity(carrier),
    );
  }

  /**
   * GET /api/carriers/:id
   *
   * Retrieves a single carrier by ID.
   *
   * Path Parameters:
   * - id: Carrier ID (MC number)
   *
   * Response:
   * - Carrier details
   *
   * Errors:
   * - 404 if carrier not found
   */
  @Get('carriers/:id')
  @ApiOperation({ summary: 'Get carrier by ID' })
  @ApiParam({
    name: 'id',
    description: 'Carrier ID (MC number)',
    example: 'MC-123456',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Carrier found',
    type: CarrierResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Carrier not found',
  })
  async getCarrierById(@Param('id') id: string): Promise<CarrierResponseDto> {
    this.logger.log(`Get carrier by ID: ${id}`);

    // Dispatch query
    const carrier: Carrier | null = await this.queryBus.execute(
      new GetCarrierByIdQuery(id),
    );

    if (!carrier) {
      throw new NotFoundException(`Carrier with ID ${id} not found`);
    }

    // Map entity to DTO
    return CarrierResponseDto.fromEntity(carrier);
  }

  /**
   * GET /api/carriers/:id/history
   *
   * Retrieves score history for a carrier.
   *
   * Path Parameters:
   * - id: Carrier ID (MC number)
   *
   * Response:
   * - Array of historical scores (chronological order)
   *
   * Errors:
   * - 404 if carrier not found
   */
  @Get('carriers/:id/history')
  @ApiOperation({ summary: 'Get carrier score history' })
  @ApiParam({
    name: 'id',
    description: 'Carrier ID (MC number)',
    example: 'MC-123456',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Score history retrieved',
    type: [ScoreHistoryEntryDto],
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Carrier not found',
  })
  async getCarrierHistory(
    @Param('id') id: string,
  ): Promise<ScoreHistoryEntryDto[]> {
    this.logger.log(`Get carrier history: ${id}`);

    // Dispatch query
    const history: ScoreHistoryEntryDto[] = await this.queryBus.execute(
      new GetCarrierHistoryQuery(id),
    );

    if (history.length === 0) {
      // Verify carrier exists
      const carrier: Carrier | null = await this.queryBus.execute(
        new GetCarrierByIdQuery(id),
      );
      if (!carrier) {
        throw new NotFoundException(`Carrier with ID ${id} not found`);
      }
    }

    return history;
  }
}
