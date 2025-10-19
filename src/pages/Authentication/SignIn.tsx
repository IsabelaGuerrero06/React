// src/pages/authentication/sign-in.tsx

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSignIn } from '../../hooks/auth/useSingIn';
import { useSocialAuth } from '../../hooks/auth/useSocialAuth';
import SignInButton from '../../components/SignInButton';
import SocialSignInButton from '../../components/SocialSingInButton';
import { AuthProvider } from '../../types/authTypes';
import { getOAuthConfig, uiConfig } from '../../config/authConfig';
import { validateEmail } from '../../utils/auth/authValidators';

/**
 * Página de inicio de sesión
 * Soporta autenticación tradicional y OAuth social
 */
const SignIn: React.FC = () => {
  // Estados del formulario
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  // Hooks de autenticación
  const { signIn, isLoading, error: signInError } = useSignIn();
  const { signInWithProvider, isLoading: isOAuthLoading, error: oauthError } = useSocialAuth();

  /**
   * Maneja el submit del formulario tradicional
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Limpiar errores previos
    setFormErrors({});

    // Validar campos
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      setFormErrors({ email: emailValidation.error });
      return;
    }

    if (!password) {
      setFormErrors({ password: 'Password is required' });
      return;
    }

    try {
      await signIn({ email, password, rememberMe });
      // La navegación se maneja en el hook
    } catch (err) {
      console.error('Sign in failed:', err);
    }
  };

  /**
   * Maneja el login con OAuth social
   */
  const handleSocialSignIn = async (provider: AuthProvider) => {
    try {
      const config = getOAuthConfig(provider);
      await signInWithProvider(provider, config, { redirect: true });
    } catch (err) {
      console.error(`${provider} sign in failed:`, err);
    }
  };

  // Determinar si hay errores
  const currentError = signInError || oauthError;
  const isProcessing = isLoading || isOAuthLoading;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {uiConfig.text.signInTitle}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {uiConfig.text.signInSubtitle}
          </p>
        </div>

        {/* Mensaje de error global */}
        {currentError && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">{currentError}</p>
              </div>
            </div>
          </div>
        )}

        {/* Formulario */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            {/* Email */}
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                  formErrors.email ? 'border-red-300' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
                placeholder="Email address"
                disabled={isProcessing}
              />
              {formErrors.email && (
                <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="relative">
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                  formErrors.password ? 'border-red-300' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
                placeholder="Password"
                disabled={isProcessing}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                disabled={isProcessing}
              >
                {showPassword ? (
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                ) : (
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                    />
                  </svg>
                )}
              </button>
              {formErrors.password && (
                <p className="mt-1 text-sm text-red-600">{formErrors.password}</p>
              )}
            </div>
          </div>

          {/* Remember me & Forgot password */}
          <div className="flex items-center justify-between">
            {uiConfig.showRememberMe && (
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  disabled={isProcessing}
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Remember me
                </label>
              </div>
            )}

            {uiConfig.showForgotPassword && (
              <div className="text-sm">
                <Link
                  to="/forgot-password"
                  className="font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Forgot your password?
                </Link>
              </div>
            )}
          </div>

          {/* Submit button */}
          <div>
            <SignInButton
              type="submit"
              isLoading={isLoading}
              disabled={isProcessing}
              fullWidth
            >
              Sign in
            </SignInButton>
          </div>
        </form>

        {/* OAuth Social Login */}
        {uiConfig.showSocialLogin && uiConfig.enabledProviders.length > 0 && (
          <>
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-gray-50 text-gray-500">
                    {uiConfig.text.or}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3">
              {uiConfig.enabledProviders.includes(AuthProvider.GOOGLE) && (
                <SocialSignInButton
                  provider={AuthProvider.GOOGLE}
                  onClick={() => handleSocialSignIn(AuthProvider.GOOGLE)}
                  isLoading={isOAuthLoading}
                  disabled={isProcessing}
                />
              )}

              {uiConfig.enabledProviders.includes(AuthProvider.MICROSOFT) && (
                <SocialSignInButton
                  provider={AuthProvider.MICROSOFT}
                  onClick={() => handleSocialSignIn(AuthProvider.MICROSOFT)}
                  isLoading={isOAuthLoading}
                  disabled={isProcessing}
                />
              )}

              {uiConfig.enabledProviders.includes(AuthProvider.GITHUB) && (
                <SocialSignInButton
                  provider={AuthProvider.GITHUB}
                  onClick={() => handleSocialSignIn(AuthProvider.GITHUB)}
                  isLoading={isOAuthLoading}
                  disabled={isProcessing}
                />
              )}
            </div>
          </>
        )}

        {/* Sign up link */}
        {uiConfig.showSignUpLink && (
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link
                to="/sign-up"
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Sign up
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SignIn;