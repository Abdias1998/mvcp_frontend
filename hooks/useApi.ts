import { useState, useCallback } from 'react';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  execute: (...args: any[]) => Promise<T | null>;
  reset: () => void;
}

/**
 * Hook personnalisé pour gérer les appels API avec état de chargement et erreurs
 * 
 * @example
 * const { data, loading, error, execute } = useApi(api.getReports);
 * 
 * // Dans un useEffect ou un handler
 * await execute(user, dateRange);
 */
export function useApi<T>(
  apiFunction: (...args: any[]) => Promise<T>
): UseApiReturn<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(
    async (...args: any[]): Promise<T | null> => {
      setState({ data: null, loading: true, error: null });

      try {
        const result = await apiFunction(...args);
        setState({ data: result, loading: false, error: null });
        return result;
      } catch (error: any) {
        const errorMessage = error?.message || 'Une erreur est survenue';
        setState({ data: null, loading: false, error: errorMessage });
        console.error('API Error:', error);
        return null;
      }
    },
    [apiFunction]
  );

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return {
    data: state.data,
    loading: state.loading,
    error: state.error,
    execute,
    reset,
  };
}

/**
 * Hook pour gérer plusieurs appels API en parallèle
 * 
 * @example
 * const { execute, loading, errors } = useApiMultiple();
 * 
 * const results = await execute([
 *   () => api.getReports(user, dateRange),
 *   () => api.getCells(user),
 * ]);
 */
export function useApiMultiple() {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const execute = useCallback(
    async (apiFunctions: Array<() => Promise<any>>): Promise<any[]> => {
      setLoading(true);
      setErrors([]);

      try {
        const results = await Promise.allSettled(
          apiFunctions.map((fn) => fn())
        );

        const data: any[] = [];
        const newErrors: string[] = [];

        results.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            data.push(result.value);
          } else {
            const error = result.reason?.message || `Erreur dans l'appel ${index + 1}`;
            newErrors.push(error);
            data.push(null);
          }
        });

        setErrors(newErrors);
        setLoading(false);
        return data;
      } catch (error: any) {
        setErrors([error?.message || 'Une erreur est survenue']);
        setLoading(false);
        return [];
      }
    },
    []
  );

  return {
    execute,
    loading,
    errors,
  };
}

export default useApi;
