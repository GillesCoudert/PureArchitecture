import { Mapper } from '../../../infrastructure_boundary/mapping/mapper';
import { ImmutableEntity } from '../../../domain/immutable_entity';
import { ResultAsync, Success } from '@gilles-coudert/pure-trace';
import { UpdateInput } from '../../../application_boundary/use_cases/update/input';
import { Requester } from '../../../common/requester';
import {
    Repository,
    UpdateCommand,
    EntityData,
} from '../../../infrastructure_boundary/persistence/repository';
import { UpdateUseCase } from '../../../application_boundary/use_cases/update/use_case';

/**
 * Use case for updating an existing entity.
 * Follows Clean Architecture principles: no framework dependencies.
 *
 * @template TRequester - The requester/actor type for access control
 * @template TEntity - The domain entity type
 * @template TDto - The data transfer object type
 * @template TAccessPolicy - The access policy type
 * @template TId - The entity ID type (defaults to string)
 */
export class UpdateInteractor<
    TRequester extends Requester,
    TEntity extends ImmutableEntity<TId, TAccessPolicy>,
    TDto,
    TAccessPolicy,
    TId = string,
> implements UpdateUseCase<TRequester, TDto, TId> {
    constructor(
        private readonly repository: Repository<
            TRequester,
            TEntity,
            TAccessPolicy,
            TId
        >,
        private readonly mapper: Mapper<TEntity, TDto>,
    ) {}

    update(params: UpdateInput<TRequester, TId>): ResultAsync<TDto> {
        const command: UpdateCommand<TRequester, TEntity, TId> = {
            requester: params.requester,
            id: params.id,
            data: params.data as Partial<EntityData<TEntity>>,
        };
        return this.repository
            .update(command)
            .mapSuccess((entity) => new Success(this.mapper.to(entity)));
    }
}
