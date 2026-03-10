// --- AI-ASSISTED ---
// Tool: Claude 4.5 Sonnet
// Prompt: "Create a base Value Object class for DDD implementation with equality comparison"
// Modifications: Added TypeScript strict typing, abstract methods for equality components
// --- END AI-ASSISTED ---

/**
 * Base class for all Value Objects in the domain.
 * Value Objects are immutable and compared by value rather than identity.
 *
 * Key Characteristics:
 * - Immutable: Once created, state cannot change
 * - Value equality: Two VOs are equal if all their components are equal
 * - Self-validating: Validation happens at construction time
 *
 * @abstract
 */
export abstract class BaseValueObject {
  /**
   * Returns the components that define equality for this value object.
   * Subclasses must implement this method to return an array of values
   * that should be compared for equality.
   *
   * @returns Array of values that define equality
   */
  protected abstract getEqualityComponents(): any[];

  /**
   * Compares this value object with another for equality.
   * Two value objects are equal if all their equality components are equal.
   *
   * @param other The other value object to compare with
   * @returns true if both value objects are equal, false otherwise
   */
  public equals(other: BaseValueObject): boolean {
    if (other == null || other == undefined) {
      return false;
    }

    if (this.constructor !== other.constructor) {
      return false;
    }

    const thisComponents = this.getEqualityComponents();
    const otherComponents = other.getEqualityComponents();

    if (thisComponents.length !== otherComponents.length) {
      return false;
    }

    return thisComponents.every((component, index) => {
      return this.deepEquals(component, otherComponents[index]);
    });
  }

  /**
   * Deep equality comparison for complex objects
   */
  private deepEquals(a: any, b: any): boolean {
    if (a === b) {
      return true;
    }

    if (a == null || b == null) {
      return a === b;
    }

    if (typeof a !== typeof b) {
      return false;
    }

    if (a instanceof Date && b instanceof Date) {
      return a.getTime() === b.getTime();
    }

    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) {
        return false;
      }
      return a.every((item, index) => this.deepEquals(item, b[index]));
    }

    if (typeof a === 'object') {
      const keysA = Object.keys(a);
      const keysB = Object.keys(b);

      if (keysA.length !== keysB.length) {
        return false;
      }

      return keysA.every((key) => this.deepEquals(a[key], b[key]));
    }

    return false;
  }
}
