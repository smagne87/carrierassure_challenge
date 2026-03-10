// --- AI-ASSISTED ---
// Tool: Claude 4.5 Sonnet
// Prompt: "Create a repository interface for Carrier aggregate following DDD and Clean Architecture principles"
// Modifications: Added query options, TypeScript interface, comprehensive method signatures
// --- END AI-ASSISTED ---

import { Carrier } from '../entities/carrier.entity.js';
import { CarrierId } from '../value-objects/carrier-id.vo.js';

/**
 * Query options for finding carriers
 */
export interface CarrierQueryOptions {
  limit?: number;
  min_score?: number;
  skip?: number;
}

/**
 * Repository interface for Carrier aggregate.
 * Defines the contract for persistence operations.
 *
 * This interface is part of the Domain layer (port), but implementations
 * belong to the Infrastructure layer (adapter).
 *
 * This follows the Dependency Inversion Principle:
 * - High-level domain depends on this abstraction
 * - Low-level infrastructure implements this abstraction
 *
 * Benefits:
 * - Domain layer has no knowledge of database technology
 * - Easy to swap persistence implementations (MongoDB, PostgreSQL, in-memory)
 * - Testable (can mock the repository)
 */
export interface ICarrierRepository {
  /**
   * Finds a carrier by their unique identifier.
   *
   * @param carrierId The carrier's ID
   * @returns The carrier if found, null otherwise
   */
  findByCarrierId(carrierId: CarrierId): Promise<Carrier | null>;

  /**
   * Finds all carriers matching the query options.
   * Results are sorted by score descending.
   *
   * @param options Query options (filters, pagination, etc.)
   * @returns Array of carriers matching the criteria
   */
  findAll(options?: CarrierQueryOptions): Promise<Carrier[]>;

  /**
   * Saves a carrier (insert or update).
   * Uses upsert pattern for idempotency.
   *
   * @param carrier The carrier to save
   */
  save(carrier: Carrier): Promise<void>;

  /**
   * Checks if a carrier exists by ID.
   *
   * @param carrierId The carrier's ID
   * @returns true if exists, false otherwise
   */
  exists(carrierId: CarrierId): Promise<boolean>;

  /**
   * Counts total carriers matching the criteria.
   *
   * @param options Query options
   * @returns Number of carriers
   */
  count(options?: CarrierQueryOptions): Promise<number>;
}

/**
 * Injection token for the carrier repository.
 * Used for dependency injection in NestJS.
 */
export const CARRIER_REPOSITORY = Symbol('ICarrierRepository');
