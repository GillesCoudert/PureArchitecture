import { PureParameters } from '../../../common/parameters';
import { Requester } from '../../../common/requester';

/**
 * Represents the input parameters for the "find all" use case.
 * This interface is exposed to the presentation layer and allows
 * specifying pagination, filtering, sorting, and preset options
 * for retrieving a collection of entities.
 *
 * @template TRequester The type representing the requester/actor for access control.
 * @extends PureParameters<TRequester>
 */
export interface FindAllInput<
    TRequester extends Requester,
> extends PureParameters<TRequester> {
    /**
     * The page number for pagination (optional).
     * If not provided, defaults to the first page.
     */
    pageNumber?: number;

    /**
     * The number of items per page for pagination (optional).
     * If not provided, a default page size may be used.
     */
    pageSize?: number;

    /**
     * Optional filter string to query entities by specific criteria.
     */
    filter?: string;

    /**
     * Optional sort string to define the sorting order of the results.
     */
    sort?: string;

    /**
     * Optional presets string to apply predefined query configurations.
     */
    presets?: string;
}
