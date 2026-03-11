// --- AI-ASSISTED ---
// Tool: Claude 4.5 Sonnet
// Prompt: "Create a NestJS database module configuring MongoDB with Mongoose and providing repository"
// Modifications: Added async configuration, connection options, repository provider with DI token
// --- END AI-ASSISTED ---

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Connection } from 'mongoose';
import {
  CarrierDocument,
  CarrierSchema,
} from './mongodb/schemas/carrier.schema.js';
import { CarrierRepository } from './mongodb/repositories/carrier.repository.js';
import { CARRIER_REPOSITORY } from '../../domain/carrier/repositories/carrier.repository.interface.js';

/**
 * Database Module - Infrastructure Layer
 *
 * Responsibilities:
 * - Configure MongoDB connection via Mongoose
 * - Register database schemas
 * - Provide repository implementations
 *
 * This module:
 * - Uses ConfigService for environment-based configuration
 * - Registers CarrierDocument schema with Mongoose
 * - Provides CarrierRepository as implementation of ICarrierRepository
 * - Exports repository for use in Application Layer
 *
 * Design Pattern: Dependency Injection
 * - Uses CARRIER_REPOSITORY symbol as injection token
 * - Application layer depends on symbol, not concrete class
 * - Enables swapping implementations without changing consumers
 */
@Module({
  imports: [
    // Configure MongoDB connection asynchronously
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>(
          'MONGODB_URI',
          'mongodb://localhost:27017/carrier-scoring',
        ),
        retryAttempts: 3,
        retryDelay: 1000,
        connectionFactory: (connection: Connection) => {
          // Log successful connection
          connection.on('connected', () => {
            console.log('MongoDB connected successfully');
          });

          // Log connection errors
          connection.on('error', (error: Error) => {
            console.error('MongoDB connection error:', error);
          });

          // Log disconnection
          connection.on('disconnected', () => {
            console.log('MongoDB disconnected');
          });

          return connection;
        },
      }),
      inject: [ConfigService],
    }),

    // Register Carrier schema for dependency injection
    MongooseModule.forFeature([
      {
        name: CarrierDocument.name,
        schema: CarrierSchema,
      },
    ]),
  ],
  providers: [
    // Provide CarrierRepository as implementation of ICarrierRepository
    // Using custom injection token for abstraction
    {
      provide: CARRIER_REPOSITORY,
      useClass: CarrierRepository,
    },
  ],
  exports: [
    // Export repository for use in Application Layer
    CARRIER_REPOSITORY,
  ],
})
export class DatabaseModule {}
