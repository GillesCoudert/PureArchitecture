import { ResultAsync } from '@gilles-coudert/pure-trace';
import { PureParameters } from '../../common/parameters';
import { PageResult } from '../../common/page_result';
import { Requester } from '../../common/requester';

/**
 * Entity data without system-managed fields.
 *
 * Excludes read-only system fields that are typically managed by the persistence layer:
 * - `id`: Entity identifier (assigned by repository)
 * - `createdAt`: Timestamp (set by repository on creation)
 * - `updatedAt`: Timestamp (updated by repository on each change)
 * - `removedAt`: Soft delete timestamp (managed by repository)
 *
 * @template TEntity - The full entity type
 */
export type EntityData<TEntity> = Omit<
    TEntity,
    'id' | 'createdAt' | 'updatedAt' | 'removedAt'
>;

/**
 * Command for creating a new entity with typed data.
 *
 * @template TRequester - The requester performing the creation
 * @template TEntity - The entity type being created
 */
export interface CreateCommand<TRequester extends Requester, TEntity> {
    /** The requester/actor performing the creation */
    requester: TRequester;
    /** The entity data to create (excludes system-managed fields) */
    data: EntityData<TEntity>;
}

/**
 * Query for finding all entities with advanced options.
 *
 * Supports pagination, filtering, sorting, and preset configurations for flexible and efficient queries.
 *
 * @template TRequester - The requester performing the query
 */
export interface FindAllQuery<TRequester extends Requester> {
    /** The requester/actor performing the query */
    requester: TRequester;
    /**
     * The page number for pagination (1-based).
     * Omit or undefined for no pagination.
     */
    pageNumber?: number;
    /**
     * The number of items per page for pagination.
     * Only used if `pageNumber` is specified.
     */
    pageSize?: number;
    /**
     * Optional filter string using a query language.
     * Format depends on the repository implementation (e.g., OData, MongoDB query, SQL WHERE clause).
     *
     * @example
     * ```
     * filter: "name eq 'John' and age gt 18"
     * ```
     */
    filter?: string;
    /**
     * Optional sort string defining the result ordering.
     * Format depends on the repository implementation (e.g., "name asc, createdAt desc").
     *
     * @example
     * ```
     * sort: "createdAt desc, name asc"
     * ```
     */
    sort?: string;
    /**
     * Optional presets string for applying predefined query configurations.
     * Allows repositories to provide common query patterns (e.g., "active", "recent", "archived").
     *
     * @example
     * ```
     * presets: "active,recent"
     * ```
     */
    presets?: string;
}

/**
 * Command for updating an entity with typed data.
 *
 * @template TRequester - The requester performing the update
 * @template TEntity - The entity type being updated
 * @template TId - The entity ID type
 */
export interface UpdateCommand<
    TRequester extends Requester,
    TEntity,
    TId = string,
> {
    /** The requester/actor performing the update */
    requester: TRequester;
    /** The ID of the entity to update */
    id: TId;
    /** Partial entity data to update (excludes system-managed fields) */
    data: Partial<EntityData<TEntity>>;
}

/**
 * Generic repository interface for entity persistence.
 *
 * Implements the Repository pattern as an abstraction boundary between the application
 * and persistence layers. Follows CQRS principles:
 * - **Commands** for write operations (create, update, delete)
 * - **Queries** for read operations (find, find all)
 *
 * All operations are access-controlled via the requester parameter, enabling:
 * - Multi-tenancy support
 * - Row-level security
 * - Audit trails
 * - Permission-based data access
 *
 * The interface is intentionally generic to support various database technologies
 * (relational, NoSQL, event stores) and implementations.
 *
 * @template TRequester - The requester/actor type for access control and auditing
 * @template TEntity - The entity type managed by this repository
 * @template TId - The entity ID type (defaults to string)
 *
 * @example
 * ```typescript
 * interface User extends Entity {
 *   id: string;
 *   name: string;
 *   email: string;
 *   createdAt: Date;
 *   updatedAt: Date;
 * }
 *
 * class PostgresUserRepository implements Repository<Admin, User, string> {
 *   async findById(query: PureParameters<Admin, string>): ResultAsync<User> {
 *     // Check admin permission, then query database
 *   }
 *
 *   async findAll(query: FindAllQuery<Admin>): ResultAsync<PageResult<User>> {
 *     // Apply filters/sorting, check pagination access, return paginated results
 *   }
 *   // ... other methods
 * }
 * ```
 */
export interface Repository<
    TRequester extends Requester,
    TEntity,
    TId = string,
> {
    /**
     * Find a single entity by its unique identifier.
     *
     * @param query - Query parameters including requester and entity ID in payload
     * @returns The entity if found and access is allowed
     */
    findById(query: PureParameters<TRequester, TId>): ResultAsync<TEntity>;

    /**
     * Find all entities with optional pagination, filtering, sorting, and presets.
     *
     * @param query - Query parameters with pagination, filter, sort, and preset options
     * @returns Paginated results containing matching entities and metadata
     */
    findAll(query: FindAllQuery<TRequester>): ResultAsync<PageResult<TEntity>>;

    /**
     * Create a new entity.
     *
     * The repository is responsible for:
     * - Assigning a unique ID (if not provided in data)
     * - Setting system timestamps (createdAt, updatedAt)
     * - Persisting the entity
     * - Enforcing any creation-time constraints
     *
     * @param command - Creation command with requester and entity data
     * @returns The created entity with assigned ID and timestamps
     */
    create(command: CreateCommand<TRequester, TEntity>): ResultAsync<TEntity>;

    /**
     * Update an existing entity.
     *
     * The repository is responsible for:
     * - Validating the entity exists
     * - Updating only provided fields (partial update)
     * - Updating the `updatedAt` timestamp
     * - Enforcing any update constraints
     *
     * This method is optional; some repositories may implement immutable patterns.
     *
     * @param command - Update command with requester, entity ID, and data to update
     * @returns The updated entity with new state and updated timestamp
     */
    update?(
        command: UpdateCommand<TRequester, TEntity, TId>,
    ): ResultAsync<TEntity>;

    /**
     * Permanently delete an entity.
     *
     * Performs a hard delete, completely removing the entity from storage.
     * Consider using `softDelete()` for audit trails.
     *
     * @param command - Delete command with requester and entity ID in payload
     * @returns Void result on successful deletion
     */
    delete(command: PureParameters<TRequester, TId>): ResultAsync<void>;

    /**
     * Soft delete an entity (logical deletion).
     *
     * Marks an entity as deleted by setting the `removedAt` timestamp,
     * without removing it from storage. Allows for:
     * - Audit trails and recovery
     * - Preserving referential integrity
     * - Querying deleted entities if needed
     *
     * This method is optional; only implement if soft deletes are supported.
     *
     * @param command - Delete command with requester and entity ID in payload
     * @returns Void result on successful soft deletion
     */
    softDelete?(command: PureParameters<TRequester, TId>): ResultAsync<void>;

    /**
     * Restore a soft-deleted entity.
     *
     * Clears the `removedAt` timestamp to reactivate a soft-deleted entity.
     * Only applicable for repositories that implement soft deletes.
     *
     * This method is optional; only implement if soft deletes are supported.
     *
     * @param command - Restore command with requester and entity ID in payload
     * @returns Void result on successful restoration
     */
    restore?(command: PureParameters<TRequester, TId>): ResultAsync<void>;
}
