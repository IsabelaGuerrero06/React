import React from 'react';

interface GenericButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'info' | 'success';
  size?: 'sm' | 'md' | 'lg';
}

const variantStyles: Record<string, string> = {
  primary: 'bg-blue-500 hover:bg-blue-600 text-white',
  secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
  danger: 'bg-red-500 hover:bg-red-600 text-white',
  info: 'bg-sky-500 hover:bg-sky-600 text-white',
  success: 'bg-green-500 hover:bg-green-600 text-white',
};

const sizeStyles: Record<string, string> = {
  sm: 'px-2 py-1 text-sm',
  md: 'px-3 py-2 text-base',
  lg: 'px-4 py-3 text-lg',
};

const GenericButton: React.FC<GenericButtonProps> = ({
  label,
  onClick,
  variant = 'primary',
  size = 'sm',
}) => {
  return (
    <button
      onClick={onClick}
      className={`rounded-md font-medium transition duration-200 ${variantStyles[variant]} ${sizeStyles[size]}`}
    >
      {label}
    </button>
  );
};

export default GenericButton;
