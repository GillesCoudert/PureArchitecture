import { Requester } from './requester';

/**
 * Base interface for all operation parameters.
 *
 * Ensures every operation in the application has an authenticated and authorized actor
 * (requester) performing it. This is fundamental to:
 * - Access control and authorization (with capability-based access patterns)
 * - Audit trails and accountability
 * - Multi-tenancy and data isolation
 * - Security policy enforcement
 *
 * All use case inputs should extend this interface to guarantee a requester is always present.
 *
 * The optional `payload` generic allows for flexible operation-specific data:
 * - Resource IDs: `PureParameters<Admin, string>`
 * - Entity data: `PureParameters<Admin, User>`
 * - Complex data: `PureParameters<Admin, { id: string; data: User }>`
 * - No extra data: `PureParameters<Admin>` (payload is undefined)
 *
 * @template TRequester - The requester/actor type
 * @template TPayload - The operation-specific payload/data (optional, defaults to not present)
 *
 * @example
 * ```typescript
 * // Simple: just requester
 * const listInput: PureParameters<Admin> = {
 *   requester: adminUser
 * };
 *
 * // With ID payload (for find, update, delete operations)
 * const deleteInput: PureParameters<Admin, string> = {
 *   requester: adminUser,
 *   payload: 'user-123'
 * };
 *
 * // With complex payload
 * interface CreateUserInput extends PureParameters<Admin, { name: string; email: string }> {}
 * const createInput: CreateUserInput = {
 *   requester: adminUser,
 *   payload: { name: 'John', email: 'john@example.com' }
 * };
 * ```
 */
export interface PureParameters<
    TRequester extends Requester,
    TPayload = undefined,
> {
    /** The requester/actor performing this operation */
    requester: TRequester;
    /** Optional operation-specific payload (data, ID, options, etc.) */
    payload?: TPayload extends undefined ? undefined : TPayload;
}
