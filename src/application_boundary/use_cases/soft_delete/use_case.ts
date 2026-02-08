import { ResultAsync } from '@gilles-coudert/pure-trace';
import { SoftDeleteInput } from './input';
import { Requester } from '../../../common/requester';

/**
 * Use case interface for soft deleting an entity.
 * Exposed to the presentation layer.
 *
 * @template TRequester - The requester/actor type for access control
 * @template TId - The entity ID type (defaults to string)
 */
export interface SoftDeleteUseCase<TRequester extends Requester, TId = string> {
    /**
     * Soft delete an entity by its ID (mark as deleted without removing).
     * @param params - Command parameters containing requester and entity ID
     */
    softDelete(params: SoftDeleteInput<TRequester, TId>): ResultAsync<void>;
}
