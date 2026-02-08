import { ResultAsync } from '@gilles-coudert/pure-trace';
import { CreateInput } from './input';
import { Requester } from '../../../common/requester';

/**
 * Use case interface for creating a new entity.
 * Exposed to the presentation layer without TEntity.
 *
 * @template TRequester - The requester/actor type for access control
 * @template TDto - The data transfer object type
 */
export interface CreateUseCase<TRequester extends Requester, TDto> {
    /**
     * Create a new entity and return it as a DTO.
     * @param params - Command parameters containing requester and entity data
     * @returns The created entity as a DTO
     */
    create(
        params: CreateInput<TRequester> & {
            data: Partial<Record<string, unknown>>;
        },
    ): ResultAsync<TDto>;
}
