import React from 'react';

interface SignInButtonProps {
  onClick?: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  children: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
  type?: 'button' | 'submit' | 'reset';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const SignInButton: React.FC<SignInButtonProps> = ({
  onClick,
  isLoading = false,
  disabled = false,
  variant = 'primary',
  children,
  className = '',
  fullWidth = false,
  type = 'button',
  size = 'md',
  icon,
  iconPosition = 'left',
}) => {
  const sizeStyles = {
    sm: 'px-4 py-2 text-sm gap-2',
    md: 'px-6 py-3 text-base gap-2.5',
    lg: 'px-8 py-4 text-lg gap-3',
  };

  const baseStyles = `
    relative inline-flex items-center justify-center 
    ${sizeStyles[size]} rounded-lg font-medium 
    transition-all duration-200 ease-in-out
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
  `;

  const variantStyles = {
    primary: `
      bg-blue-600 text-white 
      hover:bg-blue-700 active:bg-blue-800
      focus:ring-blue-500
      shadow-sm hover:shadow-md active:shadow-sm
    `,
    secondary: `
      bg-gray-600 text-white 
      hover:bg-gray-700 active:bg-gray-800
      focus:ring-gray-500
      shadow-sm hover:shadow-md active:shadow-sm
    `,
    outline: `
      bg-white text-gray-700 
      border-2 border-gray-300 
      hover:bg-gray-50 hover:border-gray-400 active:bg-gray-100
      focus:ring-gray-500
      shadow-sm hover:shadow active:shadow-none
    `,
    ghost: `
      bg-transparent text-gray-700
      hover:bg-gray-100 active:bg-gray-200
      focus:ring-gray-400
    `,
  };

  const widthStyle = fullWidth ? 'w-full' : '';
  const isDisabled = disabled || isLoading;

  const spinnerSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <>
          <svg
            className={`animate-spin ${spinnerSizes[size]}`}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Cargando...</span>
        </>
      );
    }

    return (
      <>
        {icon && iconPosition === 'left' && <span className="flex-shrink-0">{icon}</span>}
        <span>{children}</span>
        {icon && iconPosition === 'right' && <span className="flex-shrink-0">{icon}</span>}
      </>
    );
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      aria-disabled={isDisabled}
      aria-busy={isLoading}
      className={`${baseStyles} ${variantStyles[variant]} ${widthStyle} ${className}`.trim()}
    >
      {renderContent()}
    </button>
  );
};

export default SignInButton;