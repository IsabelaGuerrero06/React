export enum AuthProvider {
  GOOGLE = 'GOOGLE',
  MICROSOFT = 'MICROSOFT',
  GITHUB = 'GITHUB',
}

export type ProviderKey = AuthProvider;

// Configuración básica para un proveedor OAuth
export interface OAuthConfig {
  clientId: string;
  redirectUri: string;
  responseType?: string;
  scope?: string[];
  prompt?: string;
}

// Resultado mínimo esperado de un flujo OAuth
export interface OAuthResult {
  code?: string;
  accessToken?: string;
  idToken?: string;
}

// Opciones al iniciar el flujo (popup o redirect, estado, nonce...)
export interface ProviderOptions {
  popup?: boolean;
  state?: string;
  nonce?: string;
}

// Error estandarizado para providers
export interface AuthError {
  code: string;
  message: string;
  details?: unknown;
}
