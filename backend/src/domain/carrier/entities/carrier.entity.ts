// --- AI-ASSISTED ---
// Tool: Claude 4.5 Sonnet
// Prompt: "Create a Carrier aggregate root entity with business methods for hash-based change detection and scoring"
// Modifications: Added factory methods, complete business logic, score history management, TypeScript strict typing
// --- END AI-ASSISTED ---

import { BaseEntity } from '../../shared/base-entity.js';
import { CarrierId } from '../value-objects/carrier-id.vo.js';
import { DotNumber } from '../value-objects/dot-number.vo.js';
import { SafetyRating } from '../value-objects/safety-rating.vo.js';
import { AuthorityStatus } from '../value-objects/authority-status.vo.js';
import { CarrierHash } from '../value-objects/carrier-hash.vo.js';
import { CompositeScore } from '../value-objects/composite-score.vo.js';
import { HashGeneratorDomainService } from '../services/hash-generator.domain-service.js';
import { ScoringDomainService } from '../services/scoring.domain-service.js';
import { ValidationException } from '../../../common/exceptions/domain.exception.js';

/**
 * Score history entry
 */
export interface ScoreHistoryEntry {
  score: number;
  computedAt: Date;
}

/**
 * Properties for creating/reconstituting a Carrier
 */
export interface CarrierProps {
  carrierId: CarrierId;
  dotNumber: DotNumber;
  legalName: string;
  safetyRating: SafetyRating;
  outOfServicePct: number;
  crashTotal: number;
  driverOosPct: number;
  insuranceOnFile: boolean;
  authorityStatus: AuthorityStatus;
  lastInspectionDate: Date;
  fleetSize: number;
  currentHash: CarrierHash;
  currentScore: CompositeScore;
  scoreHistory?: ScoreHistoryEntry[];
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Raw CCF data structure (as received from API)
 */
export interface CCFData {
  carrier_id: string;
  dot_number: string;
  legal_name: string;
  safety_rating: string;
  out_of_service_pct: number;
  crash_total: number;
  driver_oos_pct: number;
  insurance_on_file: boolean;
  authority_status: string;
  last_inspection_date: string;
  fleet_size?: number;
}

/**
 * Carrier Aggregate Root.
 *
 * Encapsulates all carrier business logic including:
 * - Hash-based change detection
 * - Score calculation
 * - Score history management
 *
 * Enforces business invariants and maintains consistency.
 *
 * This is the main entity in the Carrier bounded context.
 * All operations on carrier data go through this aggregate root.
 */
export class Carrier extends BaseEntity<string> {
  private _carrierId: CarrierId;
  private _dotNumber: DotNumber;
  private _legalName: string;
  private _safetyRating: SafetyRating;
  private _outOfServicePct: number;
  private _crashTotal: number;
  private _driverOosPct: number;
  private _insuranceOnFile: boolean;
  private _authorityStatus: AuthorityStatus;
  private _lastInspectionDate: Date;
  private _fleetSize: number;
  private _currentHash: CarrierHash;
  private _currentScore: CompositeScore;
  private _scoreHistory: ScoreHistoryEntry[];
  private _createdAt: Date;
  private _updatedAt: Date;

  private constructor(props: CarrierProps) {
    super();
    this._carrierId = props.carrierId;
    this._dotNumber = props.dotNumber;
    this._legalName = props.legalName;
    this._safetyRating = props.safetyRating;
    this._outOfServicePct = props.outOfServicePct;
    this._crashTotal = props.crashTotal;
    this._driverOosPct = props.driverOosPct;
    this._insuranceOnFile = props.insuranceOnFile;
    this._authorityStatus = props.authorityStatus;
    this._lastInspectionDate = props.lastInspectionDate;
    this._fleetSize = props.fleetSize;
    this._currentHash = props.currentHash;
    this._currentScore = props.currentScore;
    this._scoreHistory = props.scoreHistory || [];
    this._createdAt = props.createdAt || new Date();
    this._updatedAt = props.updatedAt || new Date();
    this.validate();
  }

  /**
   * Factory method: Creates a new Carrier from CCF data.
   * Used when processing a CCF file and encountering a new carrier.
   *
   * This method:
   * 1. Creates value objects from raw data
   * 2. Generates initial hash
   * 3. Calculates initial score
   * 4. Returns a fully initialized Carrier
   *
   * @param ccfData Raw CCF data
   * @param hashService Hash generator service
   * @param scoringService Scoring calculation service
   * @returns A new Carrier instance
   */
  public static createFromCCFData(
    ccfData: CCFData,
    hashService: HashGeneratorDomainService,
    scoringService: ScoringDomainService,
  ): Carrier {
    // Create value objects from raw data
    const carrierId = CarrierId.create(ccfData.carrier_id);
    const dotNumber = DotNumber.create(ccfData.dot_number);
    const safetyRating = SafetyRating.create(ccfData.safety_rating);
    const authorityStatus = AuthorityStatus.create(ccfData.authority_status);
    const lastInspectionDate = new Date(ccfData.last_inspection_date);

    // Generate hash
    const hash = hashService.generateHash(ccfData);

    // Calculate initial score
    const score = scoringService.calculateScore({
      safetyRating,
      outOfServicePct: ccfData.out_of_service_pct,
      crashTotal: ccfData.crash_total,
      driverOosPct: ccfData.driver_oos_pct,
      insuranceOnFile: ccfData.insurance_on_file,
      authorityStatus,
    });

    return new Carrier({
      carrierId,
      dotNumber,
      legalName: ccfData.legal_name,
      safetyRating,
      outOfServicePct: ccfData.out_of_service_pct,
      crashTotal: ccfData.crash_total,
      driverOosPct: ccfData.driver_oos_pct,
      insuranceOnFile: ccfData.insurance_on_file,
      authorityStatus,
      lastInspectionDate,
      fleetSize: ccfData.fleet_size || 1,
      currentHash: hash,
      currentScore: score,
      scoreHistory: [
        {
          score: score.total,
          computedAt: new Date(),
        },
      ],
    });
  }

