// --- AI-ASSISTED ---
// Tool: Claude 4.5 Sonnet
// Prompt: "Create CQRS query handler for GetCarrierByIdQuery that retrieves a single carrier"
// Modifications: Added query handling with carrier ID lookup
// --- END AI-ASSISTED ---

import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject, Injectable } from '@nestjs/common';
import { GetCarrierByIdQuery } from './get-carrier-by-id.query.js';
import type { ICarrierRepository } from '../../../../domain/carrier/repositories/carrier.repository.interface.js';
import { CARRIER_REPOSITORY } from '../../../../domain/carrier/repositories/carrier.repository.interface.js';
import { Carrier } from '../../../../domain/carrier/entities/carrier.entity.js';
import { CarrierId } from '../../../../domain/carrier/value-objects/carrier-id.vo.js';

/**
 * Query Handler: Get Carrier By ID
 *
 * Handles the GetCarrierByIdQuery by retrieving a specific carrier.
 *
 * Responsibilities:
 * - Create CarrierId value object from string
 * - Delegate to repository for lookup
 * - Return carrier entity or null
 *
 * Uses the carrier_id unique index for O(log n) lookup performance.
 */
@Injectable()
@QueryHandler(GetCarrierByIdQuery)
export class GetCarrierByIdQueryHandler implements IQueryHandler<
  GetCarrierByIdQuery,
  Carrier | null
> {
  constructor(
    @Inject(CARRIER_REPOSITORY)
    private readonly carrierRepository: ICarrierRepository,
  ) {}

  /**
   * Executes the Get Carrier By ID query.
   *
   * @param query The query with carrier ID
   * @returns Carrier entity if found, null otherwise
   */
  async execute(query: GetCarrierByIdQuery): Promise<Carrier | null> {
    const carrierId = CarrierId.create(query.carrierId);
    return this.carrierRepository.findByCarrierId(carrierId);
  }
}
