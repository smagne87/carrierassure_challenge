// --- AI-ASSISTED ---
// Tool: Claude 4.5 Sonnet
// Prompt: "Create a Mongoose schema for Carrier aggregate with strategic indexes for hash-based change detection"
// Modifications: Added score_history subdocuments, strategic indexes (carrier_id unique, current_hash, score descending)
// --- END AI-ASSISTED ---

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

/**
 * Score breakdown subdocument schema
 */
@Schema({ _id: false })
export class ScoreBreakdownSchema {
  @Prop({ required: true, type: Number })
  safetyRating: number;

  @Prop({ required: true, type: Number })
  outOfServicePct: number;

  @Prop({ required: true, type: Number })
  crashTotal: number;

  @Prop({ required: true, type: Number })
  driverOosPct: number;

  @Prop({ required: true, type: Number })
  insuranceOnFile: number;

  @Prop({ required: true, type: Number })
  authorityStatus: number;
}

/**
 * Composite score subdocument schema
 */
@Schema({ _id: false })
export class CompositeScoreSchema {
  @Prop({ required: true, type: Number, min: 0, max: 100 })
  total: number;

  @Prop({ required: true, type: ScoreBreakdownSchema })
  breakdown: ScoreBreakdownSchema;
}

/**
 * Score history entry subdocument schema
 */
@Schema({ _id: false })
export class ScoreHistoryEntrySchema {
  @Prop({ required: true, type: Number })
  score: number;

  @Prop({ required: true, type: Date })
  computedAt: Date;
}

/**
 * Carrier document schema for MongoDB persistence.
 *
 * This schema represents the database structure for carriers.
 * It maps to the Carrier domain entity via repository mappers.
 *
 * Strategic Indexes:
 * 1. carrier_id (unique): Primary lookup key
 * 2. current_hash: Critical for O(log n) hash-based change detection
 * 3. current_score.total (descending): For sorted queries (top carriers)
 * 4. dot_number: Secondary lookup key
 *
 * Design Decisions:
 * - Embedded score_history: Optimizes for single-query retrieval
 *   (tradeoff: won't scale beyond ~100 history entries)
 * - Denormalized current_score: Avoids joins, improves read performance
 * - SHA-256 hash indexed: Core of change detection optimization
 */
@Schema({
  collection: 'carriers',
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
})
export class CarrierDocument extends Document {
  /**
   * Unique carrier identifier (MC number)
   * Example: "MC-123456"
   */
  @Prop({ required: true, unique: true, index: true, type: String })
  carrier_id: string;

  /**
   * USDOT number
   * Example: "1234567"
   */
  @Prop({ required: true, index: true, type: String })
  dot_number: string;

  /**
   * Legal name of the carrier
   */
  @Prop({ required: true, type: String })
  legal_name: string;

  /**
   * USDOT safety rating
   * Enum: "Satisfactory" | "Conditional" | "Unsatisfactory"
   */
  @Prop({
    required: true,
    type: String,
    enum: ['Satisfactory', 'Conditional', 'Unsatisfactory'],
  })
  safety_rating: string;

  /**
   * Vehicle out-of-service percentage (0-100)
   */
  @Prop({ required: true, type: Number, min: 0, max: 100 })
  out_of_service_pct: number;

  /**
   * Total crashes in last 24 months
   */
  @Prop({ required: true, type: Number, min: 0 })
  crash_total: number;

  /**
   * Driver out-of-service percentage (0-100)
   */
  @Prop({ required: true, type: Number, min: 0, max: 100 })
  driver_oos_pct: number;

  /**
   * Whether valid insurance is on file
   */
  @Prop({ required: true, type: Boolean })
  insurance_on_file: boolean;

  /**
   * Operating authority status
   * Enum: "Active" | "Inactive" | "Revoked"
   */
  @Prop({
    required: true,
    type: String,
    enum: ['Active', 'Inactive', 'Revoked'],
  })
  authority_status: string;

  /**
   * Date of last USDOT inspection
   */
  @Prop({ required: true, type: Date })
  last_inspection_date: Date;

  /**
   * Number of vehicles in fleet
   */
  @Prop({ required: true, type: Number, min: 1 })
  fleet_size: number;

  /**
   * SHA-256 hash of carrier data for change detection.
   * CRITICAL: Indexed for O(log n) hash lookups.
   *
   * This field enables the core optimization:
   * - Re-uploading identical file → all hashes match → 0 re-computations
   * - 1 changed carrier → only 1 hash mismatch → 1 re-computation
   */
  @Prop({ required: true, type: String, index: true })
  current_hash: string;

  /**
   * Current composite safety score (0-100).
   * Denormalized for query performance.
   * Indexed descending for "top carriers" queries.
   */
  @Prop({ required: true, type: CompositeScoreSchema })
  current_score: CompositeScoreSchema;

  /**
   * Historical scores for analytics.
   * Embedded subdocuments (max ~100 entries recommended).
   *
   * If history grows beyond 100 entries, migrate to separate collection.
   */
  @Prop({ type: [ScoreHistoryEntrySchema], default: [] })
  score_history: ScoreHistoryEntrySchema[];

  /**
   * Timestamps (managed by Mongoose)
   */
  created_at: Date;
  updated_at: Date;
}

export const CarrierSchema = SchemaFactory.createForClass(CarrierDocument);

/**
 * Create strategic indexes on schema initialization.
 *
 * These indexes are critical for performance:
 * 1. carrier_id: Already defined as unique index above
 * 2. current_hash: For hash-based change detection lookups
 * 3. current_score.total (descending): For sorted queries
 * 4. dot_number: Already defined as index above
 */
CarrierSchema.index({ current_hash: 1 });
CarrierSchema.index({ 'current_score.total': -1 }); // Descending for top carriers
