import { UpdateUseCase } from '../../application_boundary/use_cases/update/use_case';
import { Requester } from '../../common/requester';
import { HttpRequest } from '../http/request';
import { ApiResponse } from '../responses/api_response';
import { HttpResponse } from '../http/response';
import { PureController } from './pure_controller';
import { Translator } from '../../infrastructure_boundary/i18n/translator';
import {
    Error,
    generateFailure,
    Result,
    Success,
} from '@gilles-coudert/pure-trace';
import { UpdateInput } from '../../application_boundary/use_cases/update/input';
import { Mapper } from '../../infrastructure_boundary/mapping/mapper';

/**
 * Controller for handling update requests.
 * @template TRequester The requester/actor type for access control
 * @template TForm The type of the request body (form)
 * @template TInputData The type of the input data for the use case
 * @template TDto The data transfer object type
 * @template TId The entity ID type (defaults to string)
 */
export abstract class UpdateController<
    TRequester extends Requester,
    TForm,
    TInputData,
    TDto,
    TId = string,
> extends PureController<
    TDto,
    UpdateUseCase<TRequester, TInputData, TDto, TId>,
    TRequester,
    TDto
> {
    constructor(
        protected readonly interactor: UpdateUseCase<
            TRequester,
            TInputData,
            TDto,
            TId
        >,
        protected readonly translator: Translator,
        protected readonly mapper: Mapper<TForm, TInputData>,
    ) {
        super(interactor, translator);
    }

    override getUseCaseInput(
        request: HttpRequest<TRequester>,
    ): Result<UpdateInput<TRequester, TInputData, TId>> {
        const requester = request.getRequester();
        const form = request.getBody<TForm>();
        const id = request.getQueryParameter<TId>('id');
        if (id === undefined) {
            return generateFailure({
                type: 'processError',
                code: 'idNotProvided',
            });
        }
        const data = this.mapper.to(form);
        return new Success({
            requester,
            id,
            data,
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
