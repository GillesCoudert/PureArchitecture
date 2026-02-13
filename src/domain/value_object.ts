/**
 * Interface for Value Objects.
 * Value Objects are immutable objects that represent a value in the domain.
 * They have no identity, only equality by value.
 *
 * @template T - The type of the value being encapsulated
 */
export interface ValueObject<T> {
    /**
     * Returns the encapsulated value.
     *
     * @returns The value
     */
    getValue(): T;
}
