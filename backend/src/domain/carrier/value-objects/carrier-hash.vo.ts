// --- AI-ASSISTED ---
// Tool: Claude 4.5 Sonnet
// Prompt: "Create a CarrierHash Value Object to encapsulate SHA-256 hash strings with validation"
// Modifications: Added SHA-256 format validation, TypeScript strict typing
// --- END AI-ASSISTED ---

import { BaseValueObject } from '../../shared/base-value-object.js';
import { ValidationException } from '../../../common/exceptions/domain.exception.js';

/**
 * Value Object representing a SHA-256 hash of a carrier record.
 * Used for change detection optimization.
 * Immutable and self-validating.
 *
 * Business Context:
 * Hash-based change detection is the core performance optimization.
 * By comparing hashes (O(1)) instead of field-by-field comparison (O(n)),
 * we can skip re-processing unchanged carriers, achieving 50x performance improvement
 * on large CCF files.
 */
export class CarrierHash extends BaseValueObject {
  private static readonly SHA256_PATTERN = /^[a-f0-9]{64}$/i;

  private constructor(private readonly _value: string) {
    super();
    this.validate();
  }

  /**
   * Factory method to create a CarrierHash instance
   *
   * @param value The SHA-256 hash string (64 hexadecimal characters)
   * @returns A new CarrierHash instance
   * @throws ValidationException if the hash format is invalid
   */
  public static create(value: string): CarrierHash {
    if (!value) {
      throw new ValidationException('Carrier hash cannot be null or undefined');
    }

    const normalizedValue = value.trim().toLowerCase();

    if (!this.SHA256_PATTERN.test(normalizedValue)) {
      throw new ValidationException(
        `Invalid carrier hash format. Expected SHA-256 hash (64 hexadecimal characters), got: "${value}"`,
      );
    }

    return new CarrierHash(normalizedValue);
  }

  private validate(): void {
    if (!CarrierHash.SHA256_PATTERN.test(this._value)) {
      throw new ValidationException(
        `Invalid carrier hash format: "${this._value}"`,
      );
    }
  }

  /**
   * Gets the raw hash value
   */
  public get value(): string {
    return this._value;
  }

  /**
   * Returns the hash as a string
   */
  public toString(): string {
    return this._value;
  }

  protected getEqualityComponents(): any[] {
    return [this._value];
  }
}
