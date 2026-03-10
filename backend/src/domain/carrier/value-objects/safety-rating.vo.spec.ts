// --- AI-ASSISTED ---
// Tool: Claude 4.5 Sonnet
// Prompt: "Create unit tests for SafetyRating value object with validation and scoring"
// Modifications: Added tests for all valid enum values, validation errors, and score mapping
// --- END AI-ASSISTED ---

import { SafetyRating, SafetyRatingValue } from './safety-rating.vo.js';
import { ValidationException } from '../../../common/exceptions/domain.exception.js';

describe('SafetyRating', () => {
  describe('create', () => {
    it('should create Satisfactory rating', () => {
      // Act
      const rating = SafetyRating.create('Satisfactory');

      // Assert
      expect(rating).toBeInstanceOf(SafetyRating);
      expect(rating.value).toBe(SafetyRatingValue.SATISFACTORY);
    });

    it('should create Conditional rating', () => {
      // Act
      const rating = SafetyRating.create('Conditional');

      // Assert
      expect(rating).toBeInstanceOf(SafetyRating);
      expect(rating.value).toBe(SafetyRatingValue.CONDITIONAL);
    });

    it('should create Unsatisfactory rating', () => {
      // Act
      const rating = SafetyRating.create('Unsatisfactory');

      // Assert
      expect(rating).toBeInstanceOf(SafetyRating);
      expect(rating.value).toBe(SafetyRatingValue.UNSATISFACTORY);
    });

    it('should be case-sensitive (require exact casing)', () => {
      // Act & Assert
      expect(() => SafetyRating.create('satisfactory')).toThrow(
        ValidationException,
      );
      expect(() => SafetyRating.create('CONDITIONAL')).toThrow(
        ValidationException,
      );
      expect(() => SafetyRating.create('UnSaTiSfAcToRy')).toThrow(
        ValidationException,
      );
    });

    it('should trim whitespace', () => {
      // Act & Assert
      expect(() => SafetyRating.create('  Satisfactory  ')).not.toThrow();
      const rating = SafetyRating.create('  Conditional  ');
      expect(rating.value).toBe(SafetyRatingValue.CONDITIONAL);
    });

    it('should throw ValidationException for invalid rating', () => {
      // Act & Assert
      expect(() => SafetyRating.create('Invalid')).toThrow(ValidationException);
      expect(() => SafetyRating.create('Good')).toThrow(ValidationException);
      expect(() => SafetyRating.create('')).toThrow(ValidationException);
    });

    it('should throw ValidationException for null or undefined', () => {
      // Act & Assert
      expect(() => SafetyRating.create(null as any)).toThrow(
        ValidationException,
      );
      expect(() => SafetyRating.create(undefined as any)).toThrow(
        ValidationException,
      );
    });
  });

  describe('getScore', () => {
    it('should return 100 for Satisfactory', () => {
      // Arrange
      const rating = SafetyRating.create('Satisfactory');

      // Act
      const score = rating.getScore();

      // Assert
      expect(score).toBe(100);
    });

    it('should return 50 for Conditional', () => {
      // Arrange
      const rating = SafetyRating.create('Conditional');

      // Act
      const score = rating.getScore();

      // Assert
      expect(score).toBe(50);
    });

    it('should return 0 for Unsatisfactory', () => {
      // Arrange
      const rating = SafetyRating.create('Unsatisfactory');

      // Act
      const score = rating.getScore();

      // Assert
      expect(score).toBe(0);
    });
  });

  describe('equals', () => {
    it('should return true for same rating', () => {
      // Arrange
      const rating1 = SafetyRating.create('Satisfactory');
      const rating2 = SafetyRating.create('Satisfactory');

      // Act & Assert
      expect(rating1.equals(rating2)).toBe(true);
    });

    it('should return false for different ratings', () => {
      // Arrange
      const rating1 = SafetyRating.create('Satisfactory');
      const rating2 = SafetyRating.create('Conditional');

      // Act & Assert
      expect(rating1.equals(rating2)).toBe(false);
    });

    it('should compare values (case-sensitive)', () => {
      // Arrange
      const rating1 = SafetyRating.create('Satisfactory');
      const rating2 = SafetyRating.create('Satisfactory');

      // Act & Assert
      expect(rating1.equals(rating2)).toBe(true);
    });
  });

  describe('toString', () => {
    it('should return string representation', () => {
      // Arrange
      const rating = SafetyRating.create('Conditional');

      // Act
      const str = rating.toString();

      // Assert
      expect(str).toBe('Conditional');
    });
  });

  describe('immutability', () => {
    it('should not allow modification of value', () => {
      // Arrange
      const rating = SafetyRating.create('Satisfactory');

      // Act & Assert
      expect(() => {
        (rating as any).value = SafetyRatingValue.UNSATISFACTORY;
      }).toThrow();
    });
  });
});
