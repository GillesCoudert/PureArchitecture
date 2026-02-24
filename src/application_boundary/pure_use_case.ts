import { ResultAsync } from '@gilles-coudert/pure-trace';
import { Requester } from '../common/requester';
import { Json, PureParameters } from '../common/parameters';

/**
 * Contract for a pure use case following Clean Architecture principles.
 *
 * A PureUseCase represents a single, reusable business operation that is:
 * - Independent of presentation and infrastructure layers
 * - Parameterized with a requester for access control
 * - Returns a Result for reliable error handling
 *
 * @template TInput - The input parameters type, must extend PureParameters<TRequester>
 * @template TOutput - The output/result type returned by the use case (must be JSON-serializable)
 * @template TRequester - The type of requester/actor performing the use case (optional, inferred from TInput)
 *
 * @example
 * ```typescript
 * interface CreateUserInput extends PureParameters<User> {
 *   name: string;
 *   email: string;
 * }
 *
 * class CreateUserUseCase implements PureUseCase<CreateUserInput, User> {
 *   async execute(input: CreateUserInput): ResultAsync<User> {
 *     // Implementation...
 *   }
 * }
 *
 * // Or with explicit requester type:
 * class AdminUseCase implements PureUseCase<CreateUserInput, User, Admin> {
 *   async execute(input: CreateUserInput): ResultAsync<User> {
 *     // Implementation...
 *   }
 * }
 * ```
 */
export interface PureUseCase<
    TInput extends PureParameters<TRequester, TInputData>,
    TInputData extends Json,
    TOutput extends Json,
    TRequester extends Requester = TInput extends PureParameters<infer R>
        ? R
        : never,
> {
    /**
     * Execute the use case with the provided input parameters.
     *
     * @param input - The input parameters containing the requester and operation data
     * @returns A ResultAsync containing either the output data or errors/failures
     */
    execute(input: TInput): ResultAsync<TOutput>;
}
