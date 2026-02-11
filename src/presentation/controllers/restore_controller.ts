import { RestoreUseCase } from '../../application_boundary/use_cases/restore/use_case';
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
import { RestoreInput } from '../../application_boundary/use_cases/restore/input';

/**
 * Controller for handling restore requests.
 * @template TRequester The requester/actor type for access control
 * @template TId The entity ID type (defaults to string)
 */
export abstract class RestoreController<
    TRequester extends Requester,
    TId = string,
> extends PureController<
    void,
    RestoreUseCase<TRequester, TId>,
    TRequester,
    void
> {
    constructor(
        protected readonly interactor: RestoreUseCase<TRequester, TId>,
        protected readonly translator: Translator,
    ) {
        super(interactor, translator);
    }

    override getUseCaseInput(
        request: HttpRequest<TRequester>,
    ): Result<RestoreInput<TRequester, TId>> {
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
