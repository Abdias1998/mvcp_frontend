/**
 * Point d'entrée principal pour les services API
 * Exporte uniquement l'API réelle (pas de localStorage)
 */

export { api } from './api.real';
export { httpClient, HttpClient, HttpError } from './httpClient';
export type { ApiResponse } from './httpClient';
