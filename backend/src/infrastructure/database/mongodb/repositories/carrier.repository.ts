// --- AI-ASSISTED ---
// Tool: Claude 4.5 Sonnet
// Prompt: "Create a repository adapter implementing ICarrierRepository with domain↔persistence mappers"
// Modifications: Added toDomain/toPersistence mappers, upsert pattern for idempotency, query builders
// --- END AI-ASSISTED ---

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  ICarrierRepository,
  CarrierQueryOptions,
} from '../../../../domain/carrier/repositories/carrier.repository.interface.js';
import { Carrier } from '../../../../domain/carrier/entities/carrier.entity.js';
import { CarrierId } from '../../../../domain/carrier/value-objects/carrier-id.vo.js';
import { DotNumber } from '../../../../domain/carrier/value-objects/dot-number.vo.js';
import { SafetyRating } from '../../../../domain/carrier/value-objects/safety-rating.vo.js';
import { AuthorityStatus } from '../../../../domain/carrier/value-objects/authority-status.vo.js';
import { CarrierHash } from '../../../../domain/carrier/value-objects/carrier-hash.vo.js';
import { CompositeScore } from '../../../../domain/carrier/value-objects/composite-score.vo.js';
import { CarrierDocument } from '../schemas/carrier.schema.js';

/**
 * Type for carrier persistence object (plain object for MongoDB operations)
 */
type CarrierPersistence = {
  carrier_id: string;
  dot_number: string;
  legal_name: string;
  safety_rating: string;
  out_of_service_pct: number;
  crash_total: number;
  driver_oos_pct: number;
  insurance_on_file: boolean;
  authority_status: string;
  last_inspection_date: Date | null;
  fleet_size: number;
  current_hash: string;
  current_score: {
    total: number;
    breakdown: {
      safetyRating: number;
      outOfServicePct: number;
      crashTotal: number;
      driverOosPct: number;
      insuranceOnFile: number;
      authorityStatus: number;
    };
  };
  score_history: Array<{
    score: number;
    computedAt: Date;
  }>;
  created_at: Date;
  updated_at: Date;
};

/**
 * MongoDB implementation of the Carrier Repository.
 *
 * This adapter:
 * - Implements the ICarrierRepository port from the domain layer
 * - Maps between domain entities (Carrier) and persistence models (CarrierDocument)
 * - Encapsulates all MongoDB-specific logic
 * - Provides strategic querying with indexes
 *
 * Follows the Repository Pattern:
 * - Domain layer defines the interface (port)
 * - Infrastructure layer provides the implementation (adapter)
 * - Enables swapping persistence without changing domain logic
 *
 * Mappers:
 * - toDomain(): CarrierDocument → Carrier entity
 * - toPersistence(): Carrier entity → CarrierDocument (plain object)
 */
@Injectable()
export class CarrierRepository implements ICarrierRepository {
  constructor(
    @InjectModel(CarrierDocument.name)
    private readonly carrierModel: Model<CarrierDocument>,
  ) {}

  /**
   * Finds a carrier by their unique carrier ID.
   * Uses the carrier_id unique index for O(log n) lookup.
   *
   * @param carrierId The carrier's ID value object
   * @returns The carrier domain entity if found, null otherwise
   */
  async findByCarrierId(carrierId: CarrierId): Promise<Carrier | null> {
    const document = await this.carrierModel
      .findOne({ carrier_id: carrierId.value })
      .exec();

    return document ? this.toDomain(document) : null;
  }

  /**
   * Finds all carriers matching the query options.
   * Results are sorted by score descending (highest scores first).
   *
   * Uses indexes:
   * - current_score.total (descending) for efficient sorting
   * - Supports pagination via skip/limit
   *
   * @param options Query options (filters, pagination)
   * @returns Array of carrier domain entities
   */
  async findAll(options?: CarrierQueryOptions): Promise<Carrier[]> {
    let query = this.carrierModel.find();

    // Apply filters
    if (options?.min_score !== undefined) {
      query = query.where('current_score.total').gte(options.min_score);
    }

    // Apply sorting (descending by score)
    query = query.sort({ 'current_score.total': -1 });

    // Apply pagination
    if (options?.skip !== undefined) {
      query = query.skip(options.skip);
    }

    if (options?.limit !== undefined) {
      query = query.limit(options.limit);
    }

    const documents = await query.exec();
    return documents.map((doc) => this.toDomain(doc));
  }

  /**
   * Saves a carrier (insert or update).
   * Uses upsert pattern for idempotency.
   *
   * Implementation:
   * - findOneAndUpdate with upsert:true
   * - carrier_id is the unique key
   * - If exists: update all fields
   * - If not exists: insert new document
   *
   * @param carrier The carrier domain entity to save
   */
  async save(carrier: Carrier): Promise<void> {
    const persistence = this.toPersistence(carrier);

    await this.carrierModel
      .findOneAndUpdate(
        { carrier_id: persistence.carrier_id },
        { $set: persistence },
        { upsert: true, new: true },
      )
      .exec();
  }

