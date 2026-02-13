import { Message } from '@gilles-coudert/pure-trace';
import { Culture } from '../../common/culture';

/**
 * Interface pour la traduction de messages selon une culture spécifique.
 */
export interface Translator {
    /**
     * Traduit un message selon la culture spécifiée.
     * @param message - Le message à traduire
     * @param culture - La culture cible pour la traduction
     */
    translate(message: Message, culture: Culture): void;
}
