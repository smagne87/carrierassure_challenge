// --- AI-ASSISTED ---
// Tool: Claude 4.5 Sonnet
// Prompt: "Create a SafetyRating Value Object for carrier scoring with validation and score calculation"
// Modifications: Added TypeScript enum, strict typing, complete validation logic, scoring business rules
// --- END AI-ASSISTED ---

import { BaseValueObject } from '../../shared/base-value-object.js';
import { ValidationException } from '../../../common/exceptions/domain.exception.js';

/**
 * Valid USDOT safety rating values
 */
export enum SafetyRatingValue {
  SATISFACTORY = 'Satisfactory',
  CONDITIONAL = 'Conditional',
  UNSATISFACTORY = 'Unsatisfactory',
}

/**
 * Value Object representing a carrier's USDOT safety rating.
 * Immutable and self-validating.
 *
 * Business Rules:
 * - Satisfactory = 100 points (25% weight in composite score)
 * - Conditional = 50 points (25% weight in composite score)
 * - Unsatisfactory = 0 points (25% weight in composite score)
 */
export class SafetyRating extends BaseValueObject {
  private static readonly VALID_RATINGS: readonly string[] =
    Object.values(SafetyRatingValue);

  private static readonly SCORE_MAP: Record<SafetyRatingValue, number> = {
    [SafetyRatingValue.SATISFACTORY]: 100,
    [SafetyRatingValue.CONDITIONAL]: 50,
    [SafetyRatingValue.UNSATISFACTORY]: 0,
  };

  private constructor(private readonly _value: SafetyRatingValue) {
    super();
    this.validate();
  }

  /**
   * Factory method to create a SafetyRating instance.
   * Validates the input and throws ValidationException if invalid.
   *
   * @param value The safety rating value
   * @returns A new SafetyRating instance
   * @throws ValidationException if the value is invalid
   */
  public static create(value: string): SafetyRating {
    if (!value) {
      throw new ValidationException(
        'Safety rating cannot be null or undefined',
      );
    }

    const normalizedValue = value.trim();
    if (!this.VALID_RATINGS.includes(normalizedValue)) {
      throw new ValidationException(
        `Invalid safety rating: "${value}". Must be one of: ${this.VALID_RATINGS.join(', ')}`,
      );
    }

    return new SafetyRating(normalizedValue as SafetyRatingValue);
  }

  /**
   * Validates the safety rating value
   */
  private validate(): void {
    if (!SafetyRating.VALID_RATINGS.includes(this._value)) {
      throw new ValidationException(`Invalid safety rating: "${this._value}"`);
    }
  }

  /**
   * Gets the raw value of the safety rating
   */
  public get value(): string {
    return this._value;
  }

  /**
   * Calculates the score for this safety rating based on the scoring algorithm.
   * This method encapsulates the business rule for safety rating scoring.
   *
   * @returns The score (0, 50, or 100)
   */
  public getScore(): number {
    return SafetyRating.SCORE_MAP[this._value];
  }

  /**
   * Returns a human-readable string representation
   */
  public toString(): string {
    return this._value;
  }

  /**
   * Defines equality based on the rating value
   */
  protected getEqualityComponents(): any[] {
    return [this._value];
  }
}
