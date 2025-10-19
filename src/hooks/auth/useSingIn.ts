// src/hooks/auth/useSignIn.ts

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from '../../services/authService';
import { LoginCredentials, AuthResponse, AuthError } from '../../types/authTypes';

interface UseSignInReturn {
  signIn: (credentials: LoginCredentials) => Promise<void>;
  signUp: (userData: SignUpData) => Promise<void>;
  signOut: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

interface SignUpData {
  email: string;
  password: string;
  name: string;
  confirmPassword?: string;
}

/**
 * Hook personalizado para manejar autenticación tradicional (email/password)
 */
export const useSignIn = (): UseSignInReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const authService = AuthService.getInstance();

  /**
   * Inicia sesión con email y password
   */
  const signIn = async (credentials: LoginCredentials): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      // Validaciones básicas
      if (!credentials.email || !credentials.password) {
        throw new Error('Email and password are required');
      }

      if (!isValidEmail(credentials.email)) {
        throw new Error('Please enter a valid email address');
      }

      // Ejecutar login
      const response: AuthResponse = await authService.signIn(credentials);

      // Verificar respuesta
      if (!response.token || !response.user) {
        throw new Error('Invalid response from server');
      }

      // Redirigir al dashboard o home
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Sign in failed';
      setError(errorMessage);
      console.error('Sign in error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Registra un nuevo usuario
   */
  const signUp = async (userData: SignUpData): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      // Validaciones
      if (!userData.email || !userData.password || !userData.name) {
        throw new Error('All fields are required');
      }

      if (!isValidEmail(userData.email)) {
        throw new Error('Please enter a valid email address');
      }

      if (userData.password.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }

      if (userData.confirmPassword && userData.password !== userData.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      // Ejecutar registro
      const response: AuthResponse = await authService.signUp({
        email: userData.email,
        password: userData.password,
        name: userData.name,
      });

      // Verificar respuesta
      if (!response.token || !response.user) {
        throw new Error('Invalid response from server');
      }

      // Redirigir al dashboard
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Sign up failed';
      setError(errorMessage);
      console.error('Sign up error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Cierra la sesión del usuario
   */
  const signOut = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      await authService.signOut();
      
      // Redirigir al login
      navigate('/sign-in', { replace: true });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Sign out failed';
      setError(errorMessage);
      console.error('Sign out error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Limpia el error actual
   */
  const clearError = (): void => {
    setError(null);
  };

  return {
    signIn,
    signUp,
    signOut,
    isLoading,
    error,
    clearError,
  };
};

// ==================== HELPERS ====================

/**
 * Valida formato de email
 */
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export default useSignIn;