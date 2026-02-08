import { Parameters } from '../../../common/parameters';
import { Requester } from '../../../common/requester';

/**
 * Input parameters for deleting an entity.
 * Exposed to the presentation layer with configurable TId.
 *
 * @template TRequester - The requester/actor type for access control
 * @template TId - The entity ID type (defaults to string)
 */
export interface DeleteInput<
    TRequester extends Requester,
    TId = string,
> extends Parameters<TRequester> {
    /**
     * The entity ID to delete
     */
    id: TId;
}
