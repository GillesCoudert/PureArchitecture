import { ResultAsync } from '@gilles-coudert/pure-trace';
import { CreateInput } from './input';
import { Requester } from '../../../common/requester';
import { PureUseCase } from '../pure_use_case';

/**
 * Use case interface for creating a new entity.
 * Exposed to the presentation layer without TEntity.
 *
 * @template TRequester - The requester/actor type for access control
 * @template TDto - The data transfer object type
 */
export interface CreateUseCase<
    TRequester extends Requester,
    TInputData,
    TDto,
> extends PureUseCase<TRequester, TDto> {
    /**
     * Execute the use case: create a new entity and return it as a DTO.
     * @param input - Command parameters containing requester and entity data
     * @returns The created entity as a DTO
     */
    execute(input: CreateInput<TRequester, TInputData>): ResultAsync<TDto>;
}
