import { ResultAsync } from '@gilles-coudert/pure-trace';
import { FindAllInput } from './input';
import { Requester } from '../../../common/requester';
import { PageResult } from '../../../common/page_result';

/**
 * Use case interface for finding all entities.
 * Exposed to the presentation layer without TEntity.
 *
 * @template TRequester - The requester/actor type for access control
 * @template TDto - The data transfer object type
 */
export interface FindAllUseCase<TRequester extends Requester, TDto> {
    /**
     * Find all entities and return them as DTOs.
     * @param input - Query parameters containing requester
     * @returns Array of entities as DTOs
     */
    findAll(input: FindAllInput<TRequester>): ResultAsync<PageResult<TDto>>;
}
