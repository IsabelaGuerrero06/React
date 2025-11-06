// src/services/auth/provider/githubProvider.ts

import {
  AuthProvider,
  OAuthConfig,
  OAuthResult,
  ProviderOptions,
} from '../../../types/authTypes';
import { BaseAuthProvider } from './baseProvider';
import { oauthSessionSync } from '../OAuthSessionSyncService';
import {
  signInWithPopup,
  signOut,
  GithubAuthProvider as FirebaseGithubProvider,
} from 'firebase/auth';
import { auth, githubProvider } from '../../../config/firebaseConfig';

// 👇 Importamos el servicio del backend
import { userService } from '../../../services/userService';
import securityService from '../../../services/securityService';
import { User } from '../../../models/User';

export class GitHubAuthProvider extends BaseAuthProvider {
  readonly provider = AuthProvider.GITHUB;
  readonly config: OAuthConfig;

  constructor(config: OAuthConfig) {
    super();
    this.config = config;
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;
    console.log('🔥 GitHub OAuth provider initialized with Firebase');
    this.initialized = true;
  }

  async signIn(options?: ProviderOptions): Promise<OAuthResult> {
    try {
      await this.initialize();

      console.log('🚀 Starting GitHub sign-in with Firebase popup...');
      
      const result = await signInWithPopup(auth, githubProvider);
      const firebaseUser = result.user;
      const credential = FirebaseGithubProvider.credentialFromResult(result);

      this.accessToken = credential?.accessToken || null;

      console.log('✅ GitHub Firebase auth successful:', {
        userId: firebaseUser.uid,
        email: firebaseUser.email,
        name: firebaseUser.displayName
      });

      // Extraer datos del usuario
      const name: string = firebaseUser.displayName || 'Usuario GitHub';
      const email: string = firebaseUser.email || `${firebaseUser.uid}@github.com`;

      if (!email) {
        throw new Error('No se pudo obtener el email del usuario de GitHub');
      }

      // 🔧 Crear o recuperar usuario en el backend
      const backendUser = await userService.createIfNotExists(name, email);

      if (!backendUser || !backendUser.id) {
        throw new Error('❌ No se pudo crear o recuperar el usuario del backend');
      }

      console.log('✅ Usuario backend:', backendUser);

      // Guardar datos en localStorage
      localStorage.setItem('currentUserId', backendUser.id.toString());
      localStorage.setItem('user', JSON.stringify(backendUser));

      // 🔧 Sincronizar sesión OAuth (solo si tenemos accessToken)
      if (this.accessToken) {
        try {
          await oauthSessionSync.syncOAuthSession(backendUser.id, this.accessToken);
        } catch (syncError) {
          console.error('⚠️ Error sincronizando sesión OAuth:', syncError);
        }
      }

      // Establecer sesión en securityService
      securityService.setSession(backendUser, this.accessToken || '');

      // 🔧 Return explícito y correcto
      return {
        user: {
          id: backendUser.id.toString(),
          email: backendUser.email || email,
          name: backendUser.name || name,
          picture: firebaseUser.photoURL || '',
        },
        accessToken: this.accessToken,
        provider: this.provider,
      } as OAuthResult;

    } catch (error: any) {
      console.error('❌ GitHub sign-in error:', error);
      
      if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('Sign-in cancelled by user');
      }
      if (error.code === 'auth/popup-blocked') {
        throw new Error('Popup blocked by browser. Please allow popups.');
      }
      if (error.code === 'auth/account-exists-with-different-credential') {
        throw new Error('An account already exists with this email using a different sign-in method.');
      }
      
      throw this.handleError(error);
    }
  }

  async signOut(): Promise<void> {
    try {
      await signOut(auth);
      this.accessToken = null;
      // Limpiar localStorage
      localStorage.removeItem('currentUserId');
      localStorage.removeItem('user');
      console.log('✅ GitHub sign out successful');
    } catch (error) {
      console.error('❌ Error signing out:', error);
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
    return null; // Firebase maneja esto automáticamente
  }

  async exchangeCodeForToken(code: string): Promise<OAuthResult> {
    throw new Error('Not needed with Firebase popup flow');
  }

  async getUserInfo(accessToken: string): Promise<any> {
    throw new Error('User info already included in Firebase result');
  }
}