import z from 'zod';

/**
 * Schema for validating culture/locale codes.
 *
 * Accepts ISO 639-1 language codes (2 lowercase letters) optionally followed by
 * ISO 3166-1 region codes (2 uppercase letters), separated by a dash.
 *
 * @example
 * ```typescript
 * const validCultures: Culture[] = [
 *   'en',      // English (generic)
 *   'fr',      // French (generic)
 *   'en-US',   // English (United States)
 *   'en-GB',   // English (Great Britain)
 *   'pt-BR',   // Portuguese (Brazil)
 *   'zh-CN',   // Chinese (Mainland China)
 * ];
 * ```
 */
export const cultureSchema = z.string().regex(/^[a-z]{2}(-[A-Z]{2})?$/);

/**
 * Culture/locale code for internationalization (i18n).
 *
 * Represents a combination of language and optionally region:
 * - **Language** (required): ISO 639-1 code (2 lowercase letters)
 * - **Region** (optional): ISO 3166-1 code (2 uppercase letters)
 *
 * Used to:
 * - Select the appropriate language for user messages
 * - Format dates, numbers, currency according to locale conventions
 * - Render content specific to a region/culture
 *
 * @example
 * ```typescript
 * const userCulture: Culture = 'fr-FR'; // French, France
 * const genericEnglish: Culture = 'en';  // English (any region)
 * ```
 */
export type Culture = z.infer<typeof cultureSchema>;
