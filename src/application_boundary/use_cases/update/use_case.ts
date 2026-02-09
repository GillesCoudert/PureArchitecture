import { ResultAsync } from '@gilles-coudert/pure-trace';
import { UpdateInput } from './input';
import { Requester } from '../../../common/requester';

/**
 * Use case interface for updating an existing entity.
 * Exposed to the presentation layer without TEntity.
 *
 * @template TRequester - The requester/actor type for access control
 * @template TDto - The data transfer object type
 * @template TId - The entity ID type (defaults to string)
 */
export interface UpdateUseCase<
    TRequester extends Requester,
    TDto,
    TId = string,
> {
    /**
     * Execute the use case: update an existing entity and return it as a DTO.
     * @param input - Command parameters containing requester, entity ID, and updated data
     * @returns The updated entity as a DTO
     */
    execute(input: UpdateInput<TRequester, TId>): ResultAsync<TDto>;
}
