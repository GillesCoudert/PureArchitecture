import { Message, ResultAsync } from '@gilles-coudert/pure-trace';
import { Culture } from '../../common/culture';

export interface Translater {
    translate(message: Message, culture: Culture): ResultAsync<Message>;
}
