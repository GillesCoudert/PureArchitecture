import { Message } from '@gilles-coudert/pure-trace';
import { Culture } from '../../common/culture';

/**
 * Service interface for translating messages to a specific culture.
 *
 * Handles localization of domain messages, errors, and traces based on user preferences.
 * Implementations modify messages in-place by setting the `localizedMessage` property.
 *
 * @example
 * ```typescript
 * class I18nTranslator implements Translator {
 *   translate(message: Message, culture: Culture): void {
 *     const translations = this.getTranslationsFor(culture);
 *     message.localizedMessage = translations[message.code] || message.message;
 *   }
 * }
 * ```
 */
export interface Translator {
    /**
     * Translate a message to the specified culture.
     *
     * Modifies the message in-place by setting its `localizedMessage` property
     * to the translated text appropriate for the given culture.
     *
     * @param message - The message to translate (modified in-place)
     * @param culture - The target culture for translation
     */
    translate(message: Message, culture: Culture): void;
}
