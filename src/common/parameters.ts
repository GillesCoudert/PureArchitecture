import { Requester } from './requester';

/**
 * Represents any valid JSON value.
 *
 * This type captures all possible JSON data types:
 * - Primitives: null, boolean, number, string
 * - Structures: arrays and objects
 *
 * The type is recursive to support nested JSON structures of arbitrary depth.
 *
 * @example
 * ```typescript
 * const simpleValue: Json = 'hello';
 * const numberValue: Json = 42;
 * const arrayValue: Json = [1, 2, 'three'];
 * const objectValue: Json = { name: 'John', age: 30, active: true };
 * const nestedValue: Json = {
 *   user: { name: 'John', contacts: ['email', 'phone'] },
 *   metadata: null
 * };
 * ```
 */
export type Json =
    | null
    | boolean
    | number
    | string
    | Json[]
    | { [key: string]: Json };

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
 * The optional `payload` generic allows for flexible operation-specific JSON-serializable data:
 * - Resource IDs: `PureParameters<Admin, string>`
 * - Entity data: `PureParameters<Admin, User>`
 * - Complex data: `PureParameters<Admin, { id: string; data: User }>`
 * - No extra data: `PureParameters<Admin>` (payload is undefined)
 *
 * @template TRequester - The requester/actor type
 * @template TPayload - The operation-specific payload/data (must be JSON-serializable, defaults to undefined)
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
    TPayload extends Json | undefined = undefined,
> {
    /** The requester/actor performing this operation */
    requester: TRequester;
    /** Optional operation-specific payload (data, ID, options, etc.) */
    payload?: TPayload extends undefined ? undefined : TPayload;
}
