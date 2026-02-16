/**
 * Generic interface for mapping/transforming between two types.
 *
 * Used for converting objects from one domain to another (e.g., Entity ↔ DTO, Domain ↔ API responses).
 * Keeps the application layer independent of specific mapping libraries and implementations.
 *
 * This interface is intentionally generic to support any mapping scenario:
 * - Entity to DTO (read operations)
 * - DTO to Entity (write operations)
 * - Domain object to API response format
 * - API request to domain commands
 * - And many other transformation scenarios
 *
 * For reverse mapping (Target → Source), create a separate mapper with swapped type parameters.
 *
 * @template TSource - The source type to map from
 * @template TTarget - The target type to map to
 *
 * @example
 * ```typescript
 * // Entity to DTO mapper
 * class UserToUserDtoMapper implements Mapper<User, UserDto> {
 *   to(user: User): UserDto {
 *     return {
 *       id: user.id,
 *       name: user.name,
 *       email: user.email,
 *     };
 *   }
 *
 *   toMany(users: User[]): UserDto[] {
 *     return users.map(user => this.to(user));
 *   }
 * }
 *
 * // Reverse mapper
 * class UserDtoToUserMapper implements Mapper<UserDto, User> {
 *   to(dto: UserDto): User {
 *     return new User(dto.id, dto.name, dto.email);
 *   }
 *
 *   toMany(dtos: UserDto[]): User[] {
 *     return dtos.map(dto => this.to(dto));
 *   }
 * }
 * ```
 */
export interface Mapper<TSource, TTarget> {
    /**
     * Map a single source object to target type.
     *
     * @param source - The source object to map
     * @returns The mapped target object
     * @throws May throw if source is invalid or mapping fails
     */
    to(source: TSource): TTarget;

    /**
     * Map multiple source objects to target type.
     *
     * Convenience method for batch mapping operations.
     * May be optimized for bulk operations in implementations.
     *
     * @param sources - The source objects to map
     * @returns An array of mapped target objects in the same order
     * @throws May throw if any source is invalid or mapping fails
     */
    toMany(sources: TSource[]): TTarget[];
}
