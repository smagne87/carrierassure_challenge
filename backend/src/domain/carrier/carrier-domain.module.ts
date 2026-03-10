// --- AI-ASSISTED ---
// Tool: Claude 4.5 Sonnet
// Prompt: "Create a NestJS module to provide domain services for dependency injection"
// Modifications: Added providers for HashGeneratorDomainService and ScoringDomainService
// --- END AI-ASSISTED ---

import { Module } from '@nestjs/common';
import { HashGeneratorDomainService } from './services/hash-generator.domain-service.js';
import { ScoringDomainService } from './services/scoring.domain-service.js';

/**
 * Carrier Domain Module
 *
 * This module provides domain services for dependency injection.
 *
 * Domain Services (stateless business logic):
 * - HashGeneratorDomainService: SHA-256 hash generation with canonical JSON
 * - ScoringDomainService: Composite score calculation from 6 weighted factors
 *
 * These services are pure business logic with no infrastructure dependencies.
 * They can be injected into:
 * - Application Layer (command/query handlers)
 * - Domain Entities (via method parameters)
 *
 * Design Note:
 * - Domain services are @Injectable() to work with NestJS DI
 * - But they remain pure domain logic (no HTTP, DB, or framework-specific code)
 * - This allows testing without mocking framework dependencies
 */
@Module({
  providers: [HashGeneratorDomainService, ScoringDomainService],
  exports: [HashGeneratorDomainService, ScoringDomainService],
})
export class CarrierDomainModule {}
