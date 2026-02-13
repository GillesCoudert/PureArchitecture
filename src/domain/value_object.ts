/**
 * Abstract base class for Value Objects.
 * Value Objects are immutable objects that represent a value in the domain.
 * They have no identity, only equality by value.
 *
 * @template T - The type of the value being encapsulated
 */
export abstract class ValueObject<T> {
    /**
     * The encapsulated value.
     * Protected to prevent external mutation.
     */
    protected readonly value: T;

    /**
     * Creates a new ValueObject instance.
     * Validates the value immediately upon construction.
     *
     * @param value - The value to encapsulate
     * @throws If validation fails
     */
    constructor(value: T) {
        this.value = value;
        this.validate();
    }

    /**
     * Validates the value's invariants.
     * Must be implemented by subclasses to enforce domain rules.
     *
     * @throws If the value violates domain invariants
     */
    protected abstract validate(): void;

    /**
     * Returns the encapsulated value.
     *
     * @returns The value
     */
    getValue(): T {
        return this.value;
    }
}
