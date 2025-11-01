// src/config/auth.config.ts

import { AuthProvider, OAuthConfig } from '../types/authTypes';

/**
 * Configuración de autenticación de la aplicación
 * IMPORTANTE: Las credenciales sensibles deben estar en variables de entorno
 */

// ==================== CONFIGURACIÓN GENERAL ====================

export const authConfig = {
  /**
   * URL base de la API
   */
  apiBaseUrl: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',

  /**
   * Tiempo de expiración de sesión (en milisegundos)
   */
  sessionTimeout: 30 * 60 * 1000, // 30 minutos

  /**
   * Tiempo antes de expiración para refrescar token (en segundos)
   */
  tokenRefreshThreshold: 5 * 60, // 5 minutos

  /**
   * Habilitar refresh automático de tokens
   */
  autoRefreshToken: true,

  /**
   * Habilitar remember me
   */
  enableRememberMe: true,

  /**
   * Duración de remember me (en días)
   */
  rememberMeDuration: 30,

  /**
   * Redireccionamiento después de login exitoso
   */
  defaultRedirectAfterLogin: '/dashboard',

  /**
   * Redireccionamiento después de logout
   */
  defaultRedirectAfterLogout: '/sign-in',

  /**
   * Redireccionamiento cuando no está autenticado
   */
  unauthenticatedRedirect: '/sign-in',

  /**
   * Redireccionamiento cuando no está autorizado
   */
  unauthorizedRedirect: '/unauthorized',
};

// ==================== CONFIGURACIÓN OAUTH ====================

/**
 * Configuración para Google OAuth
 */
export const googleOAuthConfig: OAuthConfig = {
  clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
  redirectUri: import.meta.env.VITE_GOOGLE_REDIRECT_URI || 'http://localhost:5173/auth/callback',
  scope: ['openid', 'email', 'profile'],
  responseType: 'code',
  prompt: 'select_account',
};

/**
 * Configuración para Microsoft OAuth
 */
export const microsoftOAuthConfig: OAuthConfig = {
  clientId: import.meta.env.VITE_MICROSOFT_CLIENT_ID || '',
  redirectUri: import.meta.env.VITE_MICROSOFT_REDIRECT_URI || 'http://localhost:5173/auth/callback',
  scope: ['openid', 'email', 'profile', 'User.Read'],
  responseType: 'code',
  prompt: 'select_account',
};

/**
 * Configuración para GitHub OAuth
 */
export const githubOAuthConfig: OAuthConfig = {
  clientId: import.meta.env.VITE_GITHUB_CLIENT_ID || '',
  redirectUri: import.meta.env.VITE_GITHUB_REDIRECT_URI || 'http://localhost:5173/auth/callback',
  scope: ['read:user', 'user:email'],
  responseType: 'code',
};

/**
 * Mapa de configuraciones OAuth por proveedor
 */
export const oauthConfigs: Record<AuthProvider, OAuthConfig> = {
  [AuthProvider.GOOGLE]: googleOAuthConfig,
  [AuthProvider.MICROSOFT]: microsoftOAuthConfig,
  [AuthProvider.GITHUB]: githubOAuthConfig,
};

/**
 * Obtiene la configuración OAuth de un proveedor específico
 */
export const getOAuthConfig = (provider: AuthProvider): OAuthConfig => {
  const config = oauthConfigs[provider];
  if (!config || !config.clientId) {
    throw new Error(`OAuth configuration not found for provider: ${provider}`);
  }
  return config;
};

// ==================== CONFIGURACIÓN DE VALIDACIÓN ====================

export const validationConfig = {
  /**
   * Longitud mínima de contraseña
   */
  passwordMinLength: 8,

  /**
   * Longitud máxima de contraseña
   */
  passwordMaxLength: 128,

  /**
   * Requiere mayúscula en contraseña
   */
  passwordRequireUppercase: true,

  /**
   * Requiere minúscula en contraseña
   */
  passwordRequireLowercase: true,

  /**
   * Requiere número en contraseña
   */
  passwordRequireNumber: true,

  /**
   * Requiere carácter especial en contraseña
   */
  passwordRequireSpecialChar: true,

  /**
   * Longitud mínima de nombre
   */
  nameMinLength: 2,

  /**
   * Longitud máxima de nombre
   */
  nameMaxLength: 100,

  /**
   * Longitud mínima de username
   */
  usernameMinLength: 3,

  /**
   * Longitud máxima de username
   */
  usernameMaxLength: 30,

  /**
   * Longitud de código de verificación
   */
  verificationCodeLength: 6,
};

// ==================== CONFIGURACIÓN DE SEGURIDAD ====================

