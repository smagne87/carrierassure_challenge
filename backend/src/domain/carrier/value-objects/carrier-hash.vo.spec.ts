// --- AI-ASSISTED ---
// Tool: Claude 4.5 Sonnet
// Prompt: "Create unit tests for CarrierHash value object with SHA-256 validation"
// Modifications: Fixed expectations to match implementation (normalized to lowercase, error messages)
// --- END AI-ASSISTED ---

import { CarrierHash } from './carrier-hash.vo.js';
import { ValidationException } from '../../../common/exceptions/domain.exception.js';

describe('CarrierHash', () => {
  const VALID_SHA256_HASH = 'a'.repeat(64); // 64 hexadecimal characters
  const ANOTHER_VALID_HASH = 'b'.repeat(64);

  describe('create', () => {
    it('should create CarrierHash with valid SHA-256 hash', () => {
      // Act
      const hash = CarrierHash.create(VALID_SHA256_HASH);

      // Assert
      expect(hash).toBeInstanceOf(CarrierHash);
      expect(hash.value).toBe(VALID_SHA256_HASH);
    });

    it('should normalize hash to lowercase', () => {
      // Arrange
      const mixedCaseHash = 'A1b2C3d4' + 'E'.repeat(56);

      // Act
      const hash = CarrierHash.create(mixedCaseHash);

      // Assert
      expect(hash).toBeInstanceOf(CarrierHash);
      expect(hash.value).toBe(mixedCaseHash.toLowerCase());
    });

    it('should accept hash with numbers and lowercase letters', () => {
      // Arrange
      const validHash = '0123456789abcdef' + 'f'.repeat(48);

      // Act
      const hash = CarrierHash.create(validHash);

      // Assert
      expect(hash).toBeInstanceOf(CarrierHash);
      expect(hash.value).toBe(validHash);
    });

    it('should throw ValidationException for empty hash', () => {
      // Act & Assert
      expect(() => CarrierHash.create('')).toThrow(ValidationException);
      expect(() => CarrierHash.create('')).toThrow(
        'Carrier hash cannot be null or undefined',
      );
    });

    it('should throw ValidationException for null or undefined', () => {
      // Act & Assert
      expect(() => CarrierHash.create(null as any)).toThrow(
        ValidationException,
      );
      expect(() => CarrierHash.create(undefined as any)).toThrow(
        ValidationException,
      );
    });

    it('should throw ValidationException for hash shorter than 64 characters', () => {
      // Arrange
      const shortHash = 'a'.repeat(63);

      // Act & Assert
      expect(() => CarrierHash.create(shortHash)).toThrow(ValidationException);
      expect(() => CarrierHash.create(shortHash)).toThrow(
        'Invalid carrier hash format',
      );
    });

    it('should throw ValidationException for hash longer than 64 characters', () => {
      // Arrange
      const longHash = 'a'.repeat(65);

      // Act & Assert
      expect(() => CarrierHash.create(longHash)).toThrow(ValidationException);
      expect(() => CarrierHash.create(longHash)).toThrow(
        'Invalid carrier hash format',
      );
    });

    it('should throw ValidationException for non-hexadecimal characters', () => {
      // Arrange
      const invalidHash = 'g'.repeat(64); // 'g' is not a hex character

      // Act & Assert
      expect(() => CarrierHash.create(invalidHash)).toThrow(
        ValidationException,
      );
      expect(() => CarrierHash.create(invalidHash)).toThrow(
        'Invalid carrier hash format',
      );
    });

    it('should throw ValidationException for special characters', () => {
      // Arrange
      const invalidHash = '@'.repeat(64);

      // Act & Assert
      expect(() => CarrierHash.create(invalidHash)).toThrow(
        ValidationException,
      );
    });

    it('should throw ValidationException for hash with spaces', () => {
      // Arrange
      const invalidHash = 'a'.repeat(32) + ' ' + 'a'.repeat(31);

      // Act & Assert
      expect(() => CarrierHash.create(invalidHash)).toThrow(
        ValidationException,
      );
    });
  });

  describe('equals', () => {
    it('should return true for identical hashes', () => {
      // Arrange
      const hash1 = CarrierHash.create(VALID_SHA256_HASH);
      const hash2 = CarrierHash.create(VALID_SHA256_HASH);

      // Act & Assert
      expect(hash1.equals(hash2)).toBe(true);
    });

    it('should return false for different hashes', () => {
      // Arrange
      const hash1 = CarrierHash.create(VALID_SHA256_HASH);
      const hash2 = CarrierHash.create(ANOTHER_VALID_HASH);

      // Act & Assert
      expect(hash1.equals(hash2)).toBe(false);
    });

    it('should be case-insensitive in comparison (normalized to lowercase)', () => {
      // Arrange
      const lowerCaseHash = 'a'.repeat(64);
      const upperCaseHash = 'A'.repeat(64);

      const hash1 = CarrierHash.create(lowerCaseHash);
      const hash2 = CarrierHash.create(upperCaseHash);

      // Act & Assert - Both should be normalized to lowercase
      expect(hash1.equals(hash2)).toBe(true);
      expect(hash1.value).toBe(lowerCaseHash);
      expect(hash2.value).toBe(lowerCaseHash);
    });
  });

  describe('toString', () => {
    it('should return hash string', () => {
      // Arrange
      const hash = CarrierHash.create(VALID_SHA256_HASH);

      // Act
      const str = hash.toString();

      // Assert
      expect(str).toBe(VALID_SHA256_HASH);
    });
  });

  describe('immutability', () => {
    it('should not allow modification of value', () => {
      // Arrange
      const hash = CarrierHash.create(VALID_SHA256_HASH);

      // Act & Assert
      expect(() => {
        (hash as any).value = ANOTHER_VALID_HASH;
      }).toThrow();
    });
  });

  describe('real-world SHA-256 hashes', () => {
    it('should accept actual SHA-256 hash from crypto library', () => {
      // Arrange - Real SHA-256 hash
      const realHash =
        'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';

      // Act
      const hash = CarrierHash.create(realHash);

      // Assert
      expect(hash).toBeInstanceOf(CarrierHash);
      expect(hash.value).toBe(realHash);
    });

    it('should accept hash with all hex digits (0-9, a-f)', () => {
      // Arrange
      const hash =
        '0123456789abcdef' +
        '0123456789abcdef' +
        '0123456789abcdef' +
        '0123456789abcdef';

      // Act
      const carrierHash = CarrierHash.create(hash);

      // Assert
      expect(carrierHash).toBeInstanceOf(CarrierHash);
      expect(carrierHash.value.length).toBe(64);
    });
  });
});
