// --- AI-ASSISTED ---
// Tool: Claude 4.5 Sonnet
// Prompt: "Create NestJS application module with CQRS configuration and command/query handlers"
// Modifications: Added CqrsModule integration, registered all handlers, exported buses
// --- END AI-ASSISTED ---

import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { DatabaseModule } from '../../infrastructure/database/database.module.js';
import { CarrierDomainModule } from '../../domain/carrier/carrier-domain.module.js';

// Command Handlers
import { ProcessCCFFileHandler } from './commands/process-ccf-file/process-ccf-file.handler.js';

// Query Handlers
import { GetCarriersQueryHandler } from './queries/get-carriers/get-carriers.handler.js';
import { GetCarrierByIdQueryHandler } from './queries/get-carrier-by-id/get-carrier-by-id.handler.js';
import { GetCarrierHistoryQueryHandler } from './queries/get-carrier-history/get-carrier-history.handler.js';

/**
 * Carrier Application Module
 *
 * This module represents the Application Layer in Clean Architecture.
 *
 * Responsibilities:
 * - Orchestrate use cases via CQRS pattern
 * - Coordinate between Domain and Infrastructure layers
 * - Provide command and query handlers
 *
 * CQRS Pattern:
 * - Commands: Write operations (ProcessCCFFileCommand)
 * - Queries: Read operations (GetCarriers, GetCarrierById, GetCarrierHistory)
 * - Separation enables different optimization strategies for reads vs writes
 *
 * Dependencies:
 * - CqrsModule: Provides CommandBus and QueryBus
 * - DatabaseModule: Provides repository implementations
 * - CarrierDomainModule: Provides domain services
 *
 * Exports:
 * - CommandBus and QueryBus (via CqrsModule)
 * - Used by Presentation layer (controllers)
 */
@Module({
  imports: [
    CqrsModule, // Provides CommandBus and QueryBus
    DatabaseModule, // Provides ICarrierRepository
    CarrierDomainModule, // Provides domain services
  ],
  providers: [
    // Command Handlers
    ProcessCCFFileHandler,

    // Query Handlers
    GetCarriersQueryHandler,
    GetCarrierByIdQueryHandler,
    GetCarrierHistoryQueryHandler,
  ],
  exports: [
    CqrsModule, // Export CommandBus and QueryBus for controllers
  ],
})
export class CarrierApplicationModule {}
