/**
 * Generic interface for mapping between two types.
 * To be implemented in the infrastructure/presentation layer.
 * This keeps the application layer independent of specific mapping libraries.
 * Can be used for: Entity -> DTO, DTO -> API Response, etc.
 *
 * For reverse mapping, use Mapper<TTarget, TSource>
 *
 * @template TSource - The source type
 * @template TTarget - The target type
 */
export interface Mapper<TSource, TTarget> {
    /**
     * Convert source to target
     * @param source - The source object to convert
     * @returns The corresponding target object
     */
    to(source: TSource): TTarget;

    /**
     * Convert a list of sources to targets
     * @param sources - The source objects to convert
     * @returns The corresponding target objects
     */
    toMany(sources: TSource[]): TTarget[];
}
