import { PureParameters } from '../../../common/parameters';
import { Requester } from '../../../common/requester';

/**
 * Input parameters for finding an entity by its ID.
 * Exposed to the presentation layer with configurable TId.
 *
 * @template TRequester - The requester/actor type for access control
 * @template TId - The entity ID type (defaults to string)
 */
export interface FindByIdInput<
    TRequester extends Requester,
    TId = string,
> extends PureParameters<TRequester> {
    /**
     * The entity ID to find
     */
    id: TId;
}
