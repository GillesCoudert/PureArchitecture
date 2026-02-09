import { ImmutableEntity } from '../../../domain/immutable_entity';
import { ResultAsync } from '@gilles-coudert/pure-trace';
import { RestoreInput } from '../../../application_boundary/use_cases/restore/input';
import { Requester } from '../../../common/requester';
import { Repository } from '../../../infrastructure_boundary/persistence/repository';
import { RestoreUseCase } from '../../../application_boundary/use_cases/restore/use_case';

/**
 * Use case for restoring a soft deleted entity.
 * Follows Clean Architecture principles: no framework dependencies.
 *
 * @template TRequester - The requester/actor type for access control
 * @template TEntity - The domain entity type
 * @template TAccessPolicy - The access policy type
 * @template TId - The entity ID type (defaults to string)
 */
export class RestoreInteractor<
    TRequester extends Requester,
    TEntity extends ImmutableEntity<TId, TAccessPolicy>,
    TAccessPolicy,
    TId = string,
> implements RestoreUseCase<TRequester, TId> {
    constructor(
        private readonly repository: Repository<
            TRequester,
            TEntity,
            TAccessPolicy,
            TId
        >,
    ) {}

    execute(params: RestoreInput<TRequester, TId>): ResultAsync<void> {
        if (!this.repository.restore) {
            throw new Error('Restore is not supported by this repository');
        }
        return this.repository.restore(params);
    }
}
