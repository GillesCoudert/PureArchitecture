import { Requester } from '../../common/requester';
import { HttpRequest } from '../http/request';
import { failureToApiResponse } from '../mapping/result_to_api_response';
import { ApiResponse } from '../responses/api_response';
import { HttpResponse } from '../http/response';
import { PureUseCase } from '../../application_boundary/use_cases/pure_use_case';
import { Error, Result, ResultAsync } from '@gilles-coudert/pure-trace';
import { Translator } from '../../infrastructure_boundary/i18n/translator';

/**
 * Abstract controller for handling pure use cases that follow Clean Architecture principles.
 * @template TRequester The requester/actor type for access control
 * @template TUseCaseResult The result type returned by the use case
 */
export abstract class PureController<
    TInteractor extends PureUseCase<TRequester, TUseCaseResult>,
    TApiResult,
    TRequester extends Requester,
    TUseCaseResult,
> {
    constructor(
        protected readonly interactor: TInteractor,
        protected readonly translator: Translator,
    ) {}

    protected async handle(
        request: HttpRequest<TRequester>,
        response: HttpResponse,
    ): Promise<ApiResponse<TApiResult>> {
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

        //>
        //> > fr: Déterminer le code HTTP et la réponse API
        //> > en: Determine the HTTP status code and API response
        //>
        let statusCode: number | undefined = undefined;
        let apiResponse: ApiResponse<TApiResult>;
        let containsTechnicalIssue = false;
        if (result.isFailure()) {
            for (const error of result.getErrors()) {
                containsTechnicalIssue =
                    containsTechnicalIssue || error.type === 'technicalIssue';
                if (error.localizedMessage == undefined) {
                    this.translator.translate(error, preferredCulture);
                }
                if (statusCode === undefined) {
                    statusCode = this.checkError(error);
                }
            }
            //>
            //> > fr: Les erreurs techniques ne sont pas corrigeables par le requérant => 500
            //> > en: Technical errors are not correctable by the requester => 500
            //>
            statusCode = containsTechnicalIssue ? 500 : (statusCode ?? 400);
            apiResponse = failureToApiResponse(result);
        } else {
            //>
            //> > fr: Par défaut, le code de statut est 200. Il peut être redéfini par setResponse si nécessaire.
            //> > en: By default, the status code is 200. It can be overridden by setResponse if needed.
            //>
            statusCode = 200;
            apiResponse = this.setResponse(response, result.value);
        }

        //>
        //> > fr: Envoyer la réponse HTTP
        //> > en: Send the HTTP response
        //>
        response.setStatus(statusCode);
        return apiResponse;
    }

    abstract getUseCaseInput(
        request: HttpRequest<TRequester>,
    ): Result<Parameters<TInteractor['execute']>[0]>;

    abstract checkError(error: Error): number | undefined;

    abstract setResponse(
        response: HttpResponse,
        useCaseResult: TUseCaseResult,
    ): ApiResponse<TApiResult>;
}
