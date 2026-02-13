import z from 'zod';

/**
 * Schéma de validation pour une culture/localisation.
 * Format: code de langue ISO 639-1 (2 lettres minuscules) optionnellement suivi d'un code de région ISO 3166-1 (2 lettres majuscules)
 * Exemples: "en", "fr", "en-US", "fr-FR"
 */
export const cultureSchema = z.string().regex(/^[a-z]{2}(-[A-Z]{2})?$/);

/**
 * Représente une culture/localisation (langue et région).
 */
export type Culture = z.infer<typeof cultureSchema>;
