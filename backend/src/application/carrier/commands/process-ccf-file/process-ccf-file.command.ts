// --- AI-ASSISTED ---
// Tool: Claude 4.5 Sonnet
// Prompt: "Create a CQRS command for processing CCF files with carrier compliance data"
// Modifications: Added command pattern, immutable data structure
// --- END AI-ASSISTED ---

import { CCFData } from '../../../../domain/carrier/entities/carrier.entity.js';

/**
 * Command: Process CCF File
 *
 * Represents the intent to process a Carrier Compliance File (CCF).
 *
 * This command triggers the main use case:
 * 1. Parse CCF data
 * 2. For each carrier:
 *    - Check if exists in DB
 *    - Detect changes via hash comparison
 *    - Update/create carrier
 *    - Recalculate score if needed
 * 3. Return processing summary
 *
 * CQRS Pattern:
 * - Commands represent write operations (state changes)
 * - This is the only command in the Carrier bounded context
 * - Handled by ProcessCCFFileHandler
 *
 * Immutable: All properties are readonly
 */
export class ProcessCCFFileCommand {
  constructor(
    /**
     * Array of carrier compliance records from the CCF file
     */
    public readonly ccfRecords: CCFData[],

    /**
     * Optional correlation ID for request tracing
     */
    public readonly correlationId?: string,
  ) {}
}
