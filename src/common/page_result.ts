/**
 * Envelope for paginated query results.
 *
 * Used to return a single page of items from repository queries along with
 * pagination metadata. This allows clients to:
 * - Display the current page of results
 * - Implement pagination UI (next/previous buttons, page numbers)
 * - Determine if more results are available
 *
 * @template T - The type of items in the page
 *
 * @example
 * ```typescript
 * // Repository returns page of users
 * const result: PageResult<User> = {
 *   items: [user1, user2, user3],
 *   pageNumber: 2,
 *   pageSize: 10,
 *   totalCount: 47,
 * };
 *
 * // Client can calculate total pages
 * const totalPages = Math.ceil(result.totalCount! / result.pageSize);
 * ```
 */
export interface PageResult<T> {
    /**
     * The items for the current page.
     * May be empty if the page number exceeds available items.
     */
    items: T[];
    /**
     * The current page number (1-based indexing).
     * Page 1 is the first page.
     */
    pageNumber: number;
    /**
     * The number of items per page requested/returned.
     * The last page may contain fewer than `pageSize` items.
     */
    pageSize: number;
    /**
     * The total count of items matching the query (if known).
     *
     * May be undefined if:
     * - The repository doesn't calculate total count for performance reasons
     * - The count is too expensive to compute for large datasets
     *
     * When present, clients can calculate: `totalPages = Math.ceil(totalCount / pageSize)`
     */
    totalCount?: number;
}
