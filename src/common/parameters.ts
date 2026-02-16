import { Requester } from './requester';

/**
 * Base interface for all operation parameters.
 *
 * Ensures every operation in the application has an authenticated and authorized actor
 * (requester) performing it. This is fundamental to:
 * - Access control and authorization
 * - Audit trails and accountability
 * - Multi-tenancy and data isolation
 * - Security policy enforcement
 *
 * All use case inputs should extend this interface to guarantee a requester is always present.
 *
 * @template TRequester - The requester/actor type
 *
 * @example
 * ```typescript
 * interface CreateUserInput extends PureParameters<Admin> {
 *   name: string;
 *   email: string;
 * }
 *
 * // Now CreateUserInput always has a 'requester' property of type Admin
 * const input: CreateUserInput = {
 *   requester: adminUser,
 *   name: 'John',
 *   email: 'john@example.com'
 * };
 * ```
 */
export interface PureParameters<TRequester extends Requester> {
    /** The requester/actor performing this operation */
    requester: TRequester;
}

/**
 * Parameters for operations targeting a specific resource by its ID.
 *
 * Extends PureParameters to add a resource identifier, used for:
 * - Finding a specific entity
 * - Updating a specific entity
 * - Deleting a specific entity
 * - Any operation scoped to a single resource
 *
 * @template TRequester - The requester/actor type
 * @template TId - The resource ID type (defaults to string)
 *
 * @example
 * ```typescript
 * // Delete user by ID
 * interface DeleteUserInput extends TargetResourceParameters<Admin, string> {
 *   // Inherits: requester: Admin
 *   // Inherits: id: string
 * }
 *
 * // Update product by UUID
 * interface UpdateProductInput extends TargetResourceParameters<Manager, UUID> {
 *   // Inherits: requester: Manager
 *   // Inherits: id: UUID
 *   price: Money;
 * }
 * ```
 */
export interface TargetResourceParameters<
    TRequester extends Requester,
    TId = string,
> extends PureParameters<TRequester> {
    /** The unique identifier of the target resource */
    id: TId;
}
