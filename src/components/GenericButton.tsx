import React from "react";

interface GenericButtonProps {
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary" | "danger" | "info" | "success";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
}

const GenericButton: React.FC<GenericButtonProps> = ({
  label,
  onClick,
  variant = "primary",
  size = "sm",
  disabled = false,
}) => {
  const baseStyle =
    "rounded-md font-medium transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 shadow-sm";

  const variantStyles: Record<string, string> = {
    primary:
      "bg-[#2563eb] hover:bg-[#1d4ed8] text-white border border-[#1d4ed8]",
    secondary:
      "bg-[#e5e7eb] hover:bg-[#d1d5db] text-[#111827] border border-[#9ca3af]",
    danger: "bg-[#dc2626] hover:bg-[#b91c1c] text-white border border-[#991b1b]",
    info: "bg-[#0284c7] hover:bg-[#0369a1] text-white border border-[#075985]",
    success:
      "bg-[#16a34a] hover:bg-[#15803d] text-white border border-[#166534]",
  };

  const sizeStyles: Record<string, string> = {
    sm: "px-3 py-1 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-5 py-3 text-lg",
  };

  const disabledStyle = "opacity-50 cursor-not-allowed";

  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`${baseStyle} ${variantStyles[variant]} ${sizeStyles[size]} ${
        disabled ? disabledStyle : ""
      }`}
    >
      {label}
    </button>
  );
};

export default GenericButton;