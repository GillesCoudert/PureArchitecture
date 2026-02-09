import {
    Error,
    generateFailure,
    Result,
    Success,
} from '@gilles-coudert/pure-trace';
import { FindByIdUseCase } from '../../application_boundary/use_cases/find_by_id/use_case';
import { Requester } from '../../common/requester';
import { HttpRequest } from '../http/request';
import { ApiResponse } from '../responses/api_response';
import { HttpResponse } from '../http/response';
import { PureController } from './pure_controller';
import { Translator } from '../../infrastructure_boundary/i18n/translator';
import { FindByIdInput } from '../../application_boundary/use_cases/find_by_id/input';

export abstract class FindByIdController<
    TRequester extends Requester,
    TDto,
    TId = string,
> extends PureController<
    FindByIdUseCase<TRequester, TDto, TId>,
    TDto,
    TRequester,
    TDto
> {
    constructor(
        protected readonly interactor: FindByIdUseCase<TRequester, TDto, TId>,
        protected readonly translator: Translator,
    ) {
        super(interactor, translator);
    }

    override getUseCaseInput(
        request: HttpRequest<TRequester>,
    ): Result<FindByIdInput<TRequester, TId>> {
        const requester = request.getRequester();
        const id = request.getQueryParameter<TId>('id');
        if (id === undefined) {
            return generateFailure({
                type: 'processError',
                code: 'idNotProvided',
                data: {},
            });
        }
        return new Success({
            requester,
            id,
        });
    }

    override checkError(error: Error): number | undefined {
        switch (error.code) {
            case 'notFound':
                return 404;
        }
    }

    override setResponse(
        response: HttpResponse,
        useCaseResult: TDto,
    ): ApiResponse<TDto> {
        return {
            success: true,
            data: useCaseResult,
        };
    }
}
