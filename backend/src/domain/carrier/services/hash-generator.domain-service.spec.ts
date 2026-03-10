// --- AI-ASSISTED ---
// Tool: Claude 4.5 Sonnet
// Prompt: "Create unit tests for HashGeneratorDomainService verifying canonical JSON hashing and key ordering invariance"
// Modifications: Added tests for SHA-256 correctness, key ordering, null handling, and hash consistency
// --- END AI-ASSISTED ---

import { HashGeneratorDomainService } from './hash-generator.domain-service.js';
import { CarrierHash } from '../value-objects/carrier-hash.vo.js';

describe('HashGeneratorDomainService', () => {
  let service: HashGeneratorDomainService;

  beforeEach(() => {
    service = new HashGeneratorDomainService();
  });

  describe('generateHash', () => {
    it('should generate SHA-256 hash for simple object', () => {
      // Arrange
      const data = { name: 'test', value: 123 };

      // Act
      const hash = service.generateHash(data);

      // Assert
      expect(hash).toBeInstanceOf(CarrierHash);
      expect(hash.value).toMatch(/^[a-f0-9]{64}$/); // SHA-256 format
      expect(hash.value.length).toBe(64); // SHA-256 produces 64 hex characters
    });

    it('should generate same hash for identical data', () => {
      // Arrange
      const data1 = { carrier_id: 'MC-123', dot_number: '456' };
      const data2 = { carrier_id: 'MC-123', dot_number: '456' };

      // Act
      const hash1 = service.generateHash(data1);
      const hash2 = service.generateHash(data2);

      // Assert
      expect(hash1.equals(hash2)).toBe(true);
      expect(hash1.value).toBe(hash2.value);
    });

    it('should generate different hash for different data', () => {
      // Arrange
      const data1 = { carrier_id: 'MC-123' };
      const data2 = { carrier_id: 'MC-456' };

      // Act
      const hash1 = service.generateHash(data1);
      const hash2 = service.generateHash(data2);

      // Assert
      expect(hash1.equals(hash2)).toBe(false);
      expect(hash1.value).not.toBe(hash2.value);
    });

    it('should generate same hash regardless of key order (canonical JSON)', () => {
      // Arrange
      const data1 = {
        carrier_id: 'MC-123',
        dot_number: '456',
        legal_name: 'Test LLC',
        fleet_size: 10,
      };

      const data2 = {
        fleet_size: 10,
        legal_name: 'Test LLC',
        carrier_id: 'MC-123',
        dot_number: '456',
      };

      // Act
      const hash1 = service.generateHash(data1);
      const hash2 = service.generateHash(data2);

      // Assert
      expect(hash1.equals(hash2)).toBe(true);
      expect(hash1.value).toBe(hash2.value);
    });

    it('should handle null values consistently', () => {
      // Arrange
      const data1 = { name: 'test', value: null };
      const data2 = { name: 'test', value: null };

      // Act
      const hash1 = service.generateHash(data1);
      const hash2 = service.generateHash(data2);

      // Assert
      expect(hash1.equals(hash2)).toBe(true);
    });

    it('should handle undefined values consistently', () => {
      // Arrange
      const data1 = { name: 'test', value: undefined };
      const data2 = { name: 'test', value: undefined };

      // Act
      const hash1 = service.generateHash(data1);
      const hash2 = service.generateHash(data2);

      // Assert
      expect(hash1.equals(hash2)).toBe(true);
    });

    it('should handle boolean values correctly', () => {
      // Arrange
      const data1 = { insurance_on_file: true };
      const data2 = { insurance_on_file: false };

      // Act
      const hash1 = service.generateHash(data1);
      const hash2 = service.generateHash(data2);

      // Assert
      expect(hash1.equals(hash2)).toBe(false);
    });

    it('should handle number values with different types (int vs float)', () => {
      // Arrange
      const data1 = { value: 10 };
      const data2 = { value: 10.0 };

      // Act
      const hash1 = service.generateHash(data1);
      const hash2 = service.generateHash(data2);

      // Assert
      expect(hash1.equals(hash2)).toBe(true); // JavaScript treats 10 and 10.0 as same
    });

    it('should handle decimal numbers with precision', () => {
      // Arrange
      const data1 = { out_of_service_pct: 12.5 };
      const data2 = { out_of_service_pct: 12.5 };
      const data3 = { out_of_service_pct: 12.51 };

      // Act
      const hash1 = service.generateHash(data1);
      const hash2 = service.generateHash(data2);
      const hash3 = service.generateHash(data3);

      // Assert
      expect(hash1.equals(hash2)).toBe(true);
      expect(hash1.equals(hash3)).toBe(false);
    });

    it('should handle nested objects with key ordering', () => {
      // Arrange
      const data1 = {
        carrier: {
          id: '123',
          name: 'Test',
          score: { total: 100, breakdown: { a: 1, b: 2 } },
        },
      };

      const data2 = {
        carrier: {
          score: { breakdown: { b: 2, a: 1 }, total: 100 },
          name: 'Test',
          id: '123',
        },
      };

      // Act
      const hash1 = service.generateHash(data1);
      const hash2 = service.generateHash(data2);

      // Assert
      expect(hash1.equals(hash2)).toBe(true);
    });

    it('should handle arrays consistently', () => {
      // Arrange
      const data1 = { items: [1, 2, 3] };
      const data2 = { items: [1, 2, 3] };
      const data3 = { items: [3, 2, 1] }; // Different order

      // Act
      const hash1 = service.generateHash(data1);
      const hash2 = service.generateHash(data2);
      const hash3 = service.generateHash(data3);

      // Assert
      expect(hash1.equals(hash2)).toBe(true);
      expect(hash1.equals(hash3)).toBe(false); // Array order matters
    });

    it('should handle empty object', () => {
      // Arrange
      const data = {};

      // Act
      const hash = service.generateHash(data);

      // Assert
      expect(hash).toBeInstanceOf(CarrierHash);
      expect(hash.value).toMatch(/^[a-f0-9]{64}$/);
    });

    it('should handle real CCF data structure', () => {
      // Arrange
      const ccfData = {
        carrier_id: 'MC-123456',
        dot_number: '1234567',
        legal_name: 'Reliable Freight LLC',
        safety_rating: 'Satisfactory',
        out_of_service_pct: 12.5,
        crash_total: 2,
        driver_oos_pct: 5.3,
        insurance_on_file: true,
        authority_status: 'Active',
        last_inspection_date: '2025-11-15',
        fleet_size: 45,
      };

      // Act
      const hash = service.generateHash(ccfData);

      // Assert
      expect(hash).toBeInstanceOf(CarrierHash);
      expect(hash.value).toMatch(/^[a-f0-9]{64}$/);
    });

    it('should generate different hash for small data change', () => {
      // Arrange
      const data1 = {
        carrier_id: 'MC-123',
        crash_total: 2,
      };

      const data2 = {
        carrier_id: 'MC-123',
        crash_total: 3, // Changed from 2 to 3
      };

      // Act
      const hash1 = service.generateHash(data1);
      const hash2 = service.generateHash(data2);

      // Assert
      expect(hash1.equals(hash2)).toBe(false);
    });
  });

  describe('areEqual', () => {
    it('should return true for identical objects', () => {
      // Arrange
      const data1 = { carrier_id: 'MC-123', name: 'Test' };
      const data2 = { carrier_id: 'MC-123', name: 'Test' };

      // Act
      const result = service.areEqual(data1, data2);

      // Assert
      expect(result).toBe(true);
    });

    it('should return true for objects with different key order', () => {
      // Arrange
      const data1 = { a: 1, b: 2, c: 3 };
      const data2 = { c: 3, b: 2, a: 1 };

      // Act
      const result = service.areEqual(data1, data2);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false for different objects', () => {
      // Arrange
      const data1 = { carrier_id: 'MC-123' };
      const data2 = { carrier_id: 'MC-456' };

      // Act
      const result = service.areEqual(data1, data2);

      // Assert
      expect(result).toBe(false);
    });

    it('should handle complex nested objects', () => {
      // Arrange
      const data1 = {
        carrier: {
          id: '123',
          metadata: {
            score: 100,
            breakdown: { a: 1, b: 2 },
          },
        },
      };

      const data2 = {
        carrier: {
          metadata: {
            breakdown: { b: 2, a: 1 },
            score: 100,
          },
          id: '123',
        },
      };

      // Act
      const result = service.areEqual(data1, data2);

      // Assert
      expect(result).toBe(true);
    });
  });

  describe('Canonical JSON Consistency', () => {
    it('should always sort keys alphabetically', () => {
      // Arrange
      const variations = [
        { z: 1, y: 2, x: 3, a: 4, b: 5 },
        { a: 4, b: 5, x: 3, y: 2, z: 1 },
        { b: 5, z: 1, a: 4, x: 3, y: 2 },
      ];

      // Act
      const hashes = variations.map((data) => service.generateHash(data));

      // Assert
      expect(hashes[0].equals(hashes[1])).toBe(true);
      expect(hashes[1].equals(hashes[2])).toBe(true);
      expect(hashes[0].equals(hashes[2])).toBe(true);
    });

    it('should handle deeply nested objects with key reordering', () => {
      // Arrange
      const data1 = {
        level1: {
          z: 'last',
          a: 'first',
          level2: {
            y: 'penultimate',
            b: 'second',
          },
        },
      };

      const data2 = {
        level1: {
          level2: {
            b: 'second',
            y: 'penultimate',
          },
          a: 'first',
          z: 'last',
        },
      };

      // Act
      const hash1 = service.generateHash(data1);
      const hash2 = service.generateHash(data2);

      // Assert
      expect(hash1.equals(hash2)).toBe(true);
    });

    it('should produce deterministic hashes across multiple calls', () => {
      // Arrange
      const data = {
        carrier_id: 'MC-123',
        dot_number: '456',
        fleet_size: 10,
      };

      // Act
      const hashes = Array.from({ length: 10 }, () =>
        service.generateHash(data),
      );

      // Assert
      const firstHash = hashes[0].value;
      hashes.forEach((hash) => {
        expect(hash.value).toBe(firstHash);
      });
    });
  });
});
