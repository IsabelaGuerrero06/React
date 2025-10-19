/**
 * Proveedor de autenticación OAuth
 */
export enum AuthProvider {
  GOOGLE = 'google',
  MICROSOFT = 'microsoft',
  GITHUB = 'github',
}

/**
 * Credenciales de usuario para login tradicional
 */
export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

/**
 * Respuesta del token de autenticación
 */
export interface AuthToken {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
  tokenType?: string;
}

/**
 * Información del usuario autenticado
 */
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  roles?: string[];
  permissions?: string[];
}

/**
 * Respuesta completa de autenticación
 */
export interface AuthResponse {
  token: AuthToken;
  user: AuthUser;
}

/**
 * Configuración OAuth por proveedor
 */
export interface OAuthConfig {
  clientId: string;
  redirectUri: string;
  scope?: string[];
  responseType?: string;
  prompt?: string;
}

/**
 * Resultado de autenticación OAuth
 */
export interface OAuthResult {
  code?: string;
  accessToken?: string;
  idToken?: string;
  error?: string;
  errorDescription?: string;
}

/**
 * Estado de la sesión
 */
export interface SessionState {
  isAuthenticated: boolean;
  user: AuthUser | null;
  token: AuthToken | null;
  loading: boolean;
  error: string | null;
}

/**
 * Opciones de configuración del provider
 */
export interface ProviderOptions {
  popup?: boolean;
  redirect?: boolean;
  state?: string;
  nonce?: string;
}

/**
 * Error de autenticación
 */
export interface AuthError {
  code: string;
  message: string;
  details?: unknown;
}