  /**
   * Reconstitutes a Carrier from persistence.
   * Used when loading an existing carrier from the database.
   *
   * @param props Carrier properties
   * @returns A reconstituted Carrier instance
   */
  public static reconstitute(props: CarrierProps): Carrier {
    return new Carrier(props);
  }

  /**
   * Updates this carrier from new CCF data if changes are detected.
   * Implements hash-based change detection optimization.
   *
   * This is the core of the performance optimization:
   * - O(1) hash comparison vs O(n) field comparison
   * - Skips re-processing for unchanged records
   *
   * @param ccfData New CCF data
   * @param hashService Hash generator service
   * @returns true if carrier was updated (hash changed), false if unchanged
   */
  public updateFromCCFData(
    ccfData: CCFData,
    hashService: HashGeneratorDomainService,
  ): boolean {
    const newHash = hashService.generateHash(ccfData);

    // Hash-based change detection
    if (this._currentHash.equals(newHash)) {
      return false; // No changes detected - skip re-processing
    }

    // Changes detected - update fields
    this._legalName = ccfData.legal_name;
    this._safetyRating = SafetyRating.create(ccfData.safety_rating);
    this._outOfServicePct = ccfData.out_of_service_pct;
    this._crashTotal = ccfData.crash_total;
    this._driverOosPct = ccfData.driver_oos_pct;
    this._insuranceOnFile = ccfData.insurance_on_file;
    this._authorityStatus = AuthorityStatus.create(ccfData.authority_status);
    this._lastInspectionDate = new Date(ccfData.last_inspection_date);
    this._fleetSize = ccfData.fleet_size || 1;
    this._currentHash = newHash;
    this._updatedAt = new Date();

    return true; // Carrier was updated
  }

  /**
   * Recalculates the score for this carrier.
   * Adds the previous score to history if the score changed.
   *
   * @param scoringService Scoring calculation service
   */
  public recalculateScore(scoringService: ScoringDomainService): void {
    const newScore = scoringService.calculateScore({
      safetyRating: this._safetyRating,
      outOfServicePct: this._outOfServicePct,
      crashTotal: this._crashTotal,
      driverOosPct: this._driverOosPct,
      insuranceOnFile: this._insuranceOnFile,
      authorityStatus: this._authorityStatus,
    });

    // Only update if score actually changed
    if (!this._currentScore.equals(newScore)) {
      // Add current score to history
      this._scoreHistory.push({
        score: this._currentScore.total,
        computedAt: new Date(),
      });

      this._currentScore = newScore;
      this._updatedAt = new Date();
    }
  }

  /**
   * Validates carrier business invariants.
   * Called during construction to ensure data integrity.
   */
  private validate(): void {
    if (!this._legalName || this._legalName.trim().length === 0) {
      throw new ValidationException('Legal name cannot be empty');
    }

    if (this._outOfServicePct < 0 || this._outOfServicePct > 100) {
      throw new ValidationException(
        `Out of service percentage must be between 0 and 100, got: ${this._outOfServicePct}`,
      );
    }

    if (this._driverOosPct < 0 || this._driverOosPct > 100) {
      throw new ValidationException(
        `Driver OOS percentage must be between 0 and 100, got: ${this._driverOosPct}`,
      );
    }

    if (this._crashTotal < 0) {
      throw new ValidationException(
        `Crash total cannot be negative, got: ${this._crashTotal}`,
      );
    }

    if (this._fleetSize < 1) {
      throw new ValidationException(
        `Fleet size must be at least 1, got: ${this._fleetSize}`,
      );
    }
  }

  // Getters (public read-only access to private fields)
  protected getId(): string {
    return this._carrierId.value;
  }

  public get carrierId(): CarrierId {
    return this._carrierId;
  }

  public get dotNumber(): DotNumber {
    return this._dotNumber;
  }

  public get legalName(): string {
    return this._legalName;
  }

  public get safetyRating(): SafetyRating {
    return this._safetyRating;
  }

  public get outOfServicePct(): number {
    return this._outOfServicePct;
  }

  public get crashTotal(): number {
    return this._crashTotal;
  }

  public get driverOosPct(): number {
    return this._driverOosPct;
  }

  public get insuranceOnFile(): boolean {
    return this._insuranceOnFile;
  }

  public get authorityStatus(): AuthorityStatus {
    return this._authorityStatus;
  }

  public get lastInspectionDate(): Date {
    return this._lastInspectionDate;
  }

  public get fleetSize(): number {
    return this._fleetSize;
  }

  public get currentHash(): CarrierHash {
    return this._currentHash;
  }

  public get currentScore(): CompositeScore {
    return this._currentScore;
  }

  public get scoreHistory(): ReadonlyArray<ScoreHistoryEntry> {
    return this._scoreHistory;
  }

  public get createdAt(): Date {
    return this._createdAt;
  }

  public get updatedAt(): Date {
    return this._updatedAt;
  }
}
