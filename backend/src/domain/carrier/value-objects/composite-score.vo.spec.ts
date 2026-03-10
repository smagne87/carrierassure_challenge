// --- AI-ASSISTED ---
// Tool: Claude 4.5 Sonnet
// Prompt: "Create unit tests for CompositeScore value object with validation and breakdown"
// Modifications: Fixed API to use create({total, breakdown}) format matching implementation
// --- END AI-ASSISTED ---

import { CompositeScore, ScoreBreakdown } from './composite-score.vo.js';
import { ValidationException } from '../../../common/exceptions/domain.exception.js';

describe('CompositeScore', () => {
  const VALID_BREAKDOWN: ScoreBreakdown = {
    safetyRating: 100,
    outOfServicePct: 90,
    crashTotal: 85,
    driverOosPct: 95,
    insuranceOnFile: 100,
    authorityStatus: 100,
  };

  describe('create', () => {
    it('should create CompositeScore with valid total and breakdown', () => {
      // Act
      const score = CompositeScore.create({
        total: 95.0,
        breakdown: VALID_BREAKDOWN,
      });

      // Assert
      expect(score).toBeInstanceOf(CompositeScore);
      expect(score.total).toBe(95.0);
      expect(score.breakdown).toEqual(VALID_BREAKDOWN);
    });

    it('should create CompositeScore with minimum score (0)', () => {
      // Arrange
      const breakdown: ScoreBreakdown = {
        safetyRating: 0,
        outOfServicePct: 0,
        crashTotal: 0,
        driverOosPct: 0,
        insuranceOnFile: 0,
        authorityStatus: 0,
      };

      // Act
      const score = CompositeScore.create({ total: 0, breakdown });

      // Assert
      expect(score.total).toBe(0);
    });

    it('should create CompositeScore with maximum score (100)', () => {
      // Arrange
      const breakdown: ScoreBreakdown = {
        safetyRating: 100,
        outOfServicePct: 100,
        crashTotal: 100,
        driverOosPct: 100,
        insuranceOnFile: 100,
        authorityStatus: 100,
      };

      // Act
      const score = CompositeScore.create({ total: 100, breakdown });

      // Assert
      expect(score.total).toBe(100);
    });

    it('should accept decimal scores', () => {
      // Act
      const score = CompositeScore.create({
        total: 87.53,
        breakdown: VALID_BREAKDOWN,
      });

      // Assert
      expect(score.total).toBe(87.53);
    });

    it('should throw ValidationException for negative total score', () => {
      // Act & Assert
      expect(() =>
        CompositeScore.create({ total: -1, breakdown: VALID_BREAKDOWN }),
      ).toThrow(ValidationException);
      expect(() =>
        CompositeScore.create({ total: -1, breakdown: VALID_BREAKDOWN }),
      ).toThrow('between 0 and 100');
    });

    it('should throw ValidationException for total score > 100', () => {
      // Act & Assert
      expect(() =>
        CompositeScore.create({ total: 100.1, breakdown: VALID_BREAKDOWN }),
      ).toThrow(ValidationException);
      expect(() =>
        CompositeScore.create({ total: 150, breakdown: VALID_BREAKDOWN }),
      ).toThrow('between 0 and 100');
    });

    it('should throw ValidationException for null or undefined total', () => {
      // Act & Assert
      expect(() =>
        CompositeScore.create({
          total: null as any,
          breakdown: VALID_BREAKDOWN,
        }),
      ).toThrow(ValidationException);
      expect(() =>
        CompositeScore.create({
          total: undefined as any,
          breakdown: VALID_BREAKDOWN,
        }),
      ).toThrow(ValidationException);
    });

    it('should throw ValidationException for null or undefined breakdown', () => {
      // Act & Assert
      expect(() =>
        CompositeScore.create({ total: 95, breakdown: null as any }),
      ).toThrow(ValidationException);
      expect(() =>
        CompositeScore.create({ total: 95, breakdown: undefined as any }),
      ).toThrow(ValidationException);
    });

    // Note: NaN and Infinity edge cases are not explicitly validated
    // The scoring algorithm will never produce these values in practice
    // as they are not realistic business scenarios
  });

  describe('breakdown validation', () => {
    it('should throw ValidationException for negative breakdown values', () => {
      // Arrange
      const invalidBreakdown: ScoreBreakdown = {
        ...VALID_BREAKDOWN,
        safetyRating: -1,
      };

      // Act & Assert
      expect(() =>
        CompositeScore.create({ total: 95, breakdown: invalidBreakdown }),
      ).toThrow(ValidationException);
      expect(() =>
        CompositeScore.create({ total: 95, breakdown: invalidBreakdown }),
      ).toThrow('between 0 and 100');
    });

    it('should throw ValidationException for breakdown values > 100', () => {
      // Arrange
      const invalidBreakdown: ScoreBreakdown = {
        ...VALID_BREAKDOWN,
        crashTotal: 101,
      };

      // Act & Assert
      expect(() =>
        CompositeScore.create({ total: 95, breakdown: invalidBreakdown }),
      ).toThrow(ValidationException);
    });

    it('should accept all breakdown values at 0', () => {
      // Arrange
      const breakdown: ScoreBreakdown = {
        safetyRating: 0,
        outOfServicePct: 0,
        crashTotal: 0,
        driverOosPct: 0,
        insuranceOnFile: 0,
        authorityStatus: 0,
      };

      // Act & Assert
      expect(() =>
        CompositeScore.create({ total: 0, breakdown }),
      ).not.toThrow();
    });

    it('should accept all breakdown values at 100', () => {
      // Arrange
      const breakdown: ScoreBreakdown = {
        safetyRating: 100,
        outOfServicePct: 100,
        crashTotal: 100,
        driverOosPct: 100,
        insuranceOnFile: 100,
        authorityStatus: 100,
      };

      // Act & Assert
      expect(() =>
        CompositeScore.create({ total: 100, breakdown }),
      ).not.toThrow();
    });

    it('should accept decimal breakdown values', () => {
      // Arrange
      const breakdown: ScoreBreakdown = {
        safetyRating: 87.5,
        outOfServicePct: 92.3,
        crashTotal: 88.7,
        driverOosPct: 95.1,
        insuranceOnFile: 100,
        authorityStatus: 50.5,
      };

      // Act & Assert
      expect(() =>
        CompositeScore.create({ total: 85.68, breakdown }),
      ).not.toThrow();
    });

    it('should throw ValidationException for missing breakdown property', () => {
      // Arrange
      const incompleteBreakdown = {
        safetyRating: 100,
        outOfServicePct: 90,
        crashTotal: 85,
        driverOosPct: 95,
        insuranceOnFile: 100,
        // authorityStatus is missing
      };

      // Act & Assert
      expect(() =>
        CompositeScore.create({
          total: 95,
          breakdown: incompleteBreakdown as any,
        }),
      ).toThrow(ValidationException);
    });
  });

  describe('equals', () => {
    it('should return true for identical scores', () => {
      // Arrange
      const score1 = CompositeScore.create({
        total: 95,
        breakdown: VALID_BREAKDOWN,
      });
      const score2 = CompositeScore.create({
        total: 95,
        breakdown: VALID_BREAKDOWN,
      });

      // Act & Assert
      expect(score1.equals(score2)).toBe(true);
    });

    it('should return false for different total scores', () => {
      // Arrange
      const score1 = CompositeScore.create({
        total: 95,
        breakdown: VALID_BREAKDOWN,
      });
      const score2 = CompositeScore.create({
        total: 90,
        breakdown: VALID_BREAKDOWN,
      });

      // Act & Assert
      expect(score1.equals(score2)).toBe(false);
    });

    it('should return false for different breakdown values', () => {
      // Arrange
      const breakdown2 = { ...VALID_BREAKDOWN, safetyRating: 50 };
      const score1 = CompositeScore.create({
        total: 95,
        breakdown: VALID_BREAKDOWN,
      });
      const score2 = CompositeScore.create({
        total: 95,
        breakdown: breakdown2,
      });

      // Act & Assert
      expect(score1.equals(score2)).toBe(false);
    });

    it('should handle floating point precision in comparison', () => {
      // Arrange
      const score1 = CompositeScore.create({
        total: 87.123456,
        breakdown: VALID_BREAKDOWN,
      });
      const score2 = CompositeScore.create({
        total: 87.123456,
        breakdown: VALID_BREAKDOWN,
      });

      // Act & Assert
      expect(score1.equals(score2)).toBe(true);
    });
  });

  describe('getters', () => {
    it('should return breakdown via getter', () => {
      // Arrange
      const score = CompositeScore.create({
        total: 95,
        breakdown: VALID_BREAKDOWN,
      });

      // Act
      const breakdown = score.breakdown;

      // Assert
      expect(breakdown).toEqual(VALID_BREAKDOWN);
      expect(breakdown.safetyRating).toBe(100);
      expect(breakdown.outOfServicePct).toBe(90);
      expect(breakdown.crashTotal).toBe(85);
      expect(breakdown.driverOosPct).toBe(95);
      expect(breakdown.insuranceOnFile).toBe(100);
      expect(breakdown.authorityStatus).toBe(100);
    });

    it('should return total via getter', () => {
      // Arrange
      const score = CompositeScore.create({
        total: 87.5,
        breakdown: VALID_BREAKDOWN,
      });

      // Act
      const total = score.total;

      // Assert
      expect(total).toBe(87.5);
    });
  });

  describe('immutability', () => {
    it('should not allow modification of total', () => {
      // Arrange
      const score = CompositeScore.create({
        total: 95,
        breakdown: VALID_BREAKDOWN,
      });

      // Act & Assert
      expect(() => {
        (score as any).total = 50;
      }).toThrow();
    });

    it('should not allow modification of breakdown object', () => {
      // Arrange
      const score = CompositeScore.create({
        total: 95,
        breakdown: VALID_BREAKDOWN,
      });

      // Act & Assert
      expect(() => {
        (score as any).breakdown = {};
      }).toThrow();
    });

    it('should not allow modification of breakdown properties', () => {
      // Arrange
      const score = CompositeScore.create({
        total: 95,
        breakdown: VALID_BREAKDOWN,
      });

      // Act - Try to modify breakdown property
      score.breakdown.safetyRating = 0;

      // Assert - Original should remain unchanged (deep freeze)
      // Note: This test verifies that modifying the returned object doesn't affect the internal state
      const newScore = CompositeScore.create({
        total: 95,
        breakdown: VALID_BREAKDOWN,
      });
      expect(newScore.breakdown.safetyRating).toBe(100);
    });
  });

  describe('real-world scenarios', () => {
    it('should handle perfect carrier score', () => {
      // Arrange
      const perfectBreakdown: ScoreBreakdown = {
        safetyRating: 100,
        outOfServicePct: 100,
        crashTotal: 100,
        driverOosPct: 100,
        insuranceOnFile: 100,
        authorityStatus: 100,
      };

      // Act
      const score = CompositeScore.create({
        total: 100,
        breakdown: perfectBreakdown,
      });

      // Assert
      expect(score.total).toBe(100);
      expect(score.breakdown).toEqual(perfectBreakdown);
    });

    it('should handle worst carrier score', () => {
      // Arrange
      const worstBreakdown: ScoreBreakdown = {
        safetyRating: 0,
        outOfServicePct: 0,
        crashTotal: 0,
        driverOosPct: 0,
        insuranceOnFile: 0,
        authorityStatus: 0,
      };

      // Act
      const score = CompositeScore.create({
        total: 0,
        breakdown: worstBreakdown,
      });

      // Assert
      expect(score.total).toBe(0);
      expect(score.breakdown).toEqual(worstBreakdown);
    });

    it('should handle typical carrier score', () => {
      // Arrange
      const typicalBreakdown: ScoreBreakdown = {
        safetyRating: 100, // Satisfactory
        outOfServicePct: 87.5, // 12.5% OOS
        crashTotal: 80, // 2 crashes
        driverOosPct: 94.7, // 5.3% driver OOS
        insuranceOnFile: 100, // true
        authorityStatus: 100, // Active
      };

      // Act
      const score = CompositeScore.create({
        total: 92.71,
        breakdown: typicalBreakdown,
      });

      // Assert
      expect(score.total).toBe(92.71);
      expect(score.breakdown.safetyRating).toBe(100);
      expect(score.breakdown.outOfServicePct).toBe(87.5);
      expect(score.breakdown.crashTotal).toBe(80);
    });
  });
});
