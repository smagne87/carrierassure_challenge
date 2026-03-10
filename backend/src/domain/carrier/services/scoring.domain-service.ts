// --- AI-ASSISTED ---
// Tool: Claude 4.5 Sonnet
// Prompt: "Create a scoring domain service that calculates composite carrier safety scores based on 6 weighted factors"
// Modifications: Added detailed scoring algorithm, weight constants, individual factor methods, comprehensive comments
// --- END AI-ASSISTED ---

import { Injectable } from '@nestjs/common';
import {
  CompositeScore,
  ScoreBreakdown,
} from '../value-objects/composite-score.vo.js';
import { SafetyRating } from '../value-objects/safety-rating.vo.js';
import { AuthorityStatus } from '../value-objects/authority-status.vo.js';

/**
 * Domain Service responsible for calculating carrier safety scores.
 *
 * Implements the scoring algorithm based on 6 weighted factors:
 * - safety_rating (25%): USDOT safety rating
 * - out_of_service_pct (20%): Vehicle out-of-service percentage
 * - crash_total (20%): Total crashes in last 24 months
 * - driver_oos_pct (15%): Driver out-of-service percentage
 * - insurance_on_file (10%): Insurance status
 * - authority_status (10%): Operating authority status
 *
 * Total: 100%
 *
 * This is a stateless domain service - it contains no mutable state.
 * The scoring logic is pure business logic with no infrastructure dependencies.
 */
@Injectable()
export class ScoringDomainService {
  /**
   * Scoring weights for each factor (must sum to 1.0)
   *
   * These weights were defined in the assessment requirements.
   * Changes to weights would require business approval.
   */
  private readonly WEIGHTS = {
    safetyRating: 0.25, // 25%
    outOfServicePct: 0.2, // 20%
    crashTotal: 0.2, // 20%
    driverOosPct: 0.15, // 15%
    insuranceOnFile: 0.1, // 10%
    authorityStatus: 0.1, // 10%
  } as const;

  /**
   * Maximum crash count for scoring purposes.
   * Crashes beyond this cap are treated the same (0 points).
   */
  private readonly MAX_CRASH_CAP = 10;

  /**
   * Calculates the composite safety score for a carrier.
   *
   * Algorithm:
   * 1. Calculate individual component scores (0-100 range)
   * 2. Apply weights to each component
   * 3. Sum weighted scores to get total
   * 4. Round to 2 decimal places
   *
   * @param props Carrier properties needed for scoring
   * @returns A CompositeScore value object with total and breakdown
   */
  public calculateScore(props: {
    safetyRating: SafetyRating;
    outOfServicePct: number;
    crashTotal: number;
    driverOosPct: number;
    insuranceOnFile: boolean;
    authorityStatus: AuthorityStatus;
  }): CompositeScore {
    // Calculate individual component scores (0-100 range)
    const components: ScoreBreakdown = {
      safetyRating: this.scoreSafetyRating(props.safetyRating),
      outOfServicePct: this.scoreOutOfServicePct(props.outOfServicePct),
      crashTotal: this.scoreCrashTotal(props.crashTotal),
      driverOosPct: this.scoreDriverOosPct(props.driverOosPct),
      insuranceOnFile: this.scoreInsuranceOnFile(props.insuranceOnFile),
      authorityStatus: this.scoreAuthorityStatus(props.authorityStatus),
    };

    // Calculate weighted total score
    const totalScore =
      components.safetyRating * this.WEIGHTS.safetyRating +
      components.outOfServicePct * this.WEIGHTS.outOfServicePct +
      components.crashTotal * this.WEIGHTS.crashTotal +
      components.driverOosPct * this.WEIGHTS.driverOosPct +
      components.insuranceOnFile * this.WEIGHTS.insuranceOnFile +
      components.authorityStatus * this.WEIGHTS.authorityStatus;

    // Round to 2 decimal places
    const roundedTotal = Math.round(totalScore * 100) / 100;

    return CompositeScore.create({
      total: roundedTotal,
      breakdown: components,
    });
  }

  /**
   * Scores the safety rating factor.
   * Delegates to the SafetyRating value object's getScore() method.
   *
   * @returns 0-100 score
   */
  private scoreSafetyRating(rating: SafetyRating): number {
    return rating.getScore();
  }

  /**
   * Scores the out-of-service percentage factor.
   * Uses inverse scale: lower percentage = higher score.
   *
   * Formula: max(0, 100 - percentage)
   *
   * Examples:
   * - 0% OOS → 100 points
   * - 50% OOS → 50 points
   * - 100% OOS → 0 points
   * - >100% (invalid data) → 0 points
   *
   * @param pct Out-of-service percentage (0-100)
   * @returns 0-100 score
   */
  private scoreOutOfServicePct(pct: number): number {
    if (pct < 0) return 100;
    if (pct > 100) return 0;
    return Math.max(0, 100 - pct);
  }

  /**
   * Scores the crash total factor.
   * Uses inverse scale with a cap at MAX_CRASH_CAP.
   *
   * Formula: max(0, 100 - (min(crashes, MAX_CRASH_CAP) * 10))
   *
   * Examples:
   * - 0 crashes → 100 points
   * - 5 crashes → 50 points
   * - 10 crashes → 0 points
   * - 15 crashes → 0 points (capped at 10)
   *
   * Rationale for cap: Beyond 10 crashes, the carrier is already
   * at maximum risk. Additional crashes don't further decrease the score.
   *
   * @param crashes Total crashes in last 24 months
   * @returns 0-100 score
   */
  private scoreCrashTotal(crashes: number): number {
    if (crashes < 0) return 100;

    const cappedCrashes = Math.min(crashes, this.MAX_CRASH_CAP);
    return Math.max(0, 100 - cappedCrashes * 10);
  }

  /**
   * Scores the driver out-of-service percentage factor.
   * Uses the same inverse scale as vehicle OOS percentage.
   *
   * @param pct Driver OOS percentage (0-100)
   * @returns 0-100 score
   */
  private scoreDriverOosPct(pct: number): number {
    return this.scoreOutOfServicePct(pct); // Same logic as vehicle OOS
  }

  /**
   * Scores the insurance on file factor.
   * Binary scoring: either full points or zero.
   *
   * @param hasInsurance Whether valid insurance is on file
   * @returns 100 if true, 0 if false
   */
  private scoreInsuranceOnFile(hasInsurance: boolean): number {
    return hasInsurance ? 100 : 0;
  }

  /**
   * Scores the authority status factor.
   * Delegates to the AuthorityStatus value object's getScore() method.
   *
   * @returns 0-100 score
   */
  private scoreAuthorityStatus(status: AuthorityStatus): number {
    return status.getScore();
  }
}
