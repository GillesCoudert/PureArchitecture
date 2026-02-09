import { Message } from '@gilles-coudert/pure-trace';
import { Culture } from '../../common/culture';

export interface Translator {
    translate(message: Message, culture: Culture): void;
}
