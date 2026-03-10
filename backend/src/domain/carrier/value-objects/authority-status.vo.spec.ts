// --- AI-ASSISTED ---
// Tool: Claude 4.5 Sonnet
// Prompt: "Create unit tests for AuthorityStatus value object with validation and scoring"
// Modifications: Added tests for all valid enum values, validation errors, and score mapping
// --- END AI-ASSISTED ---

import {
  AuthorityStatus,
  AuthorityStatusValue,
} from './authority-status.vo.js';
import { ValidationException } from '../../../common/exceptions/domain.exception.js';

describe('AuthorityStatus', () => {
  describe('create', () => {
    it('should create Active status', () => {
      // Act
      const status = AuthorityStatus.create('Active');

      // Assert
      expect(status).toBeInstanceOf(AuthorityStatus);
      expect(status.value).toBe(AuthorityStatusValue.ACTIVE);
    });

    it('should create Inactive status', () => {
      // Act
      const status = AuthorityStatus.create('Inactive');

      // Assert
      expect(status).toBeInstanceOf(AuthorityStatus);
      expect(status.value).toBe(AuthorityStatusValue.INACTIVE);
    });

    it('should create Revoked status', () => {
      // Act
      const status = AuthorityStatus.create('Revoked');

      // Assert
      expect(status).toBeInstanceOf(AuthorityStatus);
      expect(status.value).toBe(AuthorityStatusValue.REVOKED);
    });

    it('should be case-sensitive (require exact casing)', () => {
      // Act & Assert
      expect(() => AuthorityStatus.create('active')).toThrow(
        ValidationException,
      );
      expect(() => AuthorityStatus.create('INACTIVE')).toThrow(
        ValidationException,
      );
      expect(() => AuthorityStatus.create('ReVoKeD')).toThrow(
        ValidationException,
      );
    });

    it('should trim whitespace', () => {
      // Act & Assert
      expect(() => AuthorityStatus.create('  Active  ')).not.toThrow();
      const status = AuthorityStatus.create('  Inactive  ');
      expect(status.value).toBe(AuthorityStatusValue.INACTIVE);
    });

    it('should throw ValidationException for invalid status', () => {
      // Act & Assert
      expect(() => AuthorityStatus.create('Invalid')).toThrow(
        ValidationException,
      );
      expect(() => AuthorityStatus.create('Pending')).toThrow(
        ValidationException,
      );
      expect(() => AuthorityStatus.create('')).toThrow(ValidationException);
    });

    it('should throw ValidationException for null or undefined', () => {
      // Act & Assert
      expect(() => AuthorityStatus.create(null as any)).toThrow(
        ValidationException,
      );
      expect(() => AuthorityStatus.create(undefined as any)).toThrow(
        ValidationException,
      );
    });
  });

  describe('getScore', () => {
    it('should return 100 for Active', () => {
      // Arrange
      const status = AuthorityStatus.create('Active');

      // Act
      const score = status.getScore();

      // Assert
      expect(score).toBe(100);
    });

    it('should return 50 for Inactive', () => {
      // Arrange
      const status = AuthorityStatus.create('Inactive');

      // Act
      const score = status.getScore();

      // Assert
      expect(score).toBe(50);
    });

    it('should return 0 for Revoked', () => {
      // Arrange
      const status = AuthorityStatus.create('Revoked');

      // Act
      const score = status.getScore();

      // Assert
      expect(score).toBe(0);
    });
  });

  describe('equals', () => {
    it('should return true for same status', () => {
      // Arrange
      const status1 = AuthorityStatus.create('Active');
      const status2 = AuthorityStatus.create('Active');

      // Act & Assert
      expect(status1.equals(status2)).toBe(true);
    });

    it('should return false for different statuses', () => {
      // Arrange
      const status1 = AuthorityStatus.create('Active');
      const status2 = AuthorityStatus.create('Inactive');

      // Act & Assert
      expect(status1.equals(status2)).toBe(false);
    });

    it('should compare values (case-sensitive)', () => {
      // Arrange
      const status1 = AuthorityStatus.create('Active');
      const status2 = AuthorityStatus.create('Active');

      // Act & Assert
      expect(status1.equals(status2)).toBe(true);
    });
  });

  describe('toString', () => {
    it('should return string representation', () => {
      // Arrange
      const status = AuthorityStatus.create('Inactive');

      // Act
      const str = status.toString();

      // Assert
      expect(str).toBe('Inactive');
    });
  });

  describe('immutability', () => {
    it('should not allow modification of value', () => {
      // Arrange
      const status = AuthorityStatus.create('Active');

      // Act & Assert
      expect(() => {
        (status as any).value = AuthorityStatusValue.REVOKED;
      }).toThrow();
    });
  });
});
