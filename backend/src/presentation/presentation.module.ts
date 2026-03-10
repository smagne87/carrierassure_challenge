// --- AI-ASSISTED ---
// Tool: Claude 4.5 Sonnet
// Prompt: "Create NestJS presentation module aggregating all controllers"
// Modifications: Added CarrierApplicationModule import, registered controllers
// --- END AI-ASSISTED ---

import { Module } from '@nestjs/common';
import { CarrierApplicationModule } from '../application/carrier/carrier-application.module.js';
import { CarrierController } from './carrier/carrier.controller.js';
import { HealthController } from './health/health.controller.js';

/**
 * Presentation Module
 *
 * This module represents the Presentation Layer in Clean Architecture.
 *
 * Responsibilities:
 * - Expose HTTP REST API endpoints
 * - Handle request/response transformations (DTOs)
 * - Validate incoming requests
 * - Provide Swagger/OpenAPI documentation
 *
 * Controllers:
 * - CarrierController: Carrier operations (upload, query)
 * - HealthController: Health check endpoint
 *
 * Dependencies:
 * - CarrierApplicationModule: Provides CommandBus and QueryBus
 */
@Module({
  imports: [CarrierApplicationModule],
  controllers: [CarrierController, HealthController],
})
export class PresentationModule {}
