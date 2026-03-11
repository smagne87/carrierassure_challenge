// --- AI-ASSISTED ---
// Tool: Claude 4.5 Sonnet
// Prompt: "Create CQRS command handler for ProcessCCFFileCommand that orchestrates carrier processing with hash-based change detection"
// Modifications: Added complete business flow, change detection logic, summary tracking, structured logging
// --- END AI-ASSISTED ---

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ProcessCCFFileCommand } from './process-ccf-file.command.js';
import type { ICarrierRepository } from '../../../../domain/carrier/repositories/carrier.repository.interface.js';
import { CARRIER_REPOSITORY } from '../../../../domain/carrier/repositories/carrier.repository.interface.js';
import { HashGeneratorDomainService } from '../../../../domain/carrier/services/hash-generator.domain-service.js';
import { ScoringDomainService } from '../../../../domain/carrier/services/scoring.domain-service.js';
import { Carrier } from '../../../../domain/carrier/entities/carrier.entity.js';
import { CarrierId } from '../../../../domain/carrier/value-objects/carrier-id.vo.js';

/**
 * Processing summary returned by the handler
 */
export interface ProcessingSummary {
  /**
   * Total carriers processed
   */
  total: number;

  /**
   * Carriers that were unchanged (hash matched)
   */
  unchanged: number;

  /**
   * Existing carriers that were updated (hash changed)
   */
  updated: number;

  /**
   * New carriers created
   */
  new: number;

  /**
   * Correlation ID for request tracing
   */
  correlationId?: string;
}

/**
 * Command Handler: Process CCF File
 *
 * This is the **main use case** of the application.
 *
 * Orchestrates the complete carrier processing workflow:
 * 1. Iterate through CCF records
 * 2. For each record:
 *    a. Check if carrier exists (by carrier_id)
 *    b. If exists:
 *       - Generate hash of new data
 *       - Compare with stored hash (O(1) operation)
 *       - If hash matches → skip (no changes)
 *       - If hash differs → update carrier data & recalculate score
 *    c. If new:
 *       - Create carrier entity with initial hash & score
 *       - Save to repository
 * 3. Return summary: {total, unchanged, updated, new}
 *
 * Performance Optimization:
 * - Hash-based change detection avoids unnecessary re-processing
 * - On re-upload of identical file: 0 re-computations (all hashes match)
 * - On file with 1000 carriers, 10 changes: only 10 re-computations
 *
 * This handler is **stateless** and delegates to:
 * - Domain Services: HashGeneratorDomainService, ScoringDomainService
 * - Repository: ICarrierRepository
 * - Domain Entity: Carrier (business logic)
 */
@Injectable()
@CommandHandler(ProcessCCFFileCommand)
export class ProcessCCFFileHandler implements ICommandHandler<
  ProcessCCFFileCommand,
  ProcessingSummary
> {
  private readonly logger = new Logger(ProcessCCFFileHandler.name);

  constructor(
    @Inject(CARRIER_REPOSITORY)
    private readonly carrierRepository: ICarrierRepository,
    private readonly hashService: HashGeneratorDomainService,
    private readonly scoringService: ScoringDomainService,
  ) {}

  /**
   * Executes the Process CCF File command.
   *
   * @param command The command containing CCF records to process
   * @returns Processing summary with counts
   */
  async execute(command: ProcessCCFFileCommand): Promise<ProcessingSummary> {
    const { ccfRecords, correlationId } = command;

    this.logger.log(
      `[${correlationId}] Starting CCF processing: ${ccfRecords.length} records`,
    );

    // Initialize counters
    const summary: ProcessingSummary = {
      total: ccfRecords.length,
      unchanged: 0,
      updated: 0,
      new: 0,
      correlationId,
    };

    // Process each carrier record
    for (const ccfData of ccfRecords) {
      try {
        await this.processCarrierRecord(ccfData, summary, correlationId);
      } catch (error) {
        // Log error but continue processing other carriers

        this.logger.error(
          `[${correlationId}] Error processing carrier ${ccfData.carrier_id}: ${(error as Error).message}`,

          (error as Error).stack,
        );
        throw error; // Re-throw to fail the entire batch (transactional approach)
      }
    }

    this.logger.log(
      `[${correlationId}] CCF processing complete: ${JSON.stringify(summary)}`,
    );

    return summary;
  }

  /**
   * Processes a single carrier record.
   * Implements hash-based change detection optimization.
   *
   * @param ccfData Raw CCF data for one carrier
   * @param summary Summary object to update counts
   * @param correlationId Request correlation ID
   */
  private async processCarrierRecord(
    ccfData: any,
    summary: ProcessingSummary,
    correlationId?: string,
  ): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    const carrierId = CarrierId.create(ccfData.carrier_id);

    // Check if carrier exists
    const existingCarrier =
      await this.carrierRepository.findByCarrierId(carrierId);

    if (existingCarrier) {
      // Carrier exists - detect changes via hash comparison

      const wasUpdated = existingCarrier.updateFromCCFData(
        ccfData,
        this.hashService,
      );

      if (wasUpdated) {
        // Hash changed - data was modified

        this.logger.debug(
          `[${correlationId}] Carrier ${ccfData.carrier_id} changed - recalculating score`,
        );

        // Recalculate score with new data
        existingCarrier.recalculateScore(this.scoringService);

        // Persist updates
        await this.carrierRepository.save(existingCarrier);

        summary.updated++;
      } else {
        // Hash matched - no changes detected

        this.logger.debug(
          `[${correlationId}] Carrier ${ccfData.carrier_id} unchanged - skipping`,
        );

        summary.unchanged++;
      }
    } else {
      // New carrier - create entity with initial hash & score

      this.logger.debug(
        `[${correlationId}] New carrier ${ccfData.carrier_id} - creating`,
      );

      const newCarrier = Carrier.createFromCCFData(
        ccfData,
        this.hashService,
        this.scoringService,
      );

      // Persist new carrier
      await this.carrierRepository.save(newCarrier);

      summary.new++;
    }
  }
}
