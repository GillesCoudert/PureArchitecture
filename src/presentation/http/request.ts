import { Requester } from '../../common/requester';

/**
 * Represents an abstract HTTP request.
 * @template TRequester The type of the requester object.
 */
export interface HttpRequest<TRequester extends Requester> {
    /**
     * Returns the requested URL of the HTTP request.
     * @returns {string} The requested URL.
     */
    getRequestedUrl(): string;

    /**
     * Returns the requester object associated with the request.
     * @returns {TRequester} The requester.
     */
    getRequester(): TRequester;

    /**
     * Retrieves a query parameter from the request.
     * @param name The name of the query parameter to retrieve.
     * @param defaultValue An optional default value to return if the query parameter is not present.
     * @returns The value of the query parameter, or undefined if not present.
     */
    getQueryParameter<T>(name: string, defaultValue?: T): T | undefined;

    /**
     * Retrieves all query parameters from the request.
     * @param names The names of the query parameters to retrieve.
     * @param defaultValues An optional record of default values for the query parameters.
     * @returns A record of query parameter names and their corresponding values.
     */
    getQueryParameters<T>(
        names: string[],
        defaultValues?: Record<string, T>,
    ): Record<string, T | undefined>;
}
