/**
 * Messages d'erreur et de succès standardisés pour l'application
 */

export const ERROR_MESSAGES = {
  // Erreurs réseau
  NETWORK_ERROR: 'Erreur de connexion. Veuillez vérifier votre connexion internet.',
  TIMEOUT: 'La requête a pris trop de temps. Veuillez réessayer.',
  SERVER_ERROR: 'Erreur serveur. Veuillez réessayer plus tard.',
  
  // Erreurs d'authentification
  INVALID_CREDENTIALS: 'Email ou mot de passe incorrect.',
  UNAUTHORIZED: 'Vous n\'êtes pas autorisé à effectuer cette action.',
  SESSION_EXPIRED: 'Votre session a expiré. Veuillez vous reconnecter.',
  
  // Erreurs de validation
  REQUIRED_FIELD: 'Ce champ est requis.',
  INVALID_EMAIL: 'Adresse email invalide.',
  INVALID_PHONE: 'Numéro de téléphone invalide.',
  PASSWORD_TOO_SHORT: 'Le mot de passe doit contenir au moins 8 caractères.',
  
  // Erreurs métier
  DUPLICATE_ENTRY: 'Cette entrée existe déjà.',
  NOT_FOUND: 'Élément non trouvé.',
  CANNOT_DELETE: 'Impossible de supprimer cet élément.',
  
  // Erreurs API
  API_UNAVAILABLE: 'L\'API est temporairement indisponible. L\'application peut prendre jusqu\'à 60 secondes pour se réveiller.',
  API_ERROR: 'Une erreur est survenue lors de la communication avec le serveur.',
};

export const SUCCESS_MESSAGES = {
  // Authentification
  LOGIN_SUCCESS: 'Connexion réussie !',
  LOGOUT_SUCCESS: 'Déconnexion réussie.',
  REGISTER_SUCCESS: 'Inscription réussie. En attente d\'approbation.',
  PASSWORD_RESET_SUCCESS: 'Un email de réinitialisation a été envoyé.',
  
  // CRUD operations
  CREATE_SUCCESS: 'Élément créé avec succès.',
  UPDATE_SUCCESS: 'Élément mis à jour avec succès.',
  DELETE_SUCCESS: 'Élément supprimé avec succès.',
  
  // Spécifiques
  REPORT_SUBMITTED: 'Rapport soumis avec succès.',
  PASTOR_APPROVED: 'Pasteur approuvé avec succès.',
  COMMUNICATION_PUBLISHED: 'Communication publiée avec succès.',
  EVENT_CREATED: 'Événement créé avec succès.',
};

export const INFO_MESSAGES = {
  LOADING: 'Chargement en cours...',
  SAVING: 'Enregistrement en cours...',
  DELETING: 'Suppression en cours...',
  PROCESSING: 'Traitement en cours...',
  
  // API Render
  API_WAKING_UP: 'L\'API est en train de se réveiller. Cela peut prendre jusqu\'à 60 secondes...',
  FIRST_REQUEST_SLOW: 'La première requête peut être lente si l\'API était en veille.',
};

/**
 * Obtenir un message d'erreur convivial à partir d'une erreur
 */
export function getErrorMessage(error: any): string {
  if (!error) return ERROR_MESSAGES.API_ERROR;
  
  // Erreur HTTP
  if (error.status) {
    switch (error.status) {
      case 400:
        return error.message || 'Requête invalide.';
      case 401:
        return ERROR_MESSAGES.UNAUTHORIZED;
      case 403:
        return ERROR_MESSAGES.UNAUTHORIZED;
      case 404:
        return ERROR_MESSAGES.NOT_FOUND;
      case 409:
        return ERROR_MESSAGES.DUPLICATE_ENTRY;
      case 500:
        return ERROR_MESSAGES.SERVER_ERROR;
      case 502:
      case 503:
        return ERROR_MESSAGES.API_UNAVAILABLE;
      case 504:
        return ERROR_MESSAGES.TIMEOUT;
      default:
        return error.message || ERROR_MESSAGES.API_ERROR;
    }
  }
  
  // Erreur réseau
  if (error.message) {
    if (error.message.includes('timeout')) {
      return ERROR_MESSAGES.TIMEOUT;
    }
    if (error.message.includes('network') || error.message.includes('fetch')) {
      return ERROR_MESSAGES.NETWORK_ERROR;
    }
    return error.message;
  }
  
  return ERROR_MESSAGES.API_ERROR;
}

/**
 * Vérifier si une erreur est due à l'API Render en veille
 */
export function isRenderWakeUpError(error: any): boolean {
  if (!error) return false;
  
  return (
    error.status === 502 ||
    error.status === 503 ||
    (error.message && error.message.includes('timeout'))
  );
}

export default {
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  INFO_MESSAGES,
  getErrorMessage,
  isRenderWakeUpError,
};
