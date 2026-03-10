// --- AI-ASSISTED ---
// Tool: Claude 4.5 Sonnet
// Prompt: "Create a CQRS query for retrieving carriers with filtering and pagination options"
// Modifications: Added query pattern with optional filters
// --- END AI-ASSISTED ---

/**
 * Query: Get Carriers
 *
 * Represents the intent to retrieve carriers with optional filters.
 *
 * CQRS Pattern:
 * - Queries represent read operations (no state changes)
 * - Immutable query object
 * - Handled by GetCarriersQueryHandler
 *
 * Supports:
 * - Pagination (limit, skip)
 * - Filtering (min_score)
 * - Sorting (by score descending - handled by repository)
 */
export class GetCarriersQuery {
  constructor(
    /**
     * Maximum number of carriers to return
     */
    public readonly limit?: number,

    /**
     * Minimum score threshold (0-100)
     * Only carriers with score >= min_score will be returned
     */
    public readonly min_score?: number,

    /**
     * Number of carriers to skip (for pagination)
     */
    public readonly skip?: number,
  ) {}
}
