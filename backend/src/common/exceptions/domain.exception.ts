// --- AI-ASSISTED ---
// Tool: Claude 4.5 Sonnet
// Prompt: "Create custom exception classes for domain layer errors"
// Modifications: Added specific exception types for validation and business rules
// --- END AI-ASSISTED ---

/**
 * Base exception for all domain-related errors.
 * Domain exceptions represent violations of business rules or invariants.
 */
export class DomainException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DomainException';
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Exception thrown when domain validation fails.
 * Used by Value Objects when invalid data is provided at construction.
 */
export class ValidationException extends DomainException {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationException';
  }
}

/**
 * Exception thrown when a business rule is violated.
 * Represents invariant violations in the domain model.
 */
export class BusinessRuleException extends DomainException {
  constructor(message: string) {
    super(message);
    this.name = 'BusinessRuleException';
  }
}

/**
 * Exception thrown when an entity is not found.
 * Used by application layer when querying for non-existent entities.
 */
export class EntityNotFoundException extends DomainException {
  constructor(entityName: string, identifier: string) {
    super(`${entityName} with identifier ${identifier} not found`);
    this.name = 'EntityNotFoundException';
  }
}
