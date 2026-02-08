import { FindAllUseCase } from '../../application_boundary/use_cases/find_all/use_case';
import { Requester } from '../../common/requester';
import { HttpRequest } from '../http/request';
import { failureToApiResponse } from '../mapping/result_to_api_response';
import { ApiResponse } from '../responses/api_response';
import { HttpResponse } from '../http/response';

/**
 * Controller for handling find all requests.
 * @template TRequester The requester/actor type for access control
 * @template TDto The data transfer object type
 */
export abstract class FindAllController<TRequester extends Requester, TDto> {
    constructor(
        protected readonly interactor: FindAllUseCase<TRequester, TDto>,
    ) {}

    protected async handle(
        request: HttpRequest<TRequester>,
        response: HttpResponse,
    ): Promise<ApiResponse<TDto[]>> {
        //>
        //> > fr: Récupérer le demandeur à partir du contexte de la requête
        //> > en: Get the requester from the request context
        //>
        const requester = request.getRequester();

        //>
        //> > fr: Extraire les paramètres de requête numériques (pagination)
        //> > en: Extract numeric query parameters (pagination)
        //>
        const numericParameterNames = ['pageNumber', 'pageSize'];
        const numericParameters = request.getQueryParameters<number>(
            numericParameterNames,
        );

        //>
        //> > fr: Extraire les paramètres de requête textuels (filtre, tri, presets)
        //> > en: Extract string query parameters (filter, sort, presets)
        //>
        const stringParameterNames = ['filter', 'sort', 'presets'];
        const stringParameters =
            request.getQueryParameters<string>(stringParameterNames);

        const result = await this.interactor.findAll({
            requester,
            pageNumber: numericParameters.pageNumber,
            pageSize: numericParameters.pageSize,
            filter: stringParameters.filter,
            sort: stringParameters.sort,
            presets: stringParameters.presets,
        });

        //>
        //> > fr: Déterminer le code HTTP et la réponse API
        //> > en: Determine the HTTP status code and API response
        //>
        let statusCode: number;
        let apiResponse: ApiResponse<TDto[]>;
        let containsTechnicalIssue = false;
        if (result.isFailure()) {
            for (const error of result.getErrors()) {
                containsTechnicalIssue =
                    containsTechnicalIssue || error.type === 'technicalIssue';
            }
            statusCode = containsTechnicalIssue ? 500 : 400;
            apiResponse = failureToApiResponse(result);
        } else {
            const pageResult = result.value;
            statusCode = 200;
            apiResponse = {
                success: true,
                data: pageResult.items,
                metadata: {
                    pagination: {
                        pageNumber: pageResult.pageNumber,
                        pageSize: pageResult.pageSize,
                        count: pageResult.totalCount,
                    },
                },
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
