// --- AI-ASSISTED ---
// Tool: Claude 4.5 Sonnet
// Prompt: "Create a DotNumber Value Object for USDOT numbers with validation"
// Modifications: Added length constraints for USDOT format
// --- END AI-ASSISTED ---

import { BaseValueObject } from '../../shared/base-value-object.js';
import { ValidationException } from '../../../common/exceptions/domain.exception.js';

/**
 * Value Object representing a carrier's USDOT number.
 * Immutable and self-validating.
 *
 * USDOT numbers are typically 7-8 digits
 */
export class DotNumber extends BaseValueObject {
  private static readonly MIN_LENGTH = 1;
  private static readonly MAX_LENGTH = 10;

  private constructor(private readonly _value: string) {
    super();
    this.validate();
  }

  /**
   * Factory method to create a DotNumber instance
   */
  public static create(value: string): DotNumber {
    if (!value) {
      throw new ValidationException('DOT number cannot be null or undefined');
    }

    const normalizedValue = value.trim();

    if (
      normalizedValue.length < this.MIN_LENGTH ||
      normalizedValue.length > this.MAX_LENGTH
    ) {
      throw new ValidationException(
        `DOT number must be between ${this.MIN_LENGTH} and ${this.MAX_LENGTH} characters`,
      );
    }

    return new DotNumber(normalizedValue);
  }

  private validate(): void {
    if (!this._value || this._value.length === 0) {
      throw new ValidationException('DOT number cannot be empty');
    }
  }

  public get value(): string {
    return this._value;
  }

  public toString(): string {
    return this._value;
  }

  protected getEqualityComponents(): any[] {
    return [this._value];
  }
}
