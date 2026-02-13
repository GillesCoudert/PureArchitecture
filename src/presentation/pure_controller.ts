import {
    ResultAsync,
    Result,
    Error,
    Failure,
    Success,
} from '@gilles-coudert/pure-trace';
import { PureUseCase } from '../application_boundary/pure_use_case';
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
 * @template TControllerResult The data type returned by the controller
 * @template TInteractor The interactor/use case type
 * @template TRequester The requester/actor type for access control
 * @template TUseCaseResult The result type returned by the use case
 * @template TTranslator The translator for i18n
 */
export abstract class PureController<
    TControllerResult,
    TInteractor extends PureUseCase<TRequester, TUseCaseResult>,
    TRequester extends Requester,
    TUseCaseResult,
    TTranslator extends Translator,
> {
    constructor(
        protected readonly interactor: TInteractor,
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
     * Initialize context for this request
     */
    protected abstract initContext(
        request: PureRequest<TRequester>,
    ): ControllerContext;

    /**
     * Handle individual errors - allows per-error processing
     */
    protected abstract handleError(
        error: Error,
        context: ControllerContext,
    ): void;

    /**
     * Handle failure state - consolidate context after all errors are processed
     */
    protected abstract handleFailure(
        failure: Failure,
        context: ControllerContext,
    ): void;

    /**
     * Handle success state - prepare context for successful response
     */
    protected abstract handleSuccess(
        success: Success<TUseCaseResult>,
        context: ControllerContext,
    ): void;

    /**
     * Consolidate context and build the final controller response
     * Allows final adjustments to context before returning the response
     */
    protected abstract handleContext(
        context: ControllerContext,
    ): TControllerResult;

    protected abstract getUseCaseInput(
        request: PureRequest<TRequester>,
    ): Result<Parameters<TInteractor['execute']>[0]>;
}
