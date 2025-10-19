// src/services/auth/providers/googleProvider.ts

import { 
  AuthProvider, 
  OAuthConfig, 
  OAuthResult, 
  ProviderOptions 
} from '../../../types/authTypes';
import { BaseAuthProvider } from './baseProvider';

/**
 * Proveedor de autenticación de Google OAuth 2.0
 */
export class GoogleAuthProvider extends BaseAuthProvider {
  readonly provider = AuthProvider.GOOGLE;
  readonly config: OAuthConfig;

  private readonly AUTH_ENDPOINT = 'https://accounts.google.com/o/oauth2/v2/auth';
  private readonly TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token';
  private readonly USERINFO_ENDPOINT = 'https://www.googleapis.com/oauth2/v2/userinfo';

  constructor(config: OAuthConfig) {
    super();
    this.config = {
      responseType: 'code',
      scope: ['openid', 'email', 'profile'],
      prompt: 'select_account',
      ...config
    };
  }

  /**
   * Inicializa el SDK de Google (opcional, si usas gapi)
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Aquí podrías cargar el SDK de Google si lo necesitas
      // Por ahora usaremos OAuth directo sin SDK
      console.log('Google OAuth provider initialized');
      this.initialized = true;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Inicia el flujo de autenticación de Google
   */
  async signIn(options?: ProviderOptions): Promise<OAuthResult> {
    try {
      await this.initialize();

      const state = options?.state || this.generateState();
      const nonce = options?.nonce || this.generateNonce();

      // Guardar state en sessionStorage para validación posterior
      sessionStorage.setItem('oauth_state', state);
      sessionStorage.setItem('oauth_nonce', nonce);

      const params = {
        client_id: this.config.clientId,
        redirect_uri: this.config.redirectUri,
        response_type: this.config.responseType || 'code',
        scope: this.config.scope?.join(' ') || 'openid email profile',
        state,
        nonce,
        prompt: this.config.prompt || 'select_account',
        access_type: 'offline', // Para obtener refresh token
      };

      const authUrl = this.buildAuthUrl(this.AUTH_ENDPOINT, params);

      // Si es popup, abrir ventana emergente
      if (options?.popup) {
        const popup = this.openPopup(authUrl, 'Google Sign In');
        if (!popup) {
          throw new Error('Failed to open popup window');
        }
        return await this.waitForPopupResult(popup);
      }

      // Si es redirect, redirigir directamente
      window.location.href = authUrl;
      
      // Retornar una promesa que nunca se resuelve ya que redireccionamos
      return new Promise(() => {});
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Cierra la sesión de Google
   */
  async signOut(): Promise<void> {
    try {
      this.accessToken = null;
      sessionStorage.removeItem('oauth_state');
      sessionStorage.removeItem('oauth_nonce');
      
      // Opcional: Revocar el token
      if (this.accessToken) {
        await fetch(
          `https://oauth2.googleapis.com/revoke?token=${this.accessToken}`,
          { method: 'POST' }
        );
      }

      console.log('Google sign out successful');
    } catch (error) {
      console.error('Error signing out:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Verifica si el usuario está autenticado
   */
  async isAuthenticated(): Promise<boolean> {
    return this.accessToken !== null;
  }

  /**
   * Obtiene el token de acceso actual
   */
  async getAccessToken(): Promise<string | null> {
    return this.accessToken;
  }

  /**
   * Refresca el token de acceso
   */
  async refreshToken(): Promise<string | null> {
    try {
      const refreshToken = sessionStorage.getItem('refresh_token');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await fetch(this.TOKEN_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: this.config.clientId,
          refresh_token: refreshToken,
          grant_type: 'refresh_token',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }

      const data = await response.json();
      this.accessToken = data.access_token;
      
      return this.accessToken;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Intercambia el código de autorización por tokens
   */
  async exchangeCodeForToken(code: string): Promise<OAuthResult> {
    try {
      const response = await fetch(this.TOKEN_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: this.config.clientId,
          code,
          redirect_uri: this.config.redirectUri,
          grant_type: 'authorization_code',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to exchange code for token');
      }

      const data = await response.json();
      this.accessToken = data.access_token;

      // Guardar refresh token si está disponible
      if (data.refresh_token) {
        sessionStorage.setItem('refresh_token', data.refresh_token);
      }

      return {
        accessToken: data.access_token,
        idToken: data.id_token,
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Obtiene la información del usuario
   */
  async getUserInfo(accessToken: string): Promise<any> {
    try {
      const response = await fetch(this.USERINFO_ENDPOINT, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to get user info');
      }

      return await response.json();
    } catch (error) {
      throw this.handleError(error);
    }
  }
}