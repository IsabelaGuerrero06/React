import React from 'react';
import ProviderIcon from './ProviderIcon';
import { AuthProvider } from '../types/authTypes';

interface SocialSignInButtonProps {
  provider: AuthProvider;
  onClick: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const SocialSignInButton: React.FC<SocialSignInButtonProps> = ({
  provider,
  onClick,
  isLoading = false,
  disabled = false,
  className = '',
  fullWidth = true,
  size = 'md',
}) => {
  const providerLabels: Record<AuthProvider, string> = {
    [AuthProvider.GOOGLE]: 'Google',
    [AuthProvider.MICROSOFT]: 'Microsoft',
    [AuthProvider.GITHUB]: 'GitHub',
  } as Record<AuthProvider, string>;

  const providerStyles: Record<AuthProvider, string> = {
    [AuthProvider.GOOGLE]: `
      bg-white text-gray-700 border-2 border-gray-300
      hover:bg-gray-50 hover:border-gray-400 active:bg-gray-100
      focus:ring-blue-500
    `,
    [AuthProvider.MICROSOFT]: `
      bg-white text-gray-700 border-2 border-gray-300
      hover:bg-gray-50 hover:border-gray-400 active:bg-gray-100
      focus:ring-blue-500
    `,
    [AuthProvider.GITHUB]: `
      bg-white text-gray-700 border-2 border-gray-300
      hover:bg-gray-50 hover:border-gray-400 active:bg-gray-100
      focus:ring-blue-500
    `,
  };

  const sizeStyles = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24,
  };

  const baseStyles = `
    relative inline-flex items-center justify-center 
    ${sizeStyles[size]} rounded-lg font-medium 
    transition-all duration-200 
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    shadow-sm hover:shadow-md
  `;

  const widthStyle = fullWidth ? 'w-full' : '';

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${providerStyles[provider]} ${widthStyle} ${className}`.trim()}
      aria-label={`Continuar con ${providerLabels[provider]}`}
    >
      <span className="flex items-center justify-center">
        {isLoading ? (
          <svg className="animate-spin h-5 w-5 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        ) : (
          <ProviderIcon provider={provider} className="mr-3" size={iconSizes[size]} />
        )}
        <span>Continuar con {providerLabels[provider]}</span>
      </span>
    </button>
  );
};

export default SocialSignInButton;
