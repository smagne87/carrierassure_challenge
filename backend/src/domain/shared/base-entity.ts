// --- AI-ASSISTED ---
// Tool: Claude 4.5 Sonnet
// Prompt: "Create a base entity class for DDD with identity equality"
// Modifications: Added TypeScript generics for ID type, abstract methods
// --- END AI-ASSISTED ---

/**
 * Base class for all Entities in the domain.
 * Entities are identified by a unique identifier and compared by identity.
 *
 * Key Characteristics:
 * - Identity: Each entity has a unique identifier
 * - Mutable: Entity state can change over time
 * - Identity equality: Two entities are equal if they have the same ID
 *
 * @abstract
 */
export abstract class BaseEntity<T> {
  /**
   * Compares this entity with another for equality based on identity.
   * Two entities are equal if they have the same ID and are of the same type.
   *
   * @param other The other entity to compare with
   * @returns true if both entities have the same identity, false otherwise
   */
  public equals(other: BaseEntity<T>): boolean {
    if (other == null || other == undefined) {
      return false;
    }

    if (this === other) {
      return true;
    }

    if (this.constructor !== other.constructor) {
      return false;
    }

    return this.getId() === other.getId();
  }

  /**
   * Returns the unique identifier for this entity.
   * Subclasses must implement this method.
   */
  protected abstract getId(): T;
}
