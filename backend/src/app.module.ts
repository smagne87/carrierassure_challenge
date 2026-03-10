// --- AI-ASSISTED ---
// Tool: Claude 4.5 Sonnet
// Prompt: "Update AppModule to import ConfigModule, DatabaseModule, and PresentationModule for complete application setup"
// Modifications: Added ConfigModule with global settings, imported DatabaseModule and PresentationModule
// --- END AI-ASSISTED ---

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './infrastructure/database/database.module.js';
import { PresentationModule } from './presentation/presentation.module.js';

/**
 * Root Application Module
 *
 * Orchestrates all application modules following Clean Architecture:
 * - ConfigModule: Environment configuration (global)
 * - DatabaseModule: Infrastructure layer (MongoDB)
 * - PresentationModule: Presentation layer (REST API)
 *
 * The module hierarchy enforces dependency direction:
 * - Presentation → Application → Domain ← Infrastructure
 * - Domain layer has NO dependencies on other layers
 */
@Module({
  imports: [
    // Global configuration module
    ConfigModule.forRoot({
      isGlobal: true, // Makes ConfigService available everywhere
      envFilePath: '.env',
      cache: true, // Cache environment variables for performance
    }),

    // Infrastructure layer
    DatabaseModule,

    // Presentation layer (includes Application layer)
    PresentationModule,
  ],
})
export class AppModule {}
