import { ResultAsync } from '@gilles-coudert/pure-trace';
import { Requester } from '../../common/requester';
import { PureParameters } from '../../common/parameters';

export interface PureUseCase<TRequester extends Requester, TResult> {
    execute(input: PureParameters<TRequester>): ResultAsync<TResult>;
}
