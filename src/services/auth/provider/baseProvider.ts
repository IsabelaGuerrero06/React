// src/services/auth/provider/baseProvider.ts

import {
  AuthProvider,
  OAuthConfig,
  OAuthResult,
  ProviderOptions,
  AuthError,
} from '../../../types/authTypes';

/**
 * Interface base para todos los proveedores OAuth
 */
export interface IAuthProvider {
  readonly provider: AuthProvider;
  readonly config: OAuthConfig;

  initialize(): Promise<void>;
  signIn(options?: ProviderOptions): Promise<OAuthResult>;
  signOut(): Promise<void>;
  isAuthenticated(): Promise<boolean>;
  getAccessToken(): Promise<string | null>;
  refreshToken(): Promise<string | null>;
}

/**
 * Clase abstracta base para implementar proveedores OAuth
 */
export abstract class BaseAuthProvider implements IAuthProvider {
  abstract readonly provider: AuthProvider;
  abstract readonly config: OAuthConfig;

  protected initialized = false;
  protected accessToken: string | null = null;

  protected generateState(): string {
    return Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);
  }

  protected generateNonce(): string {
    return Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);
  }

  protected buildAuthUrl(authEndpoint: string, params: Record<string, string>): string {
    const url = new URL(authEndpoint);
    Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, value));
    return url.toString();
  }

  protected handleError(error: unknown): AuthError {
    if (error instanceof Error) {
      return {
        code: 'AUTH_ERROR',
        message: error.message,
        details: error,
      };
    }
    return {
      code: 'UNKNOWN_ERROR',
      message: 'An unknown error occurred',
      details: error,
    };
  }

  protected openPopup(url: string, title: string): Window | null {
    const width = 500;
    const height = 600;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    return window.open(
      url,
      title,
      `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no`
    );
  }

  protected waitForPopupResult(popup: Window): Promise<OAuthResult> {
    return new Promise((resolve, reject) => {
      const interval = setInterval(() => {
        try {
          if (popup.closed) {
            clearInterval(interval);
            reject(new Error('Popup closed by user'));
            return;
          }
          const popupUrl = popup.location.href;
          if (popupUrl.includes(this.config.redirectUri)) {
            const url = new URL(popupUrl);
            const code = url.searchParams.get('code');
            const error = url.searchParams.get('error');

            clearInterval(interval);
            popup.close();

            if (error) {
              reject(new Error(error));
            } else if (code) {
              resolve({ code });
            } else {
              reject(new Error('No code received'));
            }
          }
        } catch (e) {
          // Cross-origin errors are expected while provider shows its page
        }
      }, 500);
    });
  }

  abstract initialize(): Promise<void>;
  abstract signIn(options?: ProviderOptions): Promise<OAuthResult>;
  abstract signOut(): Promise<void>;
  abstract isAuthenticated(): Promise<boolean>;
  abstract getAccessToken(): Promise<string | null>;
  abstract refreshToken(): Promise<string | null>;
}
