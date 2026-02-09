import { ImmutableEntity } from '../../../domain/immutable_entity';
import { ResultAsync } from '@gilles-coudert/pure-trace';
import { SoftDeleteInput } from '../../../application_boundary/use_cases/soft_delete/input';
import { Repository } from '../../../infrastructure_boundary/persistence/repository';
import { Requester } from '../../../common/requester';
import { SoftDeleteUseCase } from '../../../application_boundary/use_cases/soft_delete/use_case';

/**
 * Use case for soft deleting an entity.
 * Follows Clean Architecture principles: no framework dependencies.
 *
 * @template TRequester - The requester/actor type for access control
 * @template TEntity - The domain entity type
 * @template TAccessPolicy - The access policy type
 * @template TId - The entity ID type (defaults to string)
 */
export class SoftDeleteInteractor<
    TRequester extends Requester,
    TEntity extends ImmutableEntity<TId, TAccessPolicy>,
    TAccessPolicy,
    TId = string,
> implements SoftDeleteUseCase<TRequester, TId> {
    constructor(
        private readonly repository: Repository<
            TRequester,
            TEntity,
            TAccessPolicy,
            TId
        >,
    ) {}

    execute(params: SoftDeleteInput<TRequester, TId>): ResultAsync<void> {
        if (!this.repository.softDelete) {
            throw new Error('Soft delete is not supported by this repository');
        }
        return this.repository.softDelete(params);
    }
}
