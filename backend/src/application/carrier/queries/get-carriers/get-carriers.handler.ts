// --- AI-ASSISTED ---
// Tool: Claude 4.5 Sonnet
// Prompt: "Create CQRS query handler for GetCarriersQuery that retrieves carriers from repository"
// Modifications: Added query handling logic with repository delegation
// --- END AI-ASSISTED ---

import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject, Injectable } from '@nestjs/common';
import { GetCarriersQuery } from './get-carriers.query.js';
import type { ICarrierRepository } from '../../../../domain/carrier/repositories/carrier.repository.interface.js';
import { CARRIER_REPOSITORY } from '../../../../domain/carrier/repositories/carrier.repository.interface.js';
import { Carrier } from '../../../../domain/carrier/entities/carrier.entity.js';

/**
 * Query Handler: Get Carriers
 *
 * Handles the GetCarriersQuery by retrieving carriers from the repository.
 *
 * Responsibilities:
 * - Delegate to repository with query options
 * - Return carrier entities (domain objects)
 * - No business logic (pure read operation)
 *
 * The repository handles:
 * - Filtering (min_score)
 * - Sorting (by score descending)
 * - Pagination (limit, skip)
 * - Mapping from persistence to domain
 *
 * Note: Returns domain entities, not DTOs.
 * The presentation layer (controller) will map entities to DTOs.
 */
@Injectable()
@QueryHandler(GetCarriersQuery)
export class GetCarriersQueryHandler implements IQueryHandler<
  GetCarriersQuery,
  Carrier[]
> {
  constructor(
    @Inject(CARRIER_REPOSITORY)
    private readonly carrierRepository: ICarrierRepository,
  ) {}

  /**
   * Executes the Get Carriers query.
   *
   * @param query The query with filter/pagination options
   * @returns Array of carrier entities sorted by score (descending)
   */
  async execute(query: GetCarriersQuery): Promise<Carrier[]> {
    const { limit, min_score, skip } = query;

    return this.carrierRepository.findAll({
      limit,
      min_score,
      skip,
    });
  }
}