  /**
   * Checks if a carrier exists by ID.
   * Uses the carrier_id unique index.
   *
   * @param carrierId The carrier's ID
   * @returns true if exists, false otherwise
   */
  async exists(carrierId: CarrierId): Promise<boolean> {
    const count = await this.carrierModel
      .countDocuments({ carrier_id: carrierId.value })
      .exec();

    return count > 0;
  }

  /**
   * Counts total carriers matching the criteria.
   *
   * @param options Query options (filters)
   * @returns Number of carriers
   */
  async count(options?: CarrierQueryOptions): Promise<number> {
    let query = this.carrierModel.find();

    if (options?.min_score !== undefined) {
      query = query.where('current_score.total').gte(options.min_score);
    }

    return query.countDocuments().exec();
  }

  /**
   * Maps a MongoDB document to a Carrier domain entity.
   *
   * This mapper:
   * 1. Reconstructs Value Objects from primitive data
   * 2. Reconstitutes the Carrier aggregate via factory method
   * 3. Ensures domain invariants are enforced
   *
   * @param document MongoDB document
   * @returns Carrier domain entity
   */
  private toDomain(document: CarrierDocument): Carrier {
    return Carrier.reconstitute({
      carrierId: CarrierId.create(document.carrier_id),
      dotNumber: DotNumber.create(document.dot_number),
      legalName: document.legal_name,
      safetyRating: SafetyRating.create(document.safety_rating),
      outOfServicePct: document.out_of_service_pct,
      crashTotal: document.crash_total,
      driverOosPct: document.driver_oos_pct,
      insuranceOnFile: document.insurance_on_file,
      authorityStatus: AuthorityStatus.create(document.authority_status),
      lastInspectionDate: document.last_inspection_date,
      fleetSize: document.fleet_size,
      currentHash: CarrierHash.create(document.current_hash),
      currentScore: CompositeScore.create({
        total: document.current_score.total,
        breakdown: {
          safetyRating: document.current_score.breakdown.safetyRating,
          outOfServicePct: document.current_score.breakdown.outOfServicePct,
          crashTotal: document.current_score.breakdown.crashTotal,
          driverOosPct: document.current_score.breakdown.driverOosPct,
          insuranceOnFile: document.current_score.breakdown.insuranceOnFile,
          authorityStatus: document.current_score.breakdown.authorityStatus,
        },
      }),
      scoreHistory: document.score_history.map((entry) => ({
        score: entry.score,
        computedAt: entry.computedAt,
      })),
      createdAt: document.created_at,
      updatedAt: document.updated_at,
    });
  }

  /**
   * Maps a Carrier domain entity to a MongoDB persistence object.
   *
   * This mapper:
   * 1. Extracts primitive values from Value Objects
   * 2. Flattens the aggregate structure
   * 3. Creates plain object for MongoDB
   *
   * Note: Does NOT include _id field - MongoDB auto-generates if needed
   *
   * @param carrier Carrier domain entity
   * @returns Plain object for MongoDB persistence
   */
  private toPersistence(carrier: Carrier): CarrierPersistence {
    return {
      carrier_id: carrier.carrierId.value,
      dot_number: carrier.dotNumber.value,
      legal_name: carrier.legalName,
      safety_rating: carrier.safetyRating.value,
      out_of_service_pct: carrier.outOfServicePct,
      crash_total: carrier.crashTotal,
      driver_oos_pct: carrier.driverOosPct,
      insurance_on_file: carrier.insuranceOnFile,
      authority_status: carrier.authorityStatus.value,
      last_inspection_date: carrier.lastInspectionDate,
      fleet_size: carrier.fleetSize,
      current_hash: carrier.currentHash.value,
      current_score: {
        total: carrier.currentScore.total,
        breakdown: {
          safetyRating: carrier.currentScore.breakdown.safetyRating,
          outOfServicePct: carrier.currentScore.breakdown.outOfServicePct,
          crashTotal: carrier.currentScore.breakdown.crashTotal,
          driverOosPct: carrier.currentScore.breakdown.driverOosPct,
          insuranceOnFile: carrier.currentScore.breakdown.insuranceOnFile,
          authorityStatus: carrier.currentScore.breakdown.authorityStatus,
        },
      },
      score_history: carrier.scoreHistory.map((entry) => ({
        score: entry.score,
        computedAt: entry.computedAt,
      })),
      created_at: carrier.createdAt,
      updated_at: carrier.updatedAt,
    };
  }
}
