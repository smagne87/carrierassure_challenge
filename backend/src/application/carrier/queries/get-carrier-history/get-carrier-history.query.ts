// --- AI-ASSISTED ---
// Tool: Claude 4.5 Sonnet
// Prompt: "Create a CQRS query for retrieving carrier score history"
// Modifications: Added query pattern for historical data retrieval
// --- END AI-ASSISTED ---

import { ScoreHistoryEntry } from '../../../../domain/carrier/entities/carrier.entity.js';

/**
 * Query: Get Carrier History
 *
 * Represents the intent to retrieve score history for a specific carrier.
 *
 * CQRS Pattern:
 * - Read operation (no state changes)
 * - Immutable query object
 * - Handled by GetCarrierHistoryQueryHandler
 *
 * Returns:
 * - Array of score history entries (chronologically ordered)
 * - Empty array if carrier not found or has no history
 */
export class GetCarrierHistoryQuery {
  constructor(
    /**
     * Unique carrier identifier (MC number)
     * Example: "MC-123456"
     */
    public readonly carrierId: string,
  ) {}
}

/**
 * Result type for GetCarrierHistoryQuery
 */
export type CarrierHistoryResult = ScoreHistoryEntry[];
