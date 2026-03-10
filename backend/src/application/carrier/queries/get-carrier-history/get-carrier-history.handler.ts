// --- AI-ASSISTED ---
// Tool: Claude 4.5 Sonnet
// Prompt: "Create CQRS query handler for GetCarrierHistoryQuery that retrieves score history"
// Modifications: Added query handling with history extraction from carrier entity
// --- END AI-ASSISTED ---

import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject, Injectable } from '@nestjs/common';
import {
  GetCarrierHistoryQuery,
  CarrierHistoryResult,
} from './get-carrier-history.query.js';
import type { ICarrierRepository } from '../../../../domain/carrier/repositories/carrier.repository.interface.js';
import { CARRIER_REPOSITORY } from '../../../../domain/carrier/repositories/carrier.repository.interface.js';
import { CarrierId } from '../../../../domain/carrier/value-objects/carrier-id.vo.js';

/**
 * Query Handler: Get Carrier History
 *
 * Handles the GetCarrierHistoryQuery by retrieving score history.
 *
 * Responsibilities:
 * - Look up carrier by ID
 * - Extract score history from carrier entity
 * - Return chronologically ordered history
 *
 * Note: Score history is stored as embedded subdocuments in MongoDB.
 * This provides single-query retrieval performance.
 */
@Injectable()
@QueryHandler(GetCarrierHistoryQuery)
export class GetCarrierHistoryQueryHandler implements IQueryHandler<
  GetCarrierHistoryQuery,
  CarrierHistoryResult
> {
  constructor(
    @Inject(CARRIER_REPOSITORY)
    private readonly carrierRepository: ICarrierRepository,
  ) {}

  /**
   * Executes the Get Carrier History query.
   *
   * @param query The query with carrier ID
   * @returns Array of score history entries (chronological order)
   * @throws EntityNotFoundException if carrier not found
   */
  async execute(query: GetCarrierHistoryQuery): Promise<CarrierHistoryResult> {
    const carrierId = CarrierId.create(query.carrierId);
    const carrier = await this.carrierRepository.findByCarrierId(carrierId);

    if (!carrier) {
      // Return empty array if carrier not found
      // Alternative: throw EntityNotFoundException
      return [];
    }

    // Return score history from carrier entity
    // Already chronologically ordered (oldest to newest)
    return Array.from(carrier.scoreHistory);
  }
}
