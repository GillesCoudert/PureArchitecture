import { ResultAsync } from '@gilles-coudert/pure-trace';
import { TargetResourceParameters } from '../../common/parameters';
import { PageResult } from '../../common/page_result';
import { Requester } from '../../common/requester';

/**
 * Entity data without system-managed fields
 */
export type EntityData<TEntity> = Omit<
    TEntity,
    'id' | 'createdAt' | 'updatedAt' | 'removedAt'
>;

/**
 * Command for creating a new entity with typed data
 */
export interface CreateCommand<TRequester extends Requester, TEntity> {
    requester: TRequester;
    data: EntityData<TEntity>;
}

/**
 * Query for finding all entities, supporting pagination, filtering, sorting, and presets.
 */
export interface FindAllQuery<TRequester extends Requester> {
    requester: TRequester;
    /**
     * The page number for pagination (optional).
     */
    pageNumber?: number;
    /**
     * The number of items per page for pagination (optional).
     */
    pageSize?: number;
    /**
     * Optional filter string to query entities by specific criteria.
     */
    filter?: string;
    /**
     * Optional sort string to define the sorting order of the results.
     */
    sort?: string;
    /**
     * Optional presets string to apply predefined query configurations.
     */
    presets?: string;
}

/**
 * Command for updating an entity with typed data
 */
export interface UpdateCommand<
    TRequester extends Requester,
    TEntity,
    TId = string,
> {
    requester: TRequester;
    id: TId;
    data: Partial<EntityData<TEntity>>;
}

/**
 * Generic repository interface for entity persistence.
 * To be implemented in the infrastructure layer.
 * Follows CQRS pattern: Commands for writes, Queries for reads.
 * All operations require a requester for access control.
 *
 * @template TRequester - The requester/actor type for access control
 * @template TEntity - The entity type to persist
 * @template TId - The entity ID type (defaults to string)
 */
export interface Repository<
    TRequester extends Requester,
    TEntity,
    TId = string,
> {
    /**
     * Find an entity by its ID
     * @param query - Query containing requester and entity ID
     */
    findById(
        query: TargetResourceParameters<TRequester, TId>,
    ): ResultAsync<TEntity>;

    /**
     * Find all entities with optional pagination, filters, sorting, and presets.
     * @param query - Query containing requester and query options
     */
    findAll(query: FindAllQuery<TRequester>): ResultAsync<PageResult<TEntity>>;

    /**
     * Create a new entity
     * @param command - Command containing requester and entity data
     */
    create(command: CreateCommand<TRequester, TEntity>): ResultAsync<TEntity>;

    /**
     * Update an entity
     * @param command - Command containing requester, entity ID and data to update
     */
    update?(
        command: UpdateCommand<TRequester, TEntity, TId>,
    ): ResultAsync<TEntity>;

    /**
     * Delete an entity permanently
     * @param command - Command containing requester and entity ID
     */
    delete(
        command: TargetResourceParameters<TRequester, TId>,
    ): ResultAsync<void>;

    /**
     * Soft delete an entity (if supported)
     * @param command - Command containing requester and entity ID
     */
    softDelete?(
        command: TargetResourceParameters<TRequester, TId>,
    ): ResultAsync<void>;

    /**
     * Restore a soft deleted entity (if supported)
     * @param command - Command containing requester and entity ID
     */
    restore?(
        command: TargetResourceParameters<TRequester, TId>,
    ): ResultAsync<void>;
}
