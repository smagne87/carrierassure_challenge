// --- AI-ASSISTED ---
// Tool: Claude 4.5 Sonnet
// Prompt: "Create an AuthorityStatus Value Object similar to SafetyRating with validation and scoring"
// Modifications: Customized for Authority Status enum values and scoring rules
// --- END AI-ASSISTED ---

import { BaseValueObject } from '../../shared/base-value-object.js';
import { ValidationException } from '../../../common/exceptions/domain.exception.js';

/**
 * Valid authority status values
 */
export enum AuthorityStatusValue {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
  REVOKED = 'Revoked',
}

/**
 * Value Object representing a carrier's authority status.
 * Immutable and self-validating.
 *
 * Business Rules:
 * - Active = 100 points (10% weight in composite score)
 * - Inactive = 50 points (10% weight in composite score)
 * - Revoked = 0 points (10% weight in composite score)
 */
export class AuthorityStatus extends BaseValueObject {
  private static readonly VALID_STATUSES: readonly string[] =
    Object.values(AuthorityStatusValue);

  private static readonly SCORE_MAP: Record<AuthorityStatusValue, number> = {
    [AuthorityStatusValue.ACTIVE]: 100,
    [AuthorityStatusValue.INACTIVE]: 50,
    [AuthorityStatusValue.REVOKED]: 0,
  };

  private constructor(private readonly _value: AuthorityStatusValue) {
    super();
    this.validate();
  }

  /**
   * Factory method to create an AuthorityStatus instance
   */
  public static create(value: string): AuthorityStatus {
    if (!value) {
      throw new ValidationException(
        'Authority status cannot be null or undefined',
      );
    }

    const normalizedValue = value.trim();
    if (!this.VALID_STATUSES.includes(normalizedValue)) {
      throw new ValidationException(
        `Invalid authority status: "${value}". Must be one of: ${this.VALID_STATUSES.join(', ')}`,
      );
    }

    return new AuthorityStatus(normalizedValue as AuthorityStatusValue);
  }

  private validate(): void {
    if (!AuthorityStatus.VALID_STATUSES.includes(this._value)) {
      throw new ValidationException(
        `Invalid authority status: "${this._value}"`,
      );
    }
  }

  public get value(): string {
    return this._value;
  }

  /**
   * Calculates the score for this authority status
   */
  public getScore(): number {
    return AuthorityStatus.SCORE_MAP[this._value];
  }

  public toString(): string {
    return this._value;
  }

  protected getEqualityComponents(): any[] {
    return [this._value];
  }
}
