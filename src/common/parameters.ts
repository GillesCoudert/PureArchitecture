import { Requester } from './requester';

/**
 * Base interface for all parameters requiring a requester.
 * This ensures every operation has an authenticated/authorized actor.
 */
export interface PureParameters<TRequester extends Requester> {
    requester: TRequester;
}

/**
 * Parameters targeting a specific entity by its ID
 */
export interface TargetResourceParameters<
    TRequester extends Requester,
    TId = string,
> extends PureParameters<TRequester> {
    id: TId;
}
