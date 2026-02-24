import {
    Result,
    PureError,
    Failure,
    Success,
    ResultAsync,
    pureZodParse,
} from '@gilles-coudert/pure-trace';
import { PureUseCase } from '../application_boundary/pure_use_case';
import { Json, PureParameters } from '../common/parameters';
import { Requester } from '../common/requester';
import { Translator } from '../infrastructure_boundary/i18n/translator';
import { Mapper } from '../infrastructure_boundary/mapping/mapper';
import { PureRequest } from './pure_request';
import z from 'zod';

/**
 * Protocol-agnostic context for tracking state during request handling
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const controllerContextSchema = z.json();
type ControllerContext = z.infer<typeof controllerContextSchema>;

/**
 * Controller interface for handling pure use cases that follow Clean Architecture principles.
 *
 * Provides a contract for protocol-agnostic request handling with:
 * - Automatic request data extraction, validation via Zod schema, and mapping
 * - Use case execution with input parameters
 * - Error and success handling with localization support
 * - Context management throughout the request lifecycle
 *
 * Use the `createPureControllerClass` factory to create an implementation with a Zod schema.
 *
 * @template TControllerResult - The data type returned by the controller (HTTP response, GraphQL result, etc.)
 * @template TRequestData - The validated request data type (DTO from the protocol layer)
 * @template TUseCaseInput - The input parameters type for the use case
 * @template TUseCaseResult - The result type returned by the use case
 * @template TRequester - The requester/actor type for access control and audit (inferred from TUseCaseInput)
 */
export interface PureController<
    TControllerResult,
    TRequestData,
    TUseCaseInput extends PureParameters<TRequester, TUseCaseInputData>,
    TUseCaseInputData extends Json,
    TUseCaseResult,
    TRequester extends Requester = TUseCaseInput extends PureParameters<infer R>
        ? R
        : never,