export const securityConfig = {
  /**
   * Habilitar CSRF protection
   */
  enableCsrfProtection: true,

  /**
   * Habilitar validación de state en OAuth
   */
  enableOAuthStateValidation: true,

  /**
   * Intentos máximos de login antes de bloqueo
   */
  maxLoginAttempts: 5,

  /**
   * Tiempo de bloqueo después de exceder intentos (en minutos)
   */
  lockoutDuration: 15,

  /**
   * Habilitar verificación de email
   */
  requireEmailVerification: false,

  /**
   * Habilitar autenticación de dos factores
   */
  enable2FA: false,

  /**
   * Habilitar detección de sesiones múltiples
   */
  detectMultipleSessions: false,

  /**
   * Número máximo de sesiones simultáneas
   */
  maxConcurrentSessions: 3,

  /**
   * Habilitar logging de actividad de autenticación
   */
  enableAuthLogging: true,
};

// ==================== CONFIGURACIÓN DE UI ====================

export const uiConfig = {
  /**
   * Mostrar botones de OAuth social
   */
  showSocialLogin: true,

  /**
   * Proveedores OAuth habilitados
   */
  enabledProviders: [
    AuthProvider.GOOGLE,
    AuthProvider.MICROSOFT,
    AuthProvider.GITHUB,
  ] as AuthProvider[],

  /**
   * Mostrar indicador de fortaleza de contraseña
   */
  showPasswordStrength: true,

  /**
   * Mostrar opción de "Remember Me"
   */
  showRememberMe: true,

  /**
   * Mostrar opción de "Forgot Password"
   */
  showForgotPassword: true,

  /**
   * Mostrar enlace a registro
   */
  showSignUpLink: true,

  /**
   * Tema por defecto (light/dark)
   */
  defaultTheme: 'light',

  /**
   * Animaciones habilitadas
   */
  enableAnimations: true,

  /**
   * Texto personalizable
   */
  text: {
    signInTitle: 'Sign In',
    signInSubtitle: 'Welcome back! Please enter your credentials',
    signUpTitle: 'Create Account',
    signUpSubtitle: 'Join us today! Fill in your information',
    forgotPasswordTitle: 'Reset Password',
    forgotPasswordSubtitle: 'Enter your email to receive reset instructions',
    or: 'OR',
    continueWith: 'Continue with',
  },
};

// ==================== CONFIGURACIÓN DE ENDPOINTS ====================

export const apiEndpoints = {
  /**
   * Login tradicional
   */
  login: '/auth/login',

  /**
   * Registro de usuario
   */
  register: '/auth/register',

  /**
   * Logout
   */
  logout: '/auth/logout',

  /**
   * Refresh token
   */
  refreshToken: '/auth/refresh',

  /**
   * OAuth callback
   */
  oauthCallback: '/auth/oauth/callback',

  /**
   * Perfil de usuario
   */
  userProfile: '/auth/user',

  /**
   * Actualizar usuario
   */
  updateUser: '/auth/user',

  /**
   * Verificar email
   */
  verifyEmail: '/auth/verify-email',

  /**
   * Solicitar reset de contraseña
   */
  requestPasswordReset: '/auth/request-password-reset',

  /**
   * Reset de contraseña
   */
  resetPassword: '/auth/reset-password',

  /**
   * Cambiar contraseña
   */
  changePassword: '/auth/change-password',
};

// ==================== HELPER FUNCTIONS ====================

/**
 * Verifica si un proveedor OAuth está habilitado
 */
export const isProviderEnabled = (provider: AuthProvider): boolean => {
  return uiConfig.enabledProviders.includes(provider);
};

/**
 * Obtiene todos los proveedores OAuth habilitados
 */
export const getEnabledProviders = (): AuthProvider[] => {
  return uiConfig.enabledProviders;
};

/**
 * Verifica si la configuración OAuth está completa
 */
export const isOAuthConfigured = (provider: AuthProvider): boolean => {
  try {
    const config = getOAuthConfig(provider);
    return !!config.clientId && !!config.redirectUri;
  } catch {
    return false;
  }
};

/**
 * Obtiene la URL completa de la API
 */
export const getApiUrl = (endpoint: string): string => {
  const baseUrl = authConfig.apiBaseUrl.replace(/\/$/, '');
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseUrl}${path}`;
};

/**
 * Valida la configuración completa
 */
export const validateAuthConfig = (): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  // Validar API URL
  if (!authConfig.apiBaseUrl) {
    errors.push('API base URL is not configured');
  }

  // Validar configuraciones OAuth si están habilitadas
  if (uiConfig.showSocialLogin) {
    uiConfig.enabledProviders.forEach(provider => {
      if (!isOAuthConfigured(provider)) {
        errors.push(`OAuth configuration incomplete for ${provider}`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// ==================== EXPORT DEFAULT ====================

export default {
  ...authConfig,
  oauth: oauthConfigs,
  validation: validationConfig,
  security: securityConfig,
  ui: uiConfig,
  endpoints: apiEndpoints,
};