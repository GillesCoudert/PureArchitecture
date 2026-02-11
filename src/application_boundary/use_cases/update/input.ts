import { PureParameters } from '../../../common/parameters';
import { Requester } from '../../../common/requester';

/**
 * Input parameters for updating an existing entity.
 * Exposed to the presentation layer with configurable TId.
 *
 * @template TRequester - The requester/actor type for access control
 * @template TId - The entity ID type (defaults to string)
 */
export interface UpdateInput<
    TRequester extends Requester,
    TInputData,
    TId = string,
> extends PureParameters<TRequester> {
    /**
     * The entity ID to update
     */
    id: TId;
    /**
     * Entity data to update (only fields to change)
     */
    data: TInputData;
}
