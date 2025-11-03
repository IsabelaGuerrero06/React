import {
  AuthProvider,
  OAuthConfig,
  OAuthResult,
  ProviderOptions,
} from '../../../types/authTypes';
import { BaseAuthProvider } from './baseProvider';

import {
  signInWithPopup,
  signOut,
  OAuthProvider as FirebaseOAuthProvider,
} from 'firebase/auth';
import { auth, microsoftProvider } from '../../../config/firebaseConfig';

// 👇 Importamos el servicio del backend
import { userService } from '../../../services/userService';

export class MicrosoftAuthProvider extends BaseAuthProvider {
  readonly provider = AuthProvider.MICROSOFT;
  readonly config: OAuthConfig;

  constructor(config: OAuthConfig) {
    super();
    this.config = {
      responseType: 'code',
      scope: ['openid', 'email', 'profile', 'User.Read'],
      prompt: 'select_account',
      ...config,
    };
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;
    try {
      console.log('Microsoft OAuth provider initialized');
      this.initialized = true;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async signIn(options?: ProviderOptions): Promise<OAuthResult> {
    try {
      await this.initialize();
      // Use Firebase popup flow — this avoids cross-origin opener/close issues
      const result = await signInWithPopup(auth, microsoftProvider);
      const user = result.user;
      const credential = FirebaseOAuthProvider.credentialFromResult(result);

      this.accessToken = credential?.accessToken || null;

      // 🔽 Nuevo: Crear el usuario en el backend si no existe
      if (user?.email) {
        const backendUser = await userService.createIfNotExists(
          user.displayName || 'Usuario Microsoft',
          user.email,
        );
        if (backendUser && backendUser.id) {
          localStorage.setItem('backendUserId', backendUser.id.toString());
        }
      }

      // Return a normalized OAuthResult that the app expects
      return {
        user: {
          id: user.uid,
          email: user.email || '',
          name: user.displayName || '',
          picture: user.photoURL || '',
        },
        accessToken: this.accessToken || null,
        provider: this.provider,
      } as any;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async signOut(): Promise<void> {
    try {
      await signOut(auth);
      this.accessToken = null;
      console.log('Microsoft sign out successful');
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
    // When using Firebase client SDK (signInWithPopup) token refresh is handled
    // internally by Firebase. If you implement a server-side exchange flow you
    // should refresh tokens on the server and return them here. For now return
    // null to indicate no client-side refresh performed.
    return null;
  }

  async exchangeCodeForToken(code: string): Promise<OAuthResult> {
    // This method is not used when using Firebase popup flow. If you are using
    // the authorization-code + redirect flow you'll need a backend endpoint to
    // securely exchange the code for tokens (do not call the token endpoint
    // directly from the browser with client secret). Throw an explicit error
    // so callers know to use the backend exchange.
    throw new Error(
      'exchangeCodeForToken is not implemented on the client. Use a backend exchange for authorization code flows.',
    );
  }

  async getUserInfo(accessToken: string): Promise<any> {
    try {
      const response = await fetch('https://graph.microsoft.com/v1.0/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!response.ok) throw new Error('Failed to get user info');
      return await response.json();
    } catch (error) {
      throw this.handleError(error);
    }
  }
}
