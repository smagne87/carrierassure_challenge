// --- AI-ASSISTED ---
// Tool: Claude 4.5 Sonnet
// Prompt: "Update main.ts to enable global validation, CORS, and Swagger documentation"
// Modifications: Added ValidationPipe, CORS configuration, Swagger setup
// --- END AI-ASSISTED ---

import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule);

  // Enable CORS
  const corsOrigins = process.env.CORS_ORIGINS?.split(',') || [
    'http://localhost:3000',
  ];
  app.enableCors({
    origin: corsOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  logger.log(`CORS enabled for origins: ${corsOrigins.join(', ')}`);

  // Enable global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip properties not in DTO
      forbidNonWhitelisted: true, // Throw error if unknown properties
      transform: true, // Auto-transform payloads to DTO instances
      transformOptions: {
        enableImplicitConversion: true, // Enable type conversion
      },
    }),
  );
  logger.log('Global validation pipe enabled');

  // Setup Swagger/OpenAPI documentation
  const config = new DocumentBuilder()
    .setTitle('Carrier Scoring Service API')
    .setDescription(
      'API for processing Carrier Compliance Files (CCF) and querying carrier safety scores. ' +
        'Features hash-based change detection for optimized re-processing.',
    )
    .setVersion('1.0')
    .addTag('Carriers', 'Carrier operations')
    .addTag('Health', 'Health check endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
  logger.log('Swagger documentation available at /api/docs');

  // Start server
  const port = process.env.PORT || 3001;
  await app.listen(port);

  logger.log(`Application is running on: http://localhost:${port}`);
  logger.log(`Swagger UI: http://localhost:${port}/api/docs`);
  logger.log(`Health check: http://localhost:${port}/api/health`);
}

bootstrap().catch((error) => {
  const logger = new Logger('Bootstrap');
  logger.error('Failed to start application', error);
  process.exit(1);
});
