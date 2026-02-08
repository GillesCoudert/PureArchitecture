import { Requester } from './requester';

/**
 * Base interface for all parameters requiring a requester.
 * This ensures every operation has an authenticated/authorized actor.
 */
export interface Parameters<TRequester extends Requester> {
    requester: TRequester;
}

/**
 * Parameters targeting a specific entity by its ID
 */
export interface TargetEntityParameters<
    TRequester extends Requester,
    TId = string,
> extends Parameters<TRequester> {
    id: TId;
}
