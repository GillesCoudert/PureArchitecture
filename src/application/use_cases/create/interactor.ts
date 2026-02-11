import { Mapper } from '../../../infrastructure_boundary/mapping/mapper';
import { ImmutableEntity } from '../../../domain/immutable_entity';
import { ResultAsync, Success } from '@gilles-coudert/pure-trace';
import { CreateInput } from '../../../application_boundary/use_cases/create/input';
import {
    Repository,
    CreateCommand,
    EntityData,
} from '../../../infrastructure_boundary/persistence/repository';
import { Requester } from '../../../common/requester';
import { CreateUseCase } from '../../../application_boundary/use_cases/create/use_case';

/**
 * Use case for creating a new entity.
 * Follows Clean Architecture principles: no framework dependencies.
 *
 * @template TRequester - The requester/actor type for access control
 * @template TEntity - The domain entity type
 * @template TDto - The data transfer object type
 * @template TAccessPolicy - The access policy type
 * @template TId - The entity ID type (defaults to string)
 */
export class CreateInteractor<
    TRequester extends Requester,
    TInputData,
    TEntity extends ImmutableEntity<TId, TAccessPolicy>,
    TDto,
    TAccessPolicy,
    TId = string,
> implements CreateUseCase<TRequester, TInputData, TDto> {
    constructor(
        private readonly repository: Repository<
            TRequester,
            TEntity,
            TAccessPolicy,
            TId
        >,
        private readonly mapper: Mapper<TEntity, TDto>,
    ) {}

    execute(params: CreateInput<TRequester, TInputData>): ResultAsync<TDto> {
        const command: CreateCommand<TRequester, TEntity> = {
            requester: params.requester,
            data: params.data as EntityData<TEntity>,
        };
        return this.repository
            .create(command)
            .mapSuccess((entity) => new Success(this.mapper.to(entity)));
    }
}
