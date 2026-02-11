import { FindAllUseCase } from '../../application_boundary/use_cases/find_all/use_case';
import { Requester } from '../../common/requester';
import { HttpRequest } from '../http/request';
import { ApiResponse } from '../responses/api_response';
import { HttpResponse } from '../http/response';
import { PureController } from './pure_controller';
import { PageResult } from '../../common/page_result';
import { Translator } from '../../infrastructure_boundary/i18n/translator';
import { Error, Result, Success } from '@gilles-coudert/pure-trace';
import { FindAllInput } from '../../application_boundary/use_cases/find_all/input';

/**
 * Controller for handling find all requests.
 * @template TRequester The requester/actor type for access control
 * @template TDto The data transfer object type
 */
export abstract class FindAllController<
    TRequester extends Requester,
    TDto,
> extends PureController<
    TDto[],
    FindAllUseCase<TRequester, TDto>,
    TRequester,
    PageResult<TDto>
> {
    constructor(
        protected readonly interactor: FindAllUseCase<TRequester, TDto>,
        protected readonly translator: Translator,
    ) {
        super(interactor, translator);
    }

    override getUseCaseInput(
        request: HttpRequest<TRequester>,
    ): Result<FindAllInput<TRequester>> {
        const requester = request.getRequester();
        return new Success({
            requester,
            pageNumber: request.getQueryParameter<number>('pageNumber'),
            pageSize: request.getQueryParameter<number>('pageSize'),
            filter: request.getQueryParameter<string>('filter'),
            sort: request.getQueryParameter<string>('sort'),
            presets: request.getQueryParameter<string>('presets'),
        });
    }

    override checkError(_: Error): number | undefined {
        return undefined;
    }

    override setResponse(
        response: HttpResponse,
        useCaseResult: PageResult<TDto>,
    ): ApiResponse<TDto[]> {
        return {
            success: true,
            data: useCaseResult.items,
            metadata: {
                pagination: {
                    pageNumber: useCaseResult.pageNumber,
                    pageSize: useCaseResult.pageSize,
                    count: useCaseResult.totalCount,
                },
            },
        };
    }
}
