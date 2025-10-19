// src/utils/auth/authValidators.ts

/**
 * Validadores para autenticación
 * Funciones puras para validar datos de entrada
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Valida formato de email
 */
export const validateEmail = (email: string): ValidationResult => {
  if (!email || email.trim() === '') {
    return { isValid: false, error: 'Email is required' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }

  // Validar longitud
  if (email.length > 254) {
    return { isValid: false, error: 'Email is too long' };
  }

  return { isValid: true };
};

/**
 * Valida fortaleza de password
 */
export const validatePassword = (password: string): ValidationResult => {
  if (!password) {
    return { isValid: false, error: 'Password is required' };
  }

  // Longitud mínima
  if (password.length < 8) {
    return { isValid: false, error: 'Password must be at least 8 characters long' };
  }

  // Longitud máxima
  if (password.length > 128) {
    return { isValid: false, error: 'Password is too long' };
  }

  // Al menos una letra mayúscula
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one uppercase letter' };
  }

  // Al menos una letra minúscula
  if (!/[a-z]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one lowercase letter' };
  }

  // Al menos un número
  if (!/\d/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one number' };
  }

  // Al menos un carácter especial
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one special character' };
  }

  return { isValid: true };
};

/**
 * Valida que las contraseñas coincidan
 */
export const validatePasswordMatch = (
  password: string,
  confirmPassword: string
): ValidationResult => {
  if (!confirmPassword) {
    return { isValid: false, error: 'Please confirm your password' };
  }

  if (password !== confirmPassword) {
    return { isValid: false, error: 'Passwords do not match' };
  }

  return { isValid: true };
};

/**
 * Valida nombre de usuario
 */
export const validateName = (name: string): ValidationResult => {
  if (!name || name.trim() === '') {
    return { isValid: false, error: 'Name is required' };
  }

  if (name.length < 2) {
    return { isValid: false, error: 'Name must be at least 2 characters long' };
  }

  if (name.length > 100) {
    return { isValid: false, error: 'Name is too long' };
  }

  // Solo letras, espacios y algunos caracteres especiales
  if (!/^[a-zA-ZÀ-ÿ\s'-]+$/.test(name)) {
    return { isValid: false, error: 'Name contains invalid characters' };
  }

  return { isValid: true };
};

/**
 * Valida username (opcional)
 */
export const validateUsername = (username: string): ValidationResult => {
  if (!username || username.trim() === '') {
    return { isValid: false, error: 'Username is required' };
  }

  if (username.length < 3) {
    return { isValid: false, error: 'Username must be at least 3 characters long' };
  }

  if (username.length > 30) {
    return { isValid: false, error: 'Username is too long' };
  }

  // Solo letras, números, guiones y guiones bajos
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    return { isValid: false, error: 'Username can only contain letters, numbers, hyphens and underscores' };
  }

  return { isValid: true };
};

/**
 * Valida código de verificación
 */
export const validateVerificationCode = (code: string): ValidationResult => {
  if (!code || code.trim() === '') {
    return { isValid: false, error: 'Verification code is required' };
  }

  // Generalmente códigos de 6 dígitos
  if (!/^\d{6}$/.test(code)) {
    return { isValid: false, error: 'Verification code must be 6 digits' };
  }

  return { isValid: true };
};

/**
 * Valida token JWT básico
 */
export const validateToken = (token: string): ValidationResult => {
  if (!token || token.trim() === '') {
    return { isValid: false, error: 'Token is required' };
  }

  // JWT tiene 3 partes separadas por puntos
  const parts = token.split('.');
  if (parts.length !== 3) {
    return { isValid: false, error: 'Invalid token format' };
  }

  return { isValid: true };
};

/**
 * Valida URL de redirect
 */
export const validateRedirectUrl = (url: string): ValidationResult => {
  if (!url || url.trim() === '') {
    return { isValid: false, error: 'Redirect URL is required' };
  }

  try {
    const urlObj = new URL(url);
    
    // Validar que sea http o https
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return { isValid: false, error: 'Invalid URL protocol' };
    }

    return { isValid: true };
  } catch {
    return { isValid: false, error: 'Invalid URL format' };
  }
};

/**
 * Valida OAuth state parameter
 */
export const validateOAuthState = (state: string): ValidationResult => {
  if (!state || state.trim() === '') {
    return { isValid: false, error: 'State parameter is required' };
  }

  // Mínimo 16 caracteres para seguridad
  if (state.length < 16) {
    return { isValid: false, error: 'State parameter is too short' };
  }

  return { isValid: true };
};

/**
 * Valida formulario de login completo
 */
export const validateLoginForm = (email: string, password: string): ValidationResult => {
  const emailValidation = validateEmail(email);
  if (!emailValidation.isValid) {
    return emailValidation;
  }

  if (!password || password.trim() === '') {
    return { isValid: false, error: 'Password is required' };
  }

  return { isValid: true };
};

/**
 * Valida formulario de registro completo
 */
export const validateSignUpForm = (
  email: string,
  password: string,
  confirmPassword: string,
  name: string
): ValidationResult => {
  const nameValidation = validateName(name);
  if (!nameValidation.isValid) {
    return nameValidation;
  }

  const emailValidation = validateEmail(email);
  if (!emailValidation.isValid) {
    return emailValidation;
  }

  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    return passwordValidation;
  }

  const passwordMatchValidation = validatePasswordMatch(password, confirmPassword);
  if (!passwordMatchValidation.isValid) {
    return passwordMatchValidation;
  }

  return { isValid: true };
};

/**
 * Calcula la fortaleza de la contraseña (0-100)
 */
export const getPasswordStrength = (password: string): number => {
  if (!password) return 0;

  let strength = 0;

  // Longitud
  if (password.length >= 8) strength += 20;
  if (password.length >= 12) strength += 10;
  if (password.length >= 16) strength += 10;

  // Mayúsculas
  if (/[A-Z]/.test(password)) strength += 15;

  // Minúsculas
  if (/[a-z]/.test(password)) strength += 15;

  // Números
  if (/\d/.test(password)) strength += 15;

  // Caracteres especiales
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 15;

  return Math.min(strength, 100);
};

/**
 * Obtiene el nivel de fortaleza de la contraseña
 */
export const getPasswordStrengthLevel = (
  password: string
): 'weak' | 'fair' | 'good' | 'strong' => {
  const strength = getPasswordStrength(password);

  if (strength < 40) return 'weak';
  if (strength < 60) return 'fair';
  if (strength < 80) return 'good';
  return 'strong';
};

/**
 * Valida múltiples campos a la vez
 */
export const validateFields = (
  fields: Record<string, string>,
  validators: Record<string, (value: string) => ValidationResult>
): Record<string, string> => {
  const errors: Record<string, string> = {};

  Object.keys(validators).forEach(fieldName => {
    const value = fields[fieldName] || '';
    const validator = validators[fieldName];
    const result = validator(value);

    if (!result.isValid && result.error) {
      errors[fieldName] = result.error;
    }
  });

  return errors;
};