> {
    /**
     * Handle an incoming request through the complete workflow.
     *
     * @param request - The incoming request with requester information
     * @returns The final controller result
     */
    handle(request: PureRequest<TRequester>): Promise<TControllerResult>;

    /**
     * Extract and validate request data.
     *
     * Responsible for:
     * - Extracting protocol-specific data (HTTP body, query params, headers, GraphQL arguments, etc.)
     * - Validating the extracted data against the Zod schema
     * - Returning either validated data or validation errors
     *
     * @param request - The incoming request
     * @returns A Result containing either validated request data or extraction/validation errors
     */
    extractRequestData(request: PureRequest<TRequester>): Result<TRequestData>;

    /**
     * Initialize context for this request.
     *
     * Called at the beginning of request handling to set up any state needed
     * throughout the request lifecycle (e.g., HTTP headers, session data).
     *
     * @param request - The incoming request with requester information
     * @returns A protocol-agnostic context object for this request
     */
    initContext(request: PureRequest<TRequester>): ControllerContext;

    /**
     * Handle an individual error from the use case execution.
     *
     * Called for each error that occurs during execution. This method allows
     * for granular error processing (e.g., logging, metrics, error mapping).
     *
     * @param error - The error to handle
     * @param context - The current request context for accumulating results
     */
    handleError(error: PureError, context: ControllerContext): void;

    /**
     * Handle the failure state after all errors have been processed.
     *
     * Called once all errors have been handled individually. Useful for
     * consolidating error state and preparing the failure response.
     *
     * @param failure - The failure result containing all errors and traces
     * @param context - The current request context
     */
    handleFailure(failure: Failure, context: ControllerContext): void;

    /**
     * Handle the success state after use case execution.
     *
     * Called when the use case executes successfully. Allows processing
     * and formatting the successful result for the response.
     *
     * @param success - The success result containing output data and traces
     * @param context - The current request context
     */
    handleSuccess(
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
    handleContext(context: ControllerContext): TControllerResult;
}

/**
 * Factory function to create a PureController implementation with a specific Zod schema.
 *
 * This factory allows proper type inference of TRequestData from the Zod schema
 * while maintaining compatibility with dependency injection frameworks.
 *
 * @template TRequestData - The validated request data type (inferred from schema)
 * @template TUseCaseInput - The input parameters type for the use case
 * @template TUseCaseResult - The result type returned by the use case
 * @template TTranslator - The translator service for i18n
 * @template TRequester - The requester/actor type for access control
 * @param requestDataSchema - The Zod schema for validating incoming request data
 * @param interactor - The use case to execute
 * @param translator - The translator service for i18n
 * @param mapper - The mapper from request data to use case input
 * @returns A configured PureController class ready to be extended
 *
 * @example
 * ```typescript
 * const createUserRequestSchema = z.object({
 *   name: z.string().min(1),
 *   email: z.string().email()
 * });
 *
 * const BaseCreateUserController = createPureControllerClass(
 *   createUserRequestSchema,
 *   createUserInteractor,
 *   translator,
 *   requestToInputMapper
 * );
 *
 * class CreateUserController extends BaseCreateUserController<HttpResponse, Admin> {
 *   extractRequestData(request: PureRequest<Admin>): Result<z.infer<typeof createUserRequestSchema>> {
 *     // Extract from HTTP body and validate
 *     return this.validateRequestData(request.body);
 *   }
 *
 *   initContext(request: PureRequest<Admin>): ControllerContext {
 *     return { statusCode: 200, headers: {} };
 *   }
 *
 *   // ... implement other methods
 * }
 * ```
 */
export function createPureController<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    TRequestDataContract extends z.ZodObject<any>,
    TUseCaseInput extends PureParameters<TRequester, TUseCaseInputData>,
    TUseCaseInputData extends Json,
    TUseCaseResult extends Json,
    TRequester extends Requester,
>(
    requestDataSchema: TRequestDataContract,
    interactor: PureUseCase<
        TUseCaseInput,
        TUseCaseInputData,
        TUseCaseResult,
        TRequester
    >,
    translator: Translator,
    mapper: Mapper<z.infer<TRequestDataContract>, TUseCaseInputData>,
) {
    abstract class PureControllerWithSchema<
        TControllerResult,
    > implements PureController<
        TControllerResult,
        z.infer<TRequestDataContract>,
        TUseCaseInput,
        TUseCaseInputData,
        TUseCaseResult,
        TRequester
    > {
        public readonly requestDataSchema = requestDataSchema;
        public readonly interactor = interactor;
        public readonly translator = translator;
        public readonly mapper = mapper;

        async handle(
            request: PureRequest<TRequester>,
        ): Promise<TControllerResult> {
            const context = this.initContext(request);
            const preferredLocale = request.getRequester().preferredLocale;

            const result = await ResultAsync.liftResult(
                //>
                //> > fr: Extraire et valider les données de la requête
                //> > en: Extract and validate request data
                //>
                this.extractRequestData(request)
                    .chainSuccess(
                        //>
                        //> > fr: Valider les données de la requête.
                        //> > en: Validate the request data.
                        //>
                        (requestData) =>
                            pureZodParse(requestData, this.requestDataSchema),
                    )
                    .mapSuccess(
                        //>
                        //> > fr: Mapper les données validées vers l'input du cas d'utilisation
                        //> > en: Map validated data to use case input
                        //>
                        (validatedData) =>
                            new Success({
                                requester: request.getRequester(),
                                payload: this.mapper.to(validatedData),
                            } as TUseCaseInput),
                    ),
            ).chainSuccess((useCaseInput) =>
                this.interactor.execute(useCaseInput),
            );

            //>
            //> > fr: Traduire les traces
            //> > en: Translate the traces
            //>
            for (const trace of result.getTraces()) {
                if (trace.localizedMessage == undefined) {
                    this.translator.translate(trace, preferredLocale);
                }
            }

            if (result.isFailure()) {
                for (const error of result.getErrors()) {
                    //>
                    //> > fr: Traitement de chaque erreur.
                    //> > en: Handling each error.
                    //>
                    if (error.localizedMessage == undefined) {
                        this.translator.translate(error, preferredLocale);
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

        abstract extractRequestData(
            request: PureRequest<TRequester>,
        ): Result<z.infer<TRequestDataContract>>;
        abstract initContext(
            request: PureRequest<TRequester>,
        ): ControllerContext;
        abstract handleError(
            error: PureError,
            context: ControllerContext,
        ): void;
        abstract handleFailure(
            failure: Failure,
            context: ControllerContext,
        ): void;
        abstract handleSuccess(
            success: Success<TUseCaseResult>,
            context: ControllerContext,
        ): void;
        abstract handleContext(context: ControllerContext): TControllerResult;
    }

    return PureControllerWithSchema;
}
