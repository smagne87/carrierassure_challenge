// --- AI-ASSISTED ---
// Tool: Claude 4.5 Sonnet
// Prompt: "Create a CarrierId Value Object for carrier unique identifiers with validation"
// Modifications: Added validation, trimming and normalization
// --- END AI-ASSISTED ---

import { BaseValueObject } from '../../shared/base-value-object.js';
import { ValidationException } from '../../../common/exceptions/domain.exception.js';

/**
 * Value Object representing a carrier's unique identifier (MC number).
 * Immutable and self-validating.
 *
 * Format: Typically "MC-XXXXXX" but we accept any non-empty string
 */
export class CarrierId extends BaseValueObject {
  private static readonly MIN_LENGTH = 1;
  private static readonly MAX_LENGTH = 50;

  private constructor(private readonly _value: string) {
    super();
    this.validate();
  }

  /**
   * Factory method to create a CarrierId instance
   */
  public static create(value: string): CarrierId {
    if (!value) {
      throw new ValidationException('Carrier ID cannot be null or undefined');
    }

    const normalizedValue = value.trim();

    if (
      normalizedValue.length < this.MIN_LENGTH ||
      normalizedValue.length > this.MAX_LENGTH
    ) {
      throw new ValidationException(
        `Carrier ID must be between ${this.MIN_LENGTH} and ${this.MAX_LENGTH} characters, got: ${normalizedValue.length}`,
      );
    }

    return new CarrierId(normalizedValue);
  }

  private validate(): void {
    if (!this._value || this._value.length === 0) {
      throw new ValidationException('Carrier ID cannot be empty');
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
