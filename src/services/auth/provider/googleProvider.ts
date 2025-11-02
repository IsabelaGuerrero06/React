// src/services/auth/provider/googleProvider.ts

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
  GoogleAuthProvider as FirebaseGoogleProvider 
} from 'firebase/auth';
import { auth, googleProvider } from '../../../config/firebaseConfig';

export class GoogleAuthProvider extends BaseAuthProvider {
  readonly provider = AuthProvider.GOOGLE;
  readonly config: OAuthConfig;

  constructor(config: OAuthConfig) {
    super();
    // Config solo para compatibilidad, Firebase no lo usa
    this.config = config;
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;
    console.log(' Google OAuth provider initialized with Firebase');
    this.initialized = true;
  }

  //  MÉTODO PRINCIPAL: Igual que Microsoft
  async signIn(options?: ProviderOptions): Promise<OAuthResult> {
    try {
      await this.initialize();
      
    
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const credential = FirebaseGoogleProvider.credentialFromResult(result);

      this.accessToken = credential?.accessToken || null;

      console.log(' Google sign-in successful:', {
        userId: user.uid,
        email: user.email,
        name: user.displayName
      });

  
      return {
        user: {
          id: user.uid,
          email: user.email || '',
          name: user.displayName || '',
          picture: user.photoURL || ''
        },
        accessToken: this.accessToken || null,
        provider: this.provider
      } as any;
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      
      // Mensajes de error más claros
      if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('Sign-in cancelled by user');
      }
      if (error.code === 'auth/popup-blocked') {
        throw new Error('Popup blocked by browser. Please allow popups.');
      }
      
      throw this.handleError(error);
    }
  }

  async signOut(): Promise<void> {
    try {
      await signOut(auth);
      this.accessToken = null;
      console.log(' Google sign out successful');
    } catch (error) {
      console.error(' Error signing out:', error);
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
    // Firebase maneja el refresh automáticamente
    return null;
  }

  // Métodos no usados con Firebase popup
  async exchangeCodeForToken(code: string): Promise<OAuthResult> {
    throw new Error('Not needed with Firebase popup flow');
  }

  async getUserInfo(accessToken: string): Promise<any> {
    throw new Error('User info already included in Firebase result');
  }
}