/**
 * Base interface for all domain entities.
 * An entity is an object with a unique identifier.
 *
 * @template TId - The type of the entity's identifier
 */
export interface Entity<TId = string> {
    /**
     * The unique identifier for this entity.
     */
    id: TId;
}
