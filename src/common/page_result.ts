/**
 * Envelope for paginated results.
 * Used to transmit a page of results and pagination metadata from use cases.
 *
 * @template T The type of the items in the page
 */
export interface PageResult<T> {
    /**
     * The items for the current page.
     */
    items: T[];
    /**
     * The current page number (1-based).
     */
    pageNumber: number;
    /**
     * The number of items per page.
     */
    pageSize: number;
    /**
     * The total number of items for the query (if known).
     */
    totalCount?: number;
}
