// src/services/auth/providers/githubProvider.ts

import { 
  AuthProvider, 
  OAuthConfig, 
  OAuthResult, 
  ProviderOptions 
} from '../../../types/authTypes';
import { BaseAuthProvider } from './baseProvider';

/**
 * Proveedor de autenticación de GitHub OAuth
 */
export class GitHubAuthProvider extends BaseAuthProvider {
  readonly provider = AuthProvider.GITHUB;
  readonly config: OAuthConfig;

  private readonly AUTH_ENDPOINT = 'https://github.com/login/oauth/authorize';
  private readonly TOKEN_ENDPOINT = 'https://github.com/login/oauth/access_token';
  private readonly USER_ENDPOINT = 'https://api.github.com/user';
  private readonly EMAIL_ENDPOINT = 'https://api.github.com/user/emails';

  constructor(config: OAuthConfig) {
    super();
    this.config = {
      responseType: 'code',
      scope: ['read:user', 'user:email'],
      ...config
    };
  }

  /**
   * Inicializa el proveedor de GitHub
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      console.log('GitHub OAuth provider initialized');
      this.initialized = true;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Inicia el flujo de autenticación de GitHub
   */
  async signIn(options?: ProviderOptions): Promise<OAuthResult> {
    try {
      await this.initialize();

      const state = options?.state || this.generateState();

      // Guardar state en sessionStorage para validación posterior
      sessionStorage.setItem('oauth_state', state);

      const params = {
        client_id: this.config.clientId,
        redirect_uri: this.config.redirectUri,
        scope: this.config.scope?.join(' ') || 'read:user user:email',
        state,
        allow_signup: 'true',
      };

      const authUrl = this.buildAuthUrl(this.AUTH_ENDPOINT, params);

      // Si es popup, abrir ventana emergente
      if (options?.popup) {
        const popup = this.openPopup(authUrl, 'GitHub Sign In');
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
   * Cierra la sesión de GitHub
   */
  async signOut(): Promise<void> {
    try {
      this.accessToken = null;
      sessionStorage.removeItem('oauth_state');
      sessionStorage.removeItem('refresh_token');

      // GitHub no tiene un endpoint de logout específico
      // Solo limpiamos los tokens locales
      console.log('GitHub sign out successful');
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
   * Nota: GitHub no soporta refresh tokens en OAuth Apps estándar
   */
  async refreshToken(): Promise<string | null> {
    // GitHub OAuth Apps no soportan refresh tokens
    // Para GitHub Apps necesitarías usar una instalación diferente
    throw new Error('GitHub OAuth does not support refresh tokens');
  }

  /**
   * Intercambia el código de autorización por tokens
   */
  async exchangeCodeForToken(code: string): Promise<OAuthResult> {
    try {
      const response = await fetch(this.TOKEN_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          client_id: this.config.clientId,
          client_secret: '', // IMPORTANTE: En producción esto debe estar en el backend
          code,
          redirect_uri: this.config.redirectUri,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error_description || 'Failed to exchange code for token');
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error_description || data.error);
      }

      this.accessToken = data.access_token;

      return {
        accessToken: data.access_token,
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Obtiene la información del usuario de GitHub
   */
  async getUserInfo(accessToken: string): Promise<any> {
    try {
      // Obtener información básica del usuario
      const userResponse = await fetch(this.USER_ENDPOINT, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      });

      if (!userResponse.ok) {
        throw new Error('Failed to get user info');
      }

      const userData = await userResponse.json();

      // Si el email es null, intentar obtener emails del usuario
      if (!userData.email) {
        try {
          const emailResponse = await fetch(this.EMAIL_ENDPOINT, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Accept': 'application/vnd.github.v3+json',
            },
          });

          if (emailResponse.ok) {
            const emails = await emailResponse.json();
            // Buscar el email primario y verificado
            const primaryEmail = emails.find((e: any) => e.primary && e.verified);
            if (primaryEmail) {
              userData.email = primaryEmail.email;
            }
          }
        } catch (emailError) {
          console.warn('Failed to fetch user emails:', emailError);
        }
      }

      return userData;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Revoca el acceso del token
   */
  async revokeAccess(accessToken: string): Promise<void> {
    try {
      const response = await fetch(
        `https://api.github.com/applications/${this.config.clientId}/token`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/vnd.github.v3+json',
          },
          body: JSON.stringify({
            access_token: accessToken,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to revoke access');
      }

      console.log('GitHub access revoked successfully');
    } catch (error) {
      throw this.handleError(error);
    }
  }
}