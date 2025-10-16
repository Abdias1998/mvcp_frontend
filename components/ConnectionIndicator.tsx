import React, { useState, useEffect } from 'react';
import { httpClient } from '../services/httpClient';

/**
 * Indicateur de connexion à l'API affiché dans le coin de l'écran
 */
export const ConnectionIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [isChecking, setIsChecking] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date>(new Date());

  useEffect(() => {
    // Vérifier la connexion toutes les 30 secondes
    const interval = setInterval(() => {
      checkConnection();
    }, 30000);

    // Vérifier immédiatement au montage
    checkConnection();

    // Écouter les événements online/offline du navigateur
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const checkConnection = async () => {
    setIsChecking(true);
    try {
      // Essayer une requête simple pour vérifier la connexion
      await httpClient.get('/auth/profile').catch(() => {
        // 401 est OK, cela signifie que l'API répond
      });
      setIsOnline(true);
      setLastCheck(new Date());
    } catch (error) {
      setIsOnline(false);
    } finally {
      setIsChecking(false);
    }
  };

  const handleOnline = () => {
    setIsOnline(true);
    checkConnection();
  };

  const handleOffline = () => {
    setIsOnline(false);
  };

  // Ne rien afficher si tout va bien
  if (isOnline && !isChecking) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div
        className={`
          flex items-center space-x-2 px-4 py-2 rounded-lg shadow-lg
          ${isOnline ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}
        `}
      >
        {isChecking ? (
          <>
            <svg
              className="animate-spin h-4 w-4"
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
            <span className="text-sm font-medium">Vérification...</span>
          </>
        ) : (
          <>
            <svg
              className="h-4 w-4"
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
            <span className="text-sm font-medium">
              {isOnline ? 'Reconnexion...' : 'Hors ligne'}
            </span>
            <button
              onClick={checkConnection}
              className="ml-2 text-xs underline hover:no-underline"
            >
              Réessayer
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ConnectionIndicator;
