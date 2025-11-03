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
import securityService from '../../../services/securityService'; // 🔥 añadido
import { User } from '../../../models/User';

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

      // 🔹 Iniciar sesión con Microsoft via Firebase
      const result = await signInWithPopup(auth, microsoftProvider);
      const firebaseUser = result.user;
      const credential = FirebaseOAuthProvider.credentialFromResult(result);

      this.accessToken = credential?.accessToken || null;

      // 🔹 Extraer datos del usuario desde Firebase
      const name: string = firebaseUser.displayName || 'Sin nombre';
      const email: string = firebaseUser.email || `${firebaseUser.uid}@microsoft.com`; // fallback si no hay email

      if (!email) {
        console.warn('⚠️ No se encontró email en el usuario de Microsoft');
      }

      // 🔹 Crear o recuperar usuario en el backend
      const backendUser: User | null = await userService.createIfNotExists(name, email);

      if (!backendUser) {
        throw new Error('❌ No se pudo crear o recuperar el usuario del backend');
      }

      console.log('✅ Usuario backend:', backendUser);

      // 🔹 Guardar datos en localStorage
      if (backendUser.id) {
        localStorage.setItem('currentUserId', backendUser.id.toString());
      }
      localStorage.setItem('user', JSON.stringify(backendUser));

      // 🔹 Establecer sesión en securityService
      securityService.setSession(backendUser, this.accessToken || '');

      // 🔹 Retornar resultado unificado
      return {
        user: {
          id: backendUser.id || firebaseUser.uid,
          email: backendUser.email || email,
          name: backendUser.name || name,
          picture: firebaseUser.photoURL || '',
        },
        accessToken: this.accessToken || null,
        provider: this.provider,
      } as OAuthResult;

    } catch (error) {
      console.error('❌ Error en Microsoft signIn:', error);
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
    return null;
  }

  async exchangeCodeForToken(code: string): Promise<OAuthResult> {
    throw new Error(
      'exchangeCodeForToken is not implemented on the client. Use a backend exchange for authorization code flows.'
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