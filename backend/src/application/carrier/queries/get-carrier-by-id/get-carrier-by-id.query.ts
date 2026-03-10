// --- AI-ASSISTED ---
// Tool: Claude 4.5 Sonnet
// Prompt: "Create a CQRS query for retrieving a single carrier by ID"
// Modifications: Added query pattern with carrier ID parameter
// --- END AI-ASSISTED ---

/**
 * Query: Get Carrier By ID
 *
 * Represents the intent to retrieve a specific carrier by their carrier_id.
 *
 * CQRS Pattern:
 * - Read operation (no state changes)
 * - Immutable query object
 * - Handled by GetCarrierByIdQueryHandler
 *
 * Returns:
 * - Carrier entity if found
 * - null if not found
 */
export class GetCarrierByIdQuery {
  constructor(
    /**
     * Unique carrier identifier (MC number)
     * Example: "MC-123456"
     */
    public readonly carrierId: string,
  ) {}
}
