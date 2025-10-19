import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AuthService from '../../services/authService';
import { 
  AuthProvider, 
  OAuthConfig, 
  OAuthResult,
  ProviderOptions,
  AuthResponse 
} from '../../types/authTypes';

interface UseSocialAuthReturn {
  signInWithProvider: (
    provider: AuthProvider,
    config: OAuthConfig,
    options?: ProviderOptions
  ) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  isProcessingCallback: boolean;
  clearError: () => void;
}

/**
 * Hook personalizado para manejar autenticación OAuth social
 */
export const useSocialAuth = (): UseSocialAuthReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessingCallback, setIsProcessingCallback] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const authService = AuthService.getInstance();

  /**
   * Maneja el callback de OAuth al cargar el componente
   */
  useEffect(() => {
    handleOAuthCallback();
  }, [searchParams]);

  /**
   * Procesa el callback de OAuth si existe en la URL
   */
  const handleOAuthCallback = useCallback(async () => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    const provider = searchParams.get('provider') as AuthProvider;

    // Si no hay parámetros OAuth, no hacer nada
    if (!code && !error) return;

    setIsProcessingCallback(true);
    setError(null);

    try {
      // Si hay error en la URL
      if (error) {
        const errorDescription = searchParams.get('error_description') || error;
        throw new Error(`OAuth error: ${errorDescription}`);
      }

      // Validar parámetros requeridos
      if (!code || !state || !provider) {
        throw new Error('Missing required OAuth parameters');
      }

      // Procesar el callback con el backend
      const response: AuthResponse = await authService.handleOAuthCallback(
        provider,
        code,
        state
      );

      // Verificar respuesta
      if (!response.token || !response.user) {
        throw new Error('Invalid response from server');
      }

      console.log('OAuth sign in successful:', response.user);

      // Limpiar la URL de parámetros OAuth
      window.history.replaceState({}, document.title, window.location.pathname);

      // Redirigir al dashboard
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'OAuth authentication failed';
      setError(errorMessage);
      console.error('OAuth callback error:', err);

      // Redirigir al login con error
      navigate('/sign-in?error=oauth_failed', { replace: true });
    } finally {
      setIsProcessingCallback(false);
    }
  }, [searchParams, navigate, authService]);

  /**
   * Inicia el flujo de autenticación con un proveedor social
   */
  const signInWithProvider = async (
    provider: AuthProvider,
    config: OAuthConfig,
    options?: ProviderOptions
  ): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      // Validar configuración
      if (!config.clientId) {
        throw new Error('Client ID is required');
      }

      if (!config.redirectUri) {
        throw new Error('Redirect URI is required');
      }

      // Agregar el provider a la redirectUri para identificarlo en el callback
      const redirectUriWithProvider = `${config.redirectUri}?provider=${provider}`;
      const configWithProvider = {
        ...config,
        redirectUri: redirectUriWithProvider,
      };

      // Iniciar flujo OAuth
      const result = await authService.signInWithOAuth(
        provider,
        configWithProvider,
        options
      );

      // Si es popup y hay resultado con código
      if (result && options?.popup && result.code) {
        // Procesar el código inmediatamente
        // Usar el code como state ya que en popup mode no hay state separado
        await authService.handleOAuthCallback(provider, result.code, result.code);
        navigate('/dashboard', { replace: true });
      }

      // Si es redirect, la navegación ya ocurrió en el servicio
      // En este caso result será void y no hacemos nada más
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Social sign in failed';
      setError(errorMessage);
      console.error('Social auth error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Limpia el error actual
   */
  const clearError = (): void => {
    setError(null);
  };

  return {
    signInWithProvider,
    isLoading,
    error,
    isProcessingCallback,
    clearError,
  };
};

export default useSocialAuth;