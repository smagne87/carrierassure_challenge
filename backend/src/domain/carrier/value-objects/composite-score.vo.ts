// --- AI-ASSISTED ---
// Tool: Claude 4.5 Sonnet
// Prompt: "Create a CompositeScore Value Object that encapsulates total score and breakdown by factor"
// Modifications: Added detailed breakdown interface, validation logic for score ranges
// --- END AI-ASSISTED ---

import { BaseValueObject } from '../../shared/base-value-object.js';
import { ValidationException } from '../../../common/exceptions/domain.exception.js';

/**
 * Breakdown of score components by factor
 */
export interface ScoreBreakdown {
  safetyRating: number;
  outOfServicePct: number;
  crashTotal: number;
  driverOosPct: number;
  insuranceOnFile: number;
  authorityStatus: number;
}

/**
 * Properties for creating a CompositeScore
 */
export interface CompositeScoreProps {
  total: number;
  breakdown: ScoreBreakdown;
}

/**
 * Value Object representing a carrier's composite safety score.
 * Encapsulates both the total score (0-100) and the breakdown by factor.
 * Immutable and self-validating.
 *
 * The composite score is calculated from 6 weighted factors:
 * - safety_rating: 25%
 * - out_of_service_pct: 20%
 * - crash_total: 20%
 * - driver_oos_pct: 15%
 * - insurance_on_file: 10%
 * - authority_status: 10%
 */
export class CompositeScore extends BaseValueObject {
  private static readonly MIN_SCORE = 0;
  private static readonly MAX_SCORE = 100;

  private constructor(
    private readonly _total: number,
    private readonly _breakdown: ScoreBreakdown,
  ) {
    super();
    this.validate();
  }

  /**
   * Factory method to create a CompositeScore instance
   *
   * @param props Score properties (total and breakdown)
   * @returns A new CompositeScore instance
   * @throws ValidationException if validation fails
   */
  public static create(props: CompositeScoreProps): CompositeScore {
    if (!props) {
      throw new ValidationException('Score properties cannot be null');
    }

    if (props.total == null || props.total == undefined) {
      throw new ValidationException('Score total cannot be null or undefined');
    }

    if (!props.breakdown) {
      throw new ValidationException('Score breakdown cannot be null');
    }

    return new CompositeScore(props.total, props.breakdown);
  }

  /**
   * Validates the score values
   */
  private validate(): void {
    // Validate total score range
    if (
      this._total < CompositeScore.MIN_SCORE ||
      this._total > CompositeScore.MAX_SCORE
    ) {
      throw new ValidationException(
        `Score total must be between ${CompositeScore.MIN_SCORE} and ${CompositeScore.MAX_SCORE}, got: ${this._total}`,
      );
    }

    // Validate breakdown components exist
    const requiredComponents: (keyof ScoreBreakdown)[] = [
      'safetyRating',
      'outOfServicePct',
      'crashTotal',
      'driverOosPct',
      'insuranceOnFile',
      'authorityStatus',
    ];

    for (const component of requiredComponents) {
      if (
        this._breakdown[component] == null ||
        this._breakdown[component] == undefined
      ) {
        throw new ValidationException(
          `Score breakdown missing required component: ${component}`,
        );
      }

      // Validate component score range
      if (this._breakdown[component] < 0 || this._breakdown[component] > 100) {
        throw new ValidationException(
          `Score breakdown component ${component} must be between 0 and 100, got: ${this._breakdown[component]}`,
        );
      }
    }
  }

  /**
   * Gets the total score (0-100)
   */
  public get total(): number {
    return this._total;
  }

  /**
   * Gets the detailed score breakdown
   */
  public get breakdown(): ScoreBreakdown {
    // Return a copy to maintain immutability
    return { ...this._breakdown };
  }

  /**
   * Gets a specific component score
   */
  public getComponentScore(
    component: keyof ScoreBreakdown,
  ): number | undefined {
    return this._breakdown[component];
  }

  /**
   * Returns a formatted string representation of the score
   */
  public toString(): string {
    return `Total: ${this._total.toFixed(2)}`;
  }

  protected getEqualityComponents(): any[] {
    return [this._total, this._breakdown];
  }
}
