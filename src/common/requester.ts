import { Culture } from './culture';

/**
 * Représente un utilisateur qui effectue des requêtes.
 */
export interface Requester {
    /** Identifiant unique du demandeur */
    id: string;
    /** Culture préférée du demandeur pour la localisation */
    preferredCulture: Culture;
}
