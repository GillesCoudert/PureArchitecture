import { ImmutableEntity } from '../../../domain/immutable_entity';
import { ResultAsync } from '@gilles-coudert/pure-trace';
import { DeleteInput } from '../../../application_boundary/use_cases/delete/input';
import { Repository } from '../../../infrastructure_boundary/persistence/repository';
import { Requester } from '../../../common/requester';
import { DeleteUseCase } from '../../../application_boundary/use_cases/delete/use_case';

/**
 * Use case for permanently deleting an entity.
 * Follows Clean Architecture principles: no framework dependencies.
 *
 * @template TRequester - The requester/actor type for access control
 * @template TEntity - The domain entity type
 * @template TAccessPolicy - The access policy type
 * @template TId - The entity ID type (defaults to string)
 */
export class DeleteInteractor<
    TRequester extends Requester,
    TEntity extends ImmutableEntity<TId, TAccessPolicy>,
    TAccessPolicy,
    TId = string,
> implements DeleteUseCase<TRequester, TId> {
    constructor(
        private readonly repository: Repository<
            TRequester,
            TEntity,
            TAccessPolicy,
            TId
        >,
    ) {}

    execute(params: DeleteInput<TRequester, TId>): ResultAsync<void> {
        return this.repository.delete(params);
    }
}
