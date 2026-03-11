// --- AI-ASSISTED ---
// Tool: Claude 4.5 Sonnet
// Prompt: "Create E2E integration test for hash-based change detection proving zero recomputations on identical re-upload"
// Modifications: Added comprehensive test suite verifying hash detection optimization with multiple scenarios
// --- END AI-ASSISTED ---

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';

/**
 * E2E Integration Test: Hash-Based Change Detection
 *
 * This test suite verifies the core optimization requirement:
 * "Re-uploading the same file results in zero recomputations"
 *
 * Critical Requirements Tested:
 * 1. First upload processes all carriers (new)
 * 2. Second upload of identical file: unchanged=total, updated=0, new=0
 * 3. Partial changes only recompute changed records
 * 4. New carriers in second upload are processed
 */
describe('Hash-Based Change Detection (E2E)', () => {
  let app: INestApplication;
  let connection: Connection;

  // Sample CCF data
  const sampleCCF = [
    {
      carrier_id: 'MC-TEST-001',
      dot_number: 'TEST001',
      legal_name: 'Test Carrier One',
      safety_rating: 'Satisfactory',
      out_of_service_pct: 10.0,
      crash_total: 2,
      driver_oos_pct: 5.0,
      insurance_on_file: true,
      authority_status: 'Active',
      last_inspection_date: '2025-11-15',
      fleet_size: 50,
    },
    {
      carrier_id: 'MC-TEST-002',
      dot_number: 'TEST002',
      legal_name: 'Test Carrier Two',
      safety_rating: 'Conditional',
      out_of_service_pct: 25.0,
      crash_total: 5,
      driver_oos_pct: 15.0,
      insurance_on_file: true,
      authority_status: 'Active',
      last_inspection_date: '2025-10-20',
      fleet_size: 20,
    },
    {
      carrier_id: 'MC-TEST-003',
      dot_number: 'TEST003',
      legal_name: 'Test Carrier Three',
      safety_rating: 'Unsatisfactory',
      out_of_service_pct: 50.0,
      crash_total: 10,
      driver_oos_pct: 30.0,
      insurance_on_file: false,
      authority_status: 'Inactive',
      last_inspection_date: '2025-09-10',
      fleet_size: 10,
    },
  ];

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Apply same validation pipe as in main.ts
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );

    await app.init();

    // Get database connection for cleanup
    connection = moduleFixture.get<Connection>(getConnectionToken());
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Clean database before each test
    if (connection) {
      const collections = connection.collections;
      for (const key in collections) {
        await collections[key].deleteMany({});
      }
    }
  });

  describe('Zero Recomputation on Identical Re-upload', () => {
    it('should process all carriers on first upload', async () => {
      // Act: First upload
      const response = await request(app.getHttpServer())
        .post('/api/ccf/upload')
        .attach('file', Buffer.from(JSON.stringify(sampleCCF)), {
          filename: 'test.json',
          contentType: 'application/json',
        });

      // Assert
      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        total: 3,
        new: 3,
        unchanged: 0,
        updated: 0,
      });
      expect(response.body.correlationId).toBeDefined();
    });

    it('should result in ZERO recomputations on identical re-upload', async () => {
      // Arrange: First upload to populate database
      await request(app.getHttpServer())
        .post('/api/ccf/upload')
        .attach('file', Buffer.from(JSON.stringify(sampleCCF)), {
          filename: 'test.json',
          contentType: 'application/json',
        });

      // Act: Second upload of IDENTICAL file
      const response = await request(app.getHttpServer())
        .post('/api/ccf/upload')
        .attach('file', Buffer.from(JSON.stringify(sampleCCF)), {
          filename: 'test.json',
          contentType: 'application/json',
        });

      // Assert: All carriers unchanged, none updated or new
      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        total: 3,
        unchanged: 3, // All carriers detected as unchanged via hash
        updated: 0, // Zero recomputations
        new: 0, // No new carriers
      });
    });

    it('should verify carriers exist in database after first upload', async () => {
      // Arrange: Upload carriers
      await request(app.getHttpServer())
        .post('/api/ccf/upload')
        .attach('file', Buffer.from(JSON.stringify(sampleCCF)), {
          filename: 'test.json',
          contentType: 'application/json',
        });

      // Act: Query carriers
      const response = await request(app.getHttpServer()).get('/api/carriers');

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(3);
      expect(response.body[0]).toHaveProperty('carrierId');
      expect(response.body[0]).toHaveProperty('currentScore');
      expect(response.body[0]).toHaveProperty('legalName');
    });
  });

  describe('Partial Change Detection', () => {
    it('should only recompute changed carriers', async () => {
      // Arrange: First upload
      await request(app.getHttpServer())
        .post('/api/ccf/upload')
        .attach('file', Buffer.from(JSON.stringify(sampleCCF)), {
          filename: 'test.json',
          contentType: 'application/json',
        });

      // Act: Modify one carrier's crash_total
      const modifiedCCF = [...sampleCCF];
      modifiedCCF[0] = {
        ...modifiedCCF[0],
        crash_total: 3, // Changed from 2 to 3
      };

      const response = await request(app.getHttpServer())
        .post('/api/ccf/upload')
        .attach('file', Buffer.from(JSON.stringify(modifiedCCF)), {
          filename: 'test-modified.json',
          contentType: 'application/json',
        });

      // Assert: Only 1 carrier updated, 2 unchanged
      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        total: 3,
        unchanged: 2, // Two carriers unchanged
        updated: 1, // One carrier changed (MC-TEST-001)
        new: 0,
      });
    });

    it('should detect multiple changes', async () => {
      // Arrange: First upload
      await request(app.getHttpServer())
        .post('/api/ccf/upload')
        .attach('file', Buffer.from(JSON.stringify(sampleCCF)), {
          filename: 'test.json',
          contentType: 'application/json',
        });

      // Act: Modify two carriers
      const modifiedCCF = [...sampleCCF];
      modifiedCCF[0] = {
        ...modifiedCCF[0],
        safety_rating: 'Conditional', // Changed
      };
      modifiedCCF[1] = {
        ...modifiedCCF[1],
        insurance_on_file: false, // Changed
      };

      const response = await request(app.getHttpServer())
        .post('/api/ccf/upload')
        .attach('file', Buffer.from(JSON.stringify(modifiedCCF)), {
          filename: 'test-modified.json',
          contentType: 'application/json',
        });

      // Assert
      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        total: 3,
        unchanged: 1, // One carrier unchanged
        updated: 2, // Two carriers changed
        new: 0,
      });
    });

    it('should process new carriers in mixed upload', async () => {
      // Arrange: First upload with 3 carriers
      await request(app.getHttpServer())
        .post('/api/ccf/upload')
        .attach('file', Buffer.from(JSON.stringify(sampleCCF)), {
          filename: 'test.json',
          contentType: 'application/json',
        });

      // Act: Add 2 new carriers, modify 1 existing, keep 2 unchanged
      const mixedCCF = [
        ...sampleCCF.slice(0, 2), // First two unchanged
        {
          ...sampleCCF[2],
          fleet_size: 15, // Modified
        },
        {
          carrier_id: 'MC-TEST-004',
          dot_number: 'TEST004',
          legal_name: 'New Carrier Four',
          safety_rating: 'Satisfactory',
          out_of_service_pct: 5.0,
          crash_total: 1,
          driver_oos_pct: 2.0,
          insurance_on_file: true,
          authority_status: 'Active',
          last_inspection_date: '2025-12-01',
          fleet_size: 100,
        },
        {
          carrier_id: 'MC-TEST-005',
          dot_number: 'TEST005',
          legal_name: 'New Carrier Five',
          safety_rating: 'Satisfactory',
          out_of_service_pct: 8.0,
          crash_total: 2,
          driver_oos_pct: 4.0,
          insurance_on_file: true,
          authority_status: 'Active',
          last_inspection_date: '2025-11-28',
          fleet_size: 75,
        },
      ];

      const response = await request(app.getHttpServer())
        .post('/api/ccf/upload')
        .attach('file', Buffer.from(JSON.stringify(mixedCCF)), {
          filename: 'test-mixed.json',
          contentType: 'application/json',
        });

      // Assert
      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        total: 5,
        unchanged: 2, // First two unchanged
        updated: 1, // Third carrier modified
        new: 2, // Two new carriers
      });
    });
  });

  describe('Hash Consistency', () => {
    it('should generate same hash regardless of field order', async () => {
      // Arrange: Upload with specific field order
      const orderedCCF = [
        {
          carrier_id: 'MC-TEST-ORDER',
          dot_number: 'ORDER001',
          legal_name: 'Order Test',
          safety_rating: 'Satisfactory',
          out_of_service_pct: 10.0,
          crash_total: 2,
          driver_oos_pct: 5.0,
          insurance_on_file: true,
          authority_status: 'Active',
          last_inspection_date: '2025-11-15',
          fleet_size: 50,
        },
      ];

      await request(app.getHttpServer())
        .post('/api/ccf/upload')
        .attach('file', Buffer.from(JSON.stringify(orderedCCF)), {
          filename: 'ordered.json',
          contentType: 'application/json',
        });

      // Act: Upload same data with different field order
      const reorderedCCF = [
        {
          fleet_size: 50,
          last_inspection_date: '2025-11-15',
          authority_status: 'Active',
          insurance_on_file: true,
          driver_oos_pct: 5.0,
          crash_total: 2,
          out_of_service_pct: 10.0,
          safety_rating: 'Satisfactory',
          legal_name: 'Order Test',
          dot_number: 'ORDER001',
          carrier_id: 'MC-TEST-ORDER',
        },
      ];

      const response = await request(app.getHttpServer())
        .post('/api/ccf/upload')
        .attach('file', Buffer.from(JSON.stringify(reorderedCCF)), {
          filename: 'reordered.json',
          contentType: 'application/json',
        });

      // Assert: Should detect as unchanged due to canonical hashing
      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        total: 1,
        unchanged: 1, // Hash matches despite different field order
        updated: 0,
        new: 0,
      });
    });
  });

  describe('Performance Validation', () => {
    it('should handle large file efficiently', async () => {
      // Arrange: Create 100-carrier file
      const largeCCF = Array.from({ length: 100 }, (_, i) => ({
        carrier_id: `MC-PERF-${String(i + 1).padStart(3, '0')}`,
        dot_number: `PERF${String(i + 1).padStart(6, '0')}`,
        legal_name: `Performance Test Carrier ${i + 1}`,
        safety_rating: 'Satisfactory',
        out_of_service_pct: Math.random() * 20,
        crash_total: Math.floor(Math.random() * 5),
        driver_oos_pct: Math.random() * 10,
        insurance_on_file: true,
        authority_status: 'Active',
        last_inspection_date: '2025-11-15',
        fleet_size: Math.floor(Math.random() * 200) + 10,
      }));

      // Act: First upload
      const start1 = Date.now();
      const response1 = await request(app.getHttpServer())
        .post('/api/ccf/upload')
        .attach('file', Buffer.from(JSON.stringify(largeCCF)), {
          filename: 'large.json',
          contentType: 'application/json',
        });
      const duration1 = Date.now() - start1;

      // Assert first upload
      expect(response1.body.total).toBe(100);
      expect(response1.body.new).toBe(100);

      // Act: Second upload (identical)
      const start2 = Date.now();
      const response2 = await request(app.getHttpServer())
        .post('/api/ccf/upload')
        .attach('file', Buffer.from(JSON.stringify(largeCCF)), {
          filename: 'large.json',
          contentType: 'application/json',
        });
      const duration2 = Date.now() - start2;

      // Assert second upload
      expect(response2.body.total).toBe(100);
      expect(response2.body.unchanged).toBe(100);
      expect(response2.body.updated).toBe(0);

      // Performance assertion: Second upload should be significantly faster
      // (hash comparison vs full processing)
      console.log(
        `First upload: ${duration1}ms, Second upload: ${duration2}ms`,
      );
      console.log(`Speedup: ${(duration1 / duration2).toFixed(2)}x faster`);

      // Second upload should be faster (though exact timing varies by environment)
      expect(duration2).toBeLessThanOrEqual(duration1);
    });
  });
});
