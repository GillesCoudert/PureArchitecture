import {
    ResultAsync,
    Result,
    Error,
    Failure,
    Success,
} from '@gilles-coudert/pure-trace';
import { PureUseCase } from '../application_boundary/pure_use_case';
import { PureParameters } from '../common/parameters';
import { Requester } from '../common/requester';
import { Translator } from '../infrastructure_boundary/i18n/translator';
import { PureRequest } from './pure_request';
import z from 'zod';

/**
 * Protocol-agnostic context for tracking state during request handling
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const controllerContextSchema = z.json();
type ControllerContext = z.infer<typeof controllerContextSchema>;

/**
 * Abstract controller for handling pure use cases that follow Clean Architecture principles.
 *
 * Provides a base implementation for protocol-agnostic request handling with:
 * - Automatic use case execution with input validation
 * - Error and success handling with localization support
 * - Context management throughout the request lifecycle
 *
 * @template TControllerResult - The data type returned by the controller (HTTP response, GraphQL result, etc.)
 * @template TRequester - The requester/actor type for access control and audit
 * @template TUseCaseInput - The input parameters type for the use case
 * @template TUseCaseResult - The result type returned by the use case
 * @template TTranslator - The translator service for i18n
 *
 * @example
 * ```typescript
 * class CreateUserController extends PureController<
 *   HttpResponse,
 *   User,
 *   CreateUserInput,
 *   User,
 *   I18nTranslator
 * > {
 *   protected getUseCaseInput(request: PureRequest<User>): Result<CreateUserInput> {
 *     // Convert HTTP request to use case input
 *   }
 * }
 * ```
 */
export abstract class PureController<
    TControllerResult,
    TRequester extends Requester,
    TUseCaseInput extends PureParameters<TRequester>,
    TUseCaseResult,
    TTranslator extends Translator,
> {
    constructor(
        protected readonly interactor: PureUseCase<
            TRequester,
            TUseCaseInput,
            TUseCaseResult
        >,
        protected readonly translator: TTranslator,
    ) {}

    protected async handle(
        request: PureRequest<TRequester>,
    ): Promise<TControllerResult> {
        const context = this.initContext(request);
        const preferredCulture = request.getRequester().preferredCulture;
        //>
        //> > fr: Exécuter le cas d'utilisation avec les paramètres d'entrée
        //> > en: Execute the use case with the input parameters
        //>
        const result = await ResultAsync.liftResult(
            this.getUseCaseInput(request),
        ).chainSuccess((input) => this.interactor.execute(input));

        //>
        //> > fr: Traduire les traces
        //> > en: Translate the traces
        //>
        for (const trace of result.getTraces()) {
            if (trace.localizedMessage == undefined) {
                this.translator.translate(trace, preferredCulture);
            }
        }

        if (result.isFailure()) {
            for (const error of result.getErrors()) {
                //>
                //> > fr: Traitement de chaque erreur.
                //> > en: Handling each error.
                //>
                if (error.localizedMessage == undefined) {
                    this.translator.translate(error, preferredCulture);
                }
                this.handleError(error, context);
            }
            this.handleFailure(result, context);
        } else {
            this.handleSuccess(result, context);
        }

        //>
        //> > fr: Consolider le contexte et envoyer la réponse
        //> > en: Consolidate context and send the response
        //>
        return this.handleContext(context);
    }

    /**
     * Initialize context for this request.
     *
     * Called at the beginning of request handling to set up any state needed
     * throughout the request lifecycle (e.g., HTTP headers, session data).
     *
     * @param request - The incoming request with requester information
     * @returns A protocol-agnostic context object for this request
     */
    protected abstract initContext(
        request: PureRequest<TRequester>,
    ): ControllerContext;

    /**
     * Handle an individual error from the use case execution.
     *
     * Called for each error that occurs during execution. This method allows
     * for granular error processing (e.g., logging, metrics, error mapping).
     *
     * @param error - The error to handle
     * @param context - The current request context for accumulating results
     */
    protected abstract handleError(
        error: Error,
        context: ControllerContext,
    ): void;

    /**
     * Handle the failure state after all errors have been processed.
     *
     * Called once all errors have been handled individually. Useful for
     * consolidating error state and preparing the failure response.
     *
     * @param failure - The failure result containing all errors and traces
     * @param context - The current request context
     */
    protected abstract handleFailure(
        failure: Failure,
        context: ControllerContext,
    ): void;

    /**
     * Handle the success state after use case execution.
     *
     * Called when the use case executes successfully. Allows processing
     * and formatting the successful result for the response.
     *
     * @param success - The success result containing output data and traces
     * @param context - The current request context
     */
    protected abstract handleSuccess(
        success: Success<TUseCaseResult>,
        context: ControllerContext,
    ): void;

    /**
     * Consolidate context and build the final controller response.
     *
     * Called after all error/success handling to transform the accumulated
     * context into the final response object for the client.
     *
     * @param context - The accumulated request context
     * @returns The final response to send to the client
     */
    protected abstract handleContext(
        context: ControllerContext,
    ): TControllerResult;

    /**
     * Convert the incoming request to use case input parameters.
     *
     * Responsible for:
     * - Validating incoming request data
     * - Extracting and transforming data into use case parameters
     * - Returning validation errors if input is invalid
     *
     * @param request - The incoming request
     * @returns A Result containing either the valid input parameters or validation errors
     */
    protected abstract getUseCaseInput(
        request: PureRequest<TRequester>,
    ): Result<TUseCaseInput>;
}
