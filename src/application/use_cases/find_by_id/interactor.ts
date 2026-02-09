import { Mapper } from '../../../infrastructure_boundary/mapping/mapper';
import { ImmutableEntity } from '../../../domain/immutable_entity';
import { ResultAsync, Success } from '@gilles-coudert/pure-trace';
import { FindByIdInput } from '../../../application_boundary/use_cases/find_by_id/input';
import { Repository } from '../../../infrastructure_boundary/persistence/repository';
import { Requester } from '../../../common/requester';
import { FindByIdUseCase } from '../../../application_boundary/use_cases/find_by_id/use_case';

/**
 * Use case for finding an entity by its ID.
 * Follows Clean Architecture principles: no framework dependencies.
 *
 * @template TRequester - The requester/actor type for access control
 * @template TEntity - The domain entity type
 * @template TDto - The data transfer object type
 * @template TAccessPolicy - The access policy type
 * @template TId - The entity ID type (defaults to string)
 */
export class FindByIdInteractor<
    TRequester extends Requester,
    TEntity extends ImmutableEntity<TId, TAccessPolicy>,
    TDto,
    TAccessPolicy,
    TId = string,
> implements FindByIdUseCase<TRequester, TDto, TId> {
    constructor(
        private readonly repository: Repository<
            TRequester,
            TEntity,
            TAccessPolicy,
            TId
        >,
        private readonly mapper: Mapper<TEntity, TDto>,
    ) {}

    execute(params: FindByIdInput<TRequester, TId>): ResultAsync<TDto> {
        return this.repository
            .findById(params)
            .mapSuccess((entity) => new Success(this.mapper.to(entity)));
    }
}
