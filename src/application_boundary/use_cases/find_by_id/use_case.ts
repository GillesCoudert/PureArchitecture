import { ResultAsync } from '@gilles-coudert/pure-trace';
import { FindByIdInput } from './input';
import { Requester } from '../../../common/requester';

/**
 * Use case interface for finding an entity by its ID.
 * Exposed to the presentation layer without TEntity.
 *
 * @template TRequester - The requester/actor type for access control
 * @template TDto - The data transfer object type
 * @template TId - The entity ID type (defaults to string)
 */
export interface FindByIdUseCase<
    TRequester extends Requester,
    TDto,
    TId = string,
> {
    /**
     * Find an entity by its ID and return it as a DTO.
     * @param input - Query parameters containing requester and entity ID
     * @returns The entity as a DTO, or null if not found
     */
    findById(input: FindByIdInput<TRequester, TId>): ResultAsync<TDto>;
}
