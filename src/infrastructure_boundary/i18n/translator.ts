import { Locale, PureMessage } from '@gilles-coudert/pure-trace';

/**
 * Service interface for translating messages to a specific locale.
 *
 * Handles localization of domain messages, errors, and traces based on user preferences.
 * Implementations modify messages in-place by setting the `localizedMessage` property.
 *
 * @example
 * ```typescript
 * class I18nTranslator implements Translator {
 *   translate(message: PureMessage, locale: Locale): void {
 *     const translations = this.getTranslationsFor(locale);
 *     message.localizedMessage = translations[message.code] || message.message;
 *   }
 * }
 * ```
 */
export interface Translator {
    /**
     * Translate a message to the specified locale.
     *
     * Modifies the message in-place by setting its `localizedMessage` property
     * to the translated text appropriate for the given locale.
     *
     * @param message - The message to translate (modified in-place)
     * @param locale - The target locale for translation
     */
    translate(message: PureMessage, locale: Locale): void;
}
