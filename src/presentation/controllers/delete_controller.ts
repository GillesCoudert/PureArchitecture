import { DeleteUseCase } from '../../application_boundary/use_cases/delete/use_case';
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
import { DeleteInput } from '../../application_boundary/use_cases/delete/input';

/**
 * Controller for handling delete requests.
 * @template TRequester The requester/actor type for access control
 * @template TId The entity ID type (defaults to string)
 */
export abstract class DeleteController<
    TRequester extends Requester,
    TId = string,
> extends PureController<
    void,
    DeleteUseCase<TRequester, TId>,
    TRequester,
    void
> {
    constructor(
        protected readonly interactor: DeleteUseCase<TRequester, TId>,
        protected readonly translator: Translator,
    ) {
        super(interactor, translator);
    }

    override getUseCaseInput(
        request: HttpRequest<TRequester>,
    ): Result<DeleteInput<TRequester, TId>> {
        const requester = request.getRequester();
        const id = request.getQueryParameter<TId>('id');
        if (id === undefined) {
            return generateFailure({
                type: 'processError',
                code: 'idNotProvided',
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

    override setResponse(_: HttpResponse, __: void): ApiResponse<void> {
        return {
            success: true,
        };
    }
}
