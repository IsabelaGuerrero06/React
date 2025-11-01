// src/services/auth/provider/googleProvider.ts

import {
  AuthProvider,
  OAuthConfig,
  OAuthResult,
  ProviderOptions,
} from '../../../types/authTypes';
import { BaseAuthProvider } from './baseProvider';

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
      ...config,
    };
    
    // 🔍 Debug: Verificar configuración al inicializar
    console.log('🔧 GoogleAuthProvider config:', {
      clientId: this.config.clientId,
      redirectUri: this.config.redirectUri,
      scope: this.config.scope,
    });
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;
    try {
      console.log('Google OAuth provider initialized');
      this.initialized = true;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async signIn(options?: ProviderOptions): Promise<OAuthResult> {
    try {
      await this.initialize();

      const state = options?.state || this.generateState();
      const nonce = options?.nonce || this.generateNonce();

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
        access_type: 'offline',
      } as Record<string, string>;

      const authUrl = this.buildAuthUrl(this.AUTH_ENDPOINT, params);

      // 🔍 Debug: Mostrar URL completa antes de abrir popup
      console.log('🔗 Google Auth URL:', authUrl);
      console.log('📍 Redirect URI being sent:', params.redirect_uri);

      if (options?.popup) {
        const popup = this.openPopup(authUrl, 'Google Sign In');
        if (!popup) throw new Error('Failed to open popup window');
        return await this.waitForPopupResult(popup);
      }

      // Si no es popup, redirigir
      window.location.href = authUrl;
      return new Promise(() => {});
    } catch (error) {
      console.error('❌ Google signIn error:', error);
      throw this.handleError(error);
    }
  }

  async signOut(): Promise<void> {
    try {
      this.accessToken = null;
      sessionStorage.removeItem('oauth_state');
      sessionStorage.removeItem('oauth_nonce');
      if (this.accessToken) {
        await fetch(`https://oauth2.googleapis.com/revoke?token=${this.accessToken}`, { method: 'POST' });
      }
      console.log('Google sign out successful');
    } catch (error) {
      console.error('Error signing out:', error);
      throw this.handleError(error);
    }
  }

  async isAuthenticated(): Promise<boolean> {
    return this.accessToken !== null;
  }

  async getAccessToken(): Promise<string | null> {
    return this.accessToken;
  }

  async refreshToken(): Promise<string | null> {
    try {
      const refreshToken = sessionStorage.getItem('refresh_token');
      if (!refreshToken) throw new Error('No refresh token available');

      const response = await fetch(this.TOKEN_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: this.config.clientId,
          refresh_token: refreshToken,
          grant_type: 'refresh_token',
        }),
      });

      if (!response.ok) throw new Error('Failed to refresh token');
      const data = await response.json();
      this.accessToken = data.access_token;
      return this.accessToken;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async exchangeCodeForToken(code: string): Promise<OAuthResult> {
    try {
      const response = await fetch(this.TOKEN_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: this.config.clientId,
          code,
          redirect_uri: this.config.redirectUri,
          grant_type: 'authorization_code',
        }),
      });

      if (!response.ok) throw new Error('Failed to exchange code for token');
      const data = await response.json();
      this.accessToken = data.access_token;
      if (data.refresh_token) sessionStorage.setItem('refresh_token', data.refresh_token);
      return { accessToken: data.access_token, idToken: data.id_token };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getUserInfo(accessToken: string): Promise<any> {
    try {
      const response = await fetch(this.USERINFO_ENDPOINT, { headers: { Authorization: `Bearer ${accessToken}` } });
      if (!response.ok) throw new Error('Failed to get user info');
      return await response.json();
    } catch (error) {
      throw this.handleError(error);
    }
  }
}