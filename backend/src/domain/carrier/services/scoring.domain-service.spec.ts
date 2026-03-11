// --- AI-ASSISTED ---
// Tool: Claude 4.5 Sonnet
// Prompt: "Create comprehensive unit tests for ScoringDomainService with >70% coverage including all edge cases"
// Modifications: Added tests for all 6 scoring factors, edge cases, and composite score calculation
// --- END AI-ASSISTED ---

import { ScoringDomainService } from './scoring.domain-service.js';
import { SafetyRating } from '../value-objects/safety-rating.vo.js';
import { AuthorityStatus } from '../value-objects/authority-status.vo.js';

describe('ScoringDomainService', () => {
  let service: ScoringDomainService;

  beforeEach(() => {
    service = new ScoringDomainService();
  });

  describe('calculateScore', () => {
    it('should calculate perfect score for ideal carrier', () => {
      // Arrange
      const props = {
        safetyRating: SafetyRating.create('Satisfactory'),
        outOfServicePct: 0,
        crashTotal: 0,
        driverOosPct: 0,
        insuranceOnFile: true,
        authorityStatus: AuthorityStatus.create('Active'),
      };

      // Act
      const score = service.calculateScore(props);

      // Assert
      expect(score.total).toBe(100);
      expect(score.breakdown.safetyRating).toBe(100);
      expect(score.breakdown.outOfServicePct).toBe(100);
      expect(score.breakdown.crashTotal).toBe(100);
      expect(score.breakdown.driverOosPct).toBe(100);
      expect(score.breakdown.insuranceOnFile).toBe(100);
      expect(score.breakdown.authorityStatus).toBe(100);
    });

    it('should calculate worst score for problematic carrier', () => {
      // Arrange
      const props = {
        safetyRating: SafetyRating.create('Unsatisfactory'),
        outOfServicePct: 100,
        crashTotal: 15, // Over cap
        driverOosPct: 100,
        insuranceOnFile: false,
        authorityStatus: AuthorityStatus.create('Revoked'),
      };

      // Act
      const score = service.calculateScore(props);

      // Assert
      expect(score.total).toBe(0);
      expect(score.breakdown.safetyRating).toBe(0);
      expect(score.breakdown.outOfServicePct).toBe(0);
      expect(score.breakdown.crashTotal).toBe(0);
      expect(score.breakdown.driverOosPct).toBe(0);
      expect(score.breakdown.insuranceOnFile).toBe(0);
      expect(score.breakdown.authorityStatus).toBe(0);
    });

    it('should calculate score for real-world carrier example', () => {
      // Arrange: "Reliable Freight LLC" from sample data
      const props = {
        safetyRating: SafetyRating.create('Satisfactory'),
        outOfServicePct: 12.5,
        crashTotal: 2,
        driverOosPct: 5.3,
        insuranceOnFile: true,
        authorityStatus: AuthorityStatus.create('Active'),
      };

      // Act
      const score = service.calculateScore(props);

      // Assert
      // Expected calculation:
      // - safetyRating: 100 * 0.25 = 25.0
      // - outOfServicePct: 87.5 * 0.20 = 17.5
      // - crashTotal: 80 * 0.20 = 16.0
      // - driverOosPct: 94.7 * 0.15 = 14.205
      // - insuranceOnFile: 100 * 0.10 = 10.0
      // - authorityStatus: 100 * 0.10 = 10.0
      // Total: 92.705 → rounded to 92.71
      expect(score.total).toBeCloseTo(92.71, 2);
      expect(score.breakdown.safetyRating).toBe(100);
      expect(score.breakdown.outOfServicePct).toBe(87.5);
      expect(score.breakdown.crashTotal).toBe(80);
      expect(score.breakdown.driverOosPct).toBe(94.7);
      expect(score.breakdown.insuranceOnFile).toBe(100);
      expect(score.breakdown.authorityStatus).toBe(100);
    });

    it('should apply correct weights to each factor', () => {
      // Arrange: Carrier with only safety rating perfect
      const props = {
        safetyRating: SafetyRating.create('Satisfactory'),
        outOfServicePct: 100,
        crashTotal: 15,
        driverOosPct: 100,
        insuranceOnFile: false,
        authorityStatus: AuthorityStatus.create('Revoked'),
      };

      // Act
      const score = service.calculateScore(props);

      // Assert: Only safety rating contributes (25% of 100 = 25)
      expect(score.total).toBe(25);
    });

    it('should round total score to 2 decimal places', () => {
      // Arrange
      const props = {
        safetyRating: SafetyRating.create('Conditional'),
        outOfServicePct: 33.333,
        crashTotal: 3,
        driverOosPct: 16.666,
        insuranceOnFile: true,
        authorityStatus: AuthorityStatus.create('Inactive'),
      };

      // Act
      const score = service.calculateScore(props);

      // Assert
      // Expected calculation:
      // - safetyRating: 50 * 0.25 = 12.5
      // - outOfServicePct: 66.667 * 0.20 = 13.3334
      // - crashTotal: 70 * 0.20 = 14.0
      // - driverOosPct: 83.334 * 0.15 = 12.5001
      // - insuranceOnFile: 100 * 0.10 = 10.0
      // - authorityStatus: 50 * 0.10 = 5.0
      // Total: 67.3335 → rounded to 67.33
      expect(score.total).toBeCloseTo(67.33, 2);
      expect(score.total.toString()).toMatch(/^\d+\.\d{1,2}$/); // Max 2 decimals
    });
  });

  describe('Safety Rating Factor', () => {
    it('should score Satisfactory as 100', () => {
      const props = createDefaultProps();
      props.safetyRating = SafetyRating.create('Satisfactory');

      const score = service.calculateScore(props);

      expect(score.breakdown.safetyRating).toBe(100);
    });

    it('should score Conditional as 50', () => {
      const props = createDefaultProps();
      props.safetyRating = SafetyRating.create('Conditional');

      const score = service.calculateScore(props);

      expect(score.breakdown.safetyRating).toBe(50);
    });

    it('should score Unsatisfactory as 0', () => {
      const props = createDefaultProps();
      props.safetyRating = SafetyRating.create('Unsatisfactory');

      const score = service.calculateScore(props);

      expect(score.breakdown.safetyRating).toBe(0);
    });
  });

  describe('Out-of-Service Percentage Factor', () => {
    it('should score 0% as 100 points', () => {
      const props = createDefaultProps();
      props.outOfServicePct = 0;

      const score = service.calculateScore(props);

      expect(score.breakdown.outOfServicePct).toBe(100);
    });

    it('should score 50% as 50 points (inverse scale)', () => {
      const props = createDefaultProps();
      props.outOfServicePct = 50;

      const score = service.calculateScore(props);

      expect(score.breakdown.outOfServicePct).toBe(50);
    });

    it('should score 100% as 0 points', () => {
      const props = createDefaultProps();
      props.outOfServicePct = 100;

      const score = service.calculateScore(props);

      expect(score.breakdown.outOfServicePct).toBe(0);
    });

    it('should handle decimal percentages correctly', () => {
      const props = createDefaultProps();
      props.outOfServicePct = 12.5;

      const score = service.calculateScore(props);

      expect(score.breakdown.outOfServicePct).toBe(87.5);
    });

    it('should handle invalid percentage > 100 as 0 points', () => {
      const props = createDefaultProps();
      props.outOfServicePct = 150;

      const score = service.calculateScore(props);

      expect(score.breakdown.outOfServicePct).toBe(0);
    });

    it('should handle invalid negative percentage as 100 points', () => {
      const props = createDefaultProps();
      props.outOfServicePct = -10;

      const score = service.calculateScore(props);

      expect(score.breakdown.outOfServicePct).toBe(100);
    });
  });

  describe('Crash Total Factor', () => {
    it('should score 0 crashes as 100 points', () => {
      const props = createDefaultProps();
      props.crashTotal = 0;

      const score = service.calculateScore(props);

      expect(score.breakdown.crashTotal).toBe(100);
    });

    it('should score 1 crash as 90 points', () => {
      const props = createDefaultProps();
      props.crashTotal = 1;

      const score = service.calculateScore(props);

      expect(score.breakdown.crashTotal).toBe(90);
    });

    it('should score 5 crashes as 50 points', () => {
      const props = createDefaultProps();
      props.crashTotal = 5;

      const score = service.calculateScore(props);

      expect(score.breakdown.crashTotal).toBe(50);
    });

    it('should score 10 crashes as 0 points (at cap)', () => {
      const props = createDefaultProps();
      props.crashTotal = 10;

      const score = service.calculateScore(props);

      expect(score.breakdown.crashTotal).toBe(0);
    });

    it('should cap crashes at 10 (15 crashes = 0 points)', () => {
      const props = createDefaultProps();
      props.crashTotal = 15;

      const score = service.calculateScore(props);

      expect(score.breakdown.crashTotal).toBe(0);
    });

    it('should cap crashes at 10 (100 crashes = 0 points)', () => {
      const props = createDefaultProps();
      props.crashTotal = 100;

      const score = service.calculateScore(props);

      expect(score.breakdown.crashTotal).toBe(0);
    });

    it('should handle negative crashes as 100 points', () => {
      const props = createDefaultProps();
      props.crashTotal = -5;

      const score = service.calculateScore(props);

      expect(score.breakdown.crashTotal).toBe(100);
    });
  });

  describe('Driver OOS Percentage Factor', () => {
    it('should use same logic as vehicle OOS percentage', () => {
      const props1 = createDefaultProps();
      props1.outOfServicePct = 25;

      const props2 = createDefaultProps();
      props2.driverOosPct = 25;

      const score1 = service.calculateScore(props1);
      const score2 = service.calculateScore(props2);

      expect(score2.breakdown.driverOosPct).toBe(75);
      // Should follow same inverse scale as OOS
      expect(score2.breakdown.driverOosPct).toBe(
        score1.breakdown.outOfServicePct,
      );
    });

    it('should score 0% as 100 points', () => {
      const props = createDefaultProps();
      props.driverOosPct = 0;

      const score = service.calculateScore(props);

      expect(score.breakdown.driverOosPct).toBe(100);
    });

    it('should score 100% as 0 points', () => {
      const props = createDefaultProps();
      props.driverOosPct = 100;

      const score = service.calculateScore(props);

      expect(score.breakdown.driverOosPct).toBe(0);
    });
  });

  describe('Insurance on File Factor', () => {
    it('should score true as 100 points', () => {
      const props = createDefaultProps();
      props.insuranceOnFile = true;

      const score = service.calculateScore(props);

      expect(score.breakdown.insuranceOnFile).toBe(100);
    });

    it('should score false as 0 points', () => {
      const props = createDefaultProps();
      props.insuranceOnFile = false;

      const score = service.calculateScore(props);

      expect(score.breakdown.insuranceOnFile).toBe(0);
    });
  });

  describe('Authority Status Factor', () => {
    it('should score Active as 100', () => {
      const props = createDefaultProps();
      props.authorityStatus = AuthorityStatus.create('Active');

      const score = service.calculateScore(props);

      expect(score.breakdown.authorityStatus).toBe(100);
    });

    it('should score Inactive as 50', () => {
      const props = createDefaultProps();
      props.authorityStatus = AuthorityStatus.create('Inactive');

      const score = service.calculateScore(props);

      expect(score.breakdown.authorityStatus).toBe(50);
    });

    it('should score Revoked as 0', () => {
      const props = createDefaultProps();
      props.authorityStatus = AuthorityStatus.create('Revoked');

      const score = service.calculateScore(props);

      expect(score.breakdown.authorityStatus).toBe(0);
    });
  });

  describe('Weight Distribution', () => {
    it('should sum weights to 100%', () => {
      // Weights should be: 25 + 20 + 20 + 15 + 10 + 10 = 100%
      const props = createDefaultProps(); // All perfect scores

      const score = service.calculateScore(props);

      expect(score.total).toBe(100);
    });

    it('should apply 25% weight to safety rating', () => {
      const props = createDefaultProps();
      props.safetyRating = SafetyRating.create('Satisfactory'); // 100 points
      // All others 0
      props.outOfServicePct = 100;
      props.crashTotal = 15;
      props.driverOosPct = 100;
      props.insuranceOnFile = false;
      props.authorityStatus = AuthorityStatus.create('Revoked');

      const score = service.calculateScore(props);

      expect(score.total).toBe(25); // 100 * 0.25
    });

    it('should apply 20% weight to OOS percentage', () => {
      const props = createDefaultProps();
      props.outOfServicePct = 0; // 100 points
      // All others 0
      props.safetyRating = SafetyRating.create('Unsatisfactory');
      props.crashTotal = 15;
      props.driverOosPct = 100;
      props.insuranceOnFile = false;
      props.authorityStatus = AuthorityStatus.create('Revoked');

      const score = service.calculateScore(props);

      expect(score.total).toBe(20); // 100 * 0.20
    });

    it('should apply 20% weight to crash total', () => {
      const props = createDefaultProps();
      props.crashTotal = 0; // 100 points
      // All others 0
      props.safetyRating = SafetyRating.create('Unsatisfactory');
      props.outOfServicePct = 100;
      props.driverOosPct = 100;
      props.insuranceOnFile = false;
      props.authorityStatus = AuthorityStatus.create('Revoked');

      const score = service.calculateScore(props);

      expect(score.total).toBe(20); // 100 * 0.20
    });

    it('should apply 15% weight to driver OOS percentage', () => {
      const props = createDefaultProps();
      props.driverOosPct = 0; // 100 points
      // All others 0
      props.safetyRating = SafetyRating.create('Unsatisfactory');
      props.outOfServicePct = 100;
      props.crashTotal = 15;
      props.insuranceOnFile = false;
      props.authorityStatus = AuthorityStatus.create('Revoked');

      const score = service.calculateScore(props);

      expect(score.total).toBe(15); // 100 * 0.15
    });

    it('should apply 10% weight to insurance on file', () => {
      const props = createDefaultProps();
      props.insuranceOnFile = true; // 100 points
      // All others 0
      props.safetyRating = SafetyRating.create('Unsatisfactory');
      props.outOfServicePct = 100;
      props.crashTotal = 15;
      props.driverOosPct = 100;
      props.authorityStatus = AuthorityStatus.create('Revoked');

      const score = service.calculateScore(props);

      expect(score.total).toBe(10); // 100 * 0.10
    });

    it('should apply 10% weight to authority status', () => {
      const props = createDefaultProps();
      props.authorityStatus = AuthorityStatus.create('Active'); // 100 points
      // All others 0
      props.safetyRating = SafetyRating.create('Unsatisfactory');
      props.outOfServicePct = 100;
      props.crashTotal = 15;
      props.driverOosPct = 100;
      props.insuranceOnFile = false;

      const score = service.calculateScore(props);

      expect(score.total).toBe(10); // 100 * 0.10
    });
  });
});

// Helper function to create default props with perfect scores
function createDefaultProps() {
  return {
    safetyRating: SafetyRating.create('Satisfactory'),
    outOfServicePct: 0,
    crashTotal: 0,
    driverOosPct: 0,
    insuranceOnFile: true,
    authorityStatus: AuthorityStatus.create('Active'),
  };
}
