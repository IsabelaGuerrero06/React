// src/services/auth/providers/microsoftProvider.ts

import { 
  AuthProvider, 
  OAuthConfig, 
  OAuthResult, 
  ProviderOptions 
} from '../../../types/authTypes';
import { BaseAuthProvider } from './baseProvider';

/**
 * Proveedor de autenticación de Microsoft (Azure AD / Entra ID)
 */
export class MicrosoftAuthProvider extends BaseAuthProvider {
  readonly provider = AuthProvider.MICROSOFT;
  readonly config: OAuthConfig;

  private readonly TENANT = 'common'; // Puede ser 'common', 'organizations', 'consumers' o un tenant ID
  private readonly AUTH_ENDPOINT = `https://login.microsoftonline.com/${this.TENANT}/oauth2/v2.0/authorize`;
  private readonly TOKEN_ENDPOINT = `https://login.microsoftonline.com/${this.TENANT}/oauth2/v2.0/token`;
  private readonly LOGOUT_ENDPOINT = `https://login.microsoftonline.com/${this.TENANT}/oauth2/v2.0/logout`;

  constructor(config: OAuthConfig) {
    super();
    this.config = {
      responseType: 'code',
      scope: ['openid', 'email', 'profile', 'User.Read'],
      prompt: 'select_account',
      ...config
    };
  }

  /**
   * Inicializa el proveedor de Microsoft
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Aquí podrías cargar MSAL si lo necesitas
      console.log('Microsoft OAuth provider initialized');
      this.initialized = true;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Inicia el flujo de autenticación de Microsoft
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
        scope: this.config.scope?.join(' ') || 'openid email profile User.Read',
        state,
        nonce,
        prompt: this.config.prompt || 'select_account',
        response_mode: 'query',
      };

      const authUrl = this.buildAuthUrl(this.AUTH_ENDPOINT, params);

      // Si es popup, abrir ventana emergente
      if (options?.popup) {
        const popup = this.openPopup(authUrl, 'Microsoft Sign In');
        if (!popup) {
          throw new Error('Failed to open popup window');
        }
        return await this.waitForPopupResult(popup);
      }

      // Si es redirect, redirigir directamente
      window.location.href = authUrl;
      
      return new Promise(() => {});
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Cierra la sesión de Microsoft
   */
  async signOut(): Promise<void> {
    try {
      this.accessToken = null;
      sessionStorage.removeItem('oauth_state');
      sessionStorage.removeItem('oauth_nonce');
      sessionStorage.removeItem('refresh_token');

      // Redirigir al logout de Microsoft
      const logoutUrl = `${this.LOGOUT_ENDPOINT}?post_logout_redirect_uri=${encodeURIComponent(window.location.origin)}`;
      window.location.href = logoutUrl;

      console.log('Microsoft sign out successful');
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
          scope: this.config.scope?.join(' ') || 'openid email profile User.Read',
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
          scope: this.config.scope?.join(' ') || 'openid email profile User.Read',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error_description || 'Failed to exchange code for token');
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
   * Obtiene la información del usuario de Microsoft Graph
   */
  async getUserInfo(accessToken: string): Promise<any> {
    try {
      const response = await fetch('https://graph.microsoft.com/v1.0/me', {
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