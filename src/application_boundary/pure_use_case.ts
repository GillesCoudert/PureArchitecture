import { ResultAsync } from '@gilles-coudert/pure-trace';
import { Requester } from '../common/requester';
import { PureParameters } from '../common/parameters';

/**
 * Contract for a pure use case following Clean Architecture principles.
 *
 * A PureUseCase represents a single, reusable business operation that is:
 * - Independent of presentation and infrastructure layers
 * - Parameterized with a requester for access control
 * - Returns a Result for reliable error handling
 *
 * @template TRequester - The type of requester/actor performing the use case
 * @template TInput - The input parameters type, must extend PureParameters<TRequester>
 * @template TOutput - The output/result type returned by the use case
 *
 * @example
 * ```typescript
 * interface CreateUserInput extends PureParameters<User> {
 *   name: string;
 *   email: string;
 * }
 *
 * class CreateUserUseCase implements PureUseCase<User, CreateUserInput, User> {
 *   async execute(input: CreateUserInput): Promise<ResultAsync<User>> {
 *     // Implementation...
 *   }
 * }
 * ```
 */
export interface PureUseCase<
    TRequester extends Requester,
    TInput extends PureParameters<TRequester>,
    TOutput,
> {
    /**
     * Execute the use case with the provided input parameters.
     *
     * @param input - The input parameters containing the requester and operation data
     * @returns A ResultAsync containing either the output data or errors/failures
     */
    execute(input: TInput): ResultAsync<TOutput>;
}
