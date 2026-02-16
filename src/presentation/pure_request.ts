import { Requester } from '../common/requester';

/**
 * Protocol-agnostic interface for incoming requests.
 *
 * PureRequest provides a uniform way to extract requester/actor information
 * from any protocol-specific request (HTTP, GraphQL, gRPC, etc.).
 * This abstraction allows controllers to remain independent of the presentation protocol.
 *
 * @template TRequester - The type of requester/actor performing the request
 *
 * @example
 * ```typescript
 * // HTTP adapter
 * class HttpRequest implements PureRequest<User> {
 *   constructor(private req: Express.Request) {}
 *   getRequester(): User {
 *     return this.req.user;
 *   }
 * }
 *
 * // GraphQL adapter
 * class GraphQLRequest implements PureRequest<User> {
 *   constructor(private context: GraphQLContext) {}
 *   getRequester(): User {
 *     return this.context.user;
 *   }
 * }
 * ```
 */
export interface PureRequest<TRequester extends Requester> {
    /**
     * Extract the requester/actor information from the request.
     *
     * @returns The requester object containing identity and preferences
     */
    getRequester(): TRequester;
}
