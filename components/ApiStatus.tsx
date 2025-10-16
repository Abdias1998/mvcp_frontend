import React, { useState, useEffect } from 'react';
import { httpClient } from '../services/httpClient';

interface ApiStatusProps {
  onReady?: () => void;
}

/**
 * Composant pour vérifier l'état de l'API et afficher un message de chargement
 * si l'API Render est en train de se réveiller
 */
export const ApiStatus: React.FC<ApiStatusProps> = ({ onReady }) => {
  const [status, setStatus] = useState<'checking' | 'ready' | 'error'>('checking');
  const [message, setMessage] = useState('Connexion à l\'API...');
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    checkApiStatus();
  }, []);

  const checkApiStatus = async () => {
    try {
      setStatus('checking');
      setMessage('Vérification de la connexion à l\'API...');
      
      // Essayer de ping l'API (vous pouvez créer un endpoint /health dans le backend)
      const startTime = Date.now();
      
      // Pour l'instant, on essaie juste de faire une requête simple
      // Si votre backend a un endpoint /health, utilisez-le à la place
      await httpClient.get('/auth/profile').catch(() => {
        // On s'attend à une erreur 401 si non authentifié, ce qui est OK
        // Cela signifie que l'API répond
      });
      
      const responseTime = Date.now() - startTime;
      
      if (responseTime > 10000) {
        setMessage('L\'API était en veille et vient de se réveiller. Tout est prêt !');
      } else {
        setMessage('Connexion établie avec succès !');
      }
      
      setStatus('ready');
      
      // Attendre 1 seconde avant de notifier que tout est prêt
      setTimeout(() => {
        if (onReady) onReady();
      }, 1000);
      
    } catch (error: any) {
      console.error('Erreur de connexion à l\'API:', error);
      
      if (retryCount < 3) {
        setMessage(`Tentative de reconnexion (${retryCount + 1}/3)...`);
        setRetryCount(retryCount + 1);
        
        // Réessayer après 5 secondes
        setTimeout(() => {
          checkApiStatus();
        }, 5000);
      } else {
        setStatus('error');
        setMessage('Impossible de se connecter à l\'API. Veuillez vérifier votre connexion internet.');
      }
    }
  };

  if (status === 'ready') {
    return null; // Ne rien afficher si tout est prêt
  }

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
        <div className="text-center">
          {status === 'checking' && (
            <>
              <div className="mb-4">
                <svg
                  className="animate-spin h-12 w-12 text-blue-600 mx-auto"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Connexion en cours
              </h3>
              <p className="text-gray-600 mb-4">{message}</p>
              {retryCount > 0 && (
                <div className="text-sm text-gray-500">
                  <p>L'API Render peut prendre jusqu'à 60 secondes pour se réveiller.</p>
                  <p className="mt-1">Merci de votre patience...</p>
                </div>
              )}
            </>
          )}
          
          {status === 'error' && (
            <>
              <div className="mb-4">
                <svg
                  className="h-12 w-12 text-red-600 mx-auto"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Erreur de connexion
              </h3>
              <p className="text-gray-600 mb-4">{message}</p>
              <button
                onClick={() => {
                  setRetryCount(0);
                  checkApiStatus();
                }}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Réessayer
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApiStatus;
