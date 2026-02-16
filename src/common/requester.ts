import { Culture } from './culture';

/**
 * Represents an authenticated user, service, or actor performing operations.
 *
 * The Requester interface provides the essential information needed for:
 * - **Identification**: Who is performing the operation (for audit logs)
 * - **Localization**: What culture/language the user prefers (for messages)
 * - **Authorization**: Can this actor perform the requested operation (via subtyping)
 * - **Multi-tenancy**: Which tenant does this actor belong to (via custom properties)
 *
 * This interface is intentionally minimal; extend it with additional properties
 * as needed (e.g., `tenantId`, `roles`, `permissions`).
 *
 * @example
 * ```typescript
 * // Basic user
 * interface User extends Requester {
 *   id: string;
 *   preferredCulture: Culture;
 *   name: string;
 *   email: string;
 * }
 *
 * // Admin user with additional capabilities
 * interface Admin extends User {
 *   role: 'admin';
 *   permissions: string[];
 * }
 *
 * // Multi-tenant user
 * interface TenantUser extends Requester {
 *   id: string;
 *   tenantId: string;
 *   preferredCulture: Culture;
 * }
 *
 * // Service-to-service requester
 * interface ServiceAccount extends Requester {
 *   id: string;
 *   preferredCulture: Culture;
 *   serviceId: string;
 *   scopes: string[];
 * }
 * ```
 */
export interface Requester {
    /** Unique identifier for this requester/actor */
    id: string;
    /** The culture/locale preference for localized messages and i18n */
    preferredCulture: Culture;
}
