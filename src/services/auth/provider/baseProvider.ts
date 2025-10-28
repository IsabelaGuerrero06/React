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
      // Prefer message-based communication: the popup should redirect to a
      // same-origin receiver page which calls `window.opener.postMessage(...)`.
      const handleMessage = (event: MessageEvent) => {
        try {
          if (event.origin !== window.location.origin) return;
          const data = event.data;
          if (!data || data.type !== 'oauth_callback') return;

          cleanup();
          const { code, error } = data;
          if (error) return reject(new Error(error));
          if (code) return resolve({ code });
          return reject(new Error('No code received'));
        } catch (err) {
          cleanup();
          reject(err);
        }
      };

      window.addEventListener('message', handleMessage);

      // Fallback polling to detect if user closed the popup. Keep it minimal
      // to avoid triggering some browser COOP/COEP warnings.
      const pollInterval = setInterval(() => {
        try {
          if (!popup || popup.closed) {
            cleanup();
            reject(new Error('Popup closed by user'));
          }
        } catch (e) {
          // ignore cross-origin access errors
        }
      }, 500);

      // Timeout after 5 minutes
      const timeout = setTimeout(() => {
        cleanup();
        reject(new Error('Timeout waiting for popup'));
      }, 5 * 60 * 1000);

      function cleanup() {
        clearInterval(pollInterval);
        clearTimeout(timeout);
        window.removeEventListener('message', handleMessage);
        try {
          if (popup && !popup.closed) popup.close();
        } catch (e) {
          // swallow
        }
      }
    });
  }

  abstract initialize(): Promise<void>;
  abstract signIn(options?: ProviderOptions): Promise<OAuthResult>;
  abstract signOut(): Promise<void>;
  abstract isAuthenticated(): Promise<boolean>;
  abstract getAccessToken(): Promise<string | null>;
  abstract refreshToken(): Promise<string | null>;
}
