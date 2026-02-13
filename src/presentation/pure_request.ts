import { Requester } from '../common/requester';

/**
 * Represents an abstract request.
 * @template TRequester The type of the requester object.
 */
export interface PureRequest<TRequester extends Requester> {
    /**
     * Returns the requester object associated with the request.
     * @returns {TRequester} The requester.
     */
    getRequester(): TRequester;
}
