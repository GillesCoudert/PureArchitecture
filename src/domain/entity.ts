/**
 * Base interface for all domain entities.
 *
 * An entity is an object with a unique identifier that persists across time
 * and state changes. Entities are distinguished by their identity, not their values.
 * Two entities are equal if they have the same ID, regardless of their attributes.
 *
 * @template TId - The type of the entity's identifier (defaults to string)
 *
 * @example
 * ```typescript
 * interface User extends Entity<string> {
 *   id: string;
 *   name: string;
 *   email: string;
 * }
 *
 * interface Product extends Entity<UUID> {
 *   id: UUID;
 *   name: string;
 *   price: Money;
 * }
 * ```
 */
export interface Entity<TId = string> {
    /**
     * The unique identifier for this entity.
     * This ID persists throughout the entity's lifetime.
     */
    id: TId;
}
