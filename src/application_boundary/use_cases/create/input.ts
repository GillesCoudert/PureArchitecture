import { PureParameters } from '../../../common/parameters';
import { Requester } from '../../../common/requester';

/**
 * Input parameters for creating a new entity.
 * Exposed to the presentation layer without TEntity.
 *
 * @template TRequester - The requester/actor type for access control
 */
export interface CreateInput<
    TRequester extends Requester,
> extends PureParameters<TRequester> {
    /**
     * Entity data without system-managed fields (id, createdAt, etc.)
     */
    data: Record<string, unknown>;
}
