import { CreateUseCase } from '../../application_boundary/use_cases/create/use_case';
import { Requester } from '../../common/requester';
import { HttpRequest } from '../http/request';
import { ApiResponse } from '../responses/api_response';
import { HttpResponse } from '../http/response';
import { PureController } from './pure_controller';
import { Translator } from '../../infrastructure_boundary/i18n/translator';
import { Error, Result, Success } from '@gilles-coudert/pure-trace';
import { CreateInput } from '../../application_boundary/use_cases/create/input';
import { Mapper } from '../../infrastructure_boundary/mapping/mapper';

/**
 * Controller for handling create requests.
 * @template TRequester The requester/actor type for access control
 * @template TForm The type of the request body (form)
 * @template TDto The data transfer object type
 */

export abstract class CreateController<
    TRequester extends Requester,
    TForm,
    TInputData,
    TDto,
> extends PureController<
    TDto,
    CreateUseCase<TRequester, TInputData, TDto>,
    TRequester,
    TDto
> {
    constructor(
        protected readonly interactor: CreateUseCase<
            TRequester,
            TInputData,
            TDto
        >,
        protected readonly translator: Translator,
        protected readonly mapper: Mapper<TForm, TInputData>,
    ) {
        super(interactor, translator);
    }

    override getUseCaseInput(
        request: HttpRequest<TRequester>,
    ): Result<CreateInput<TRequester, TInputData>> {
        const requester = request.getRequester();
        const form = request.getBody<TForm>();
        const data = this.mapper.to(form);
        return new Success({
            requester,
            data,
        });
    }

    override checkError(_: Error): number | undefined {
        return undefined;
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
