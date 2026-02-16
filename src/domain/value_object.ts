/**
 * Interface for Value Objects.
 *
 * Value Objects are immutable domain objects that have no identity.
 * They represent a value or concept with equality defined by their content,
 * not by an ID. Two Value Objects are equal if all their encapsulated values are equal.
 *
 * Key characteristics:
 * - Immutable: Cannot be changed after creation
 * - No identity: Two instances with identical values are indistinguishable
 * - Self-validating: Encapsulate validation rules for the value
 * - Rich behavior: Can have methods to compute derived values
 *
 * @template T - The type of the value being encapsulated
 *
 * @example
 * ```typescript
 * class Money implements ValueObject<{ amount: number; currency: string }> {
 *   constructor(private amount: number, private currency: string) {}
 *
 *   getValue() {
 *     return { amount: this.amount, currency: this.currency };
 *   }
 *
 *   add(other: Money): Money {
 *     if (this.currency !== other.currency) {
 *       throw new Error('Cannot add different currencies');
 *     }
 *     return new Money(this.amount + other.getValue().amount, this.currency);
 *   }
 * }
 * ```
 */
export interface ValueObject<T> {
    /**
     * Returns the encapsulated value.
     *
     * The returned value represents the domain concept this Value Object represents.
     * It should be immutable or treated as immutable by callers.
     *
     * @returns The encapsulated value
     */
    getValue(): T;
}
