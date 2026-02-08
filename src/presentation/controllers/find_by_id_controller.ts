import { generateFailure } from '@gilles-coudert/pure-trace';
import { FindByIdUseCase } from '../../application_boundary/use_cases/find_by_id/use_case';
import { Requester } from '../../common/requester';
import { HttpRequest } from '../http/request';
import { failureToApiResponse } from '../mapping/result_to_api_response';
import { ApiResponse } from '../responses/api_response';
import { HttpResponse } from '../http/response';

export abstract class FindByIdController<
    TRequester extends Requester,
    TDto,
    TId = string,
> {
    constructor(
        protected readonly interactor: FindByIdUseCase<TRequester, TDto, TId>,
    ) {}

    protected async handle(
        request: HttpRequest<TRequester>,
        response: HttpResponse,
    ): Promise<ApiResponse<TDto>> {
        //>
        //> > fr: Récupérer le demandeur à partir du contexte de la requête
        //> > en: Get the requester from the request context
        //>
        const requester = request.getRequester();
        //>
        //> > fr: Récupérer la ressource par son ID
        //> > en: Retrieve the resource by its ID
        //>
        const id = request.getQueryParameter<TId>('id');
        let result;
        if (id === undefined) {
            result = generateFailure('processError', 'idNotProvided', {});
        } else {
            result = await this.interactor.findById({
                requester,
                id,
            });
        }
        //>
        //> > fr: Déterminer le code HTTP et la réponse API
        //> > en: Determine the HTTP status code and API response
        //>
        let statusCode: number;
        let apiResponse: ApiResponse<TDto>;
        let containsTechnicalIssue = false;
        if (result.isFailure()) {
            for (const error of result.getErrors()) {
                switch (error.code) {
                    case 'notFound':
                        statusCode = 404;
                        break;
                }
                containsTechnicalIssue =
                    containsTechnicalIssue || error.type === 'technicalIssue';
            }
            statusCode = containsTechnicalIssue ? 500 : 400;
            apiResponse = failureToApiResponse(result);
        } else {
            statusCode = 200;
            apiResponse = {
                success: true,
                data: result.value,
            };
        }
        //>
        //> > fr: Envoyer la réponse HTTP
        //> > en: Send the HTTP response
        //>
        response.setStatus(statusCode);
        return apiResponse;
    }
}
