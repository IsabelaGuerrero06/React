import React from "react";
import { useUILibrary } from "../contexts/UILibraryContext";

interface GenericTextareaProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  rows?: number;
}

const GenericTextarea: React.FC<GenericTextareaProps> = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  error,
  required = false,
  disabled = false,
  rows = 4,
}) => {
  const { currentLibrary } = useUILibrary();

  // ============================
  // 🔵 TAILWIND DESIGN
  // ============================
  if (currentLibrary === "tailwind") {
    return (
      <div className="mb-4">
        <label
          htmlFor={name}
          className="block text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1.5"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <textarea
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          rows={rows}
          className={`w-full px-3 py-2 text-sm border rounded-lg transition-all duration-200 resize-y
            ${
              error
                ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                : "border-blue-300 dark:border-blue-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            }
            ${
              disabled
                ? "bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
                : "bg-white dark:bg-boxdark"
            }
            text-gray-900 dark:text-gray-100
            placeholder:text-gray-400 dark:placeholder:text-gray-500
          `}
        />
        {error && (
          <p className="mt-1 text-xs text-red-600 dark:text-red-400">
            {error}
          </p>
        )}
      </div>
    );
  }

  // ============================
  // 🟡 MATERIAL DESIGN
  // ============================
  if (currentLibrary === "material") {
    return (
      <div className="mb-5">
        <label
          htmlFor={name}
          className="block text-sm font-bold text-yellow-900 dark:text-yellow-100 mb-2 uppercase tracking-wide"
        >
          {label}
          {required && <span className="text-red-600 ml-1">*</span>}
        </label>
        <textarea
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          rows={rows}
          className={`w-full px-4 py-2.5 text-sm font-medium border-2 rounded-xl transition-all duration-300 shadow-sm resize-y
            ${
              error
                ? "border-red-500 focus:ring-4 focus:ring-red-200 dark:focus:ring-red-900"
                : "border-yellow-400 dark:border-yellow-600 focus:ring-4 focus:ring-yellow-200 dark:focus:ring-yellow-900 focus:border-yellow-500"
            }
            ${
              disabled
                ? "bg-gray-200 dark:bg-gray-800 cursor-not-allowed"
                : "bg-white dark:bg-boxdark hover:border-yellow-500"
            }
            text-gray-900 dark:text-gray-100
            placeholder:text-gray-500 dark:placeholder:text-gray-400
          `}
        />
        {error && (
          <p className="mt-1.5 text-xs font-bold text-red-600 dark:text-red-400 uppercase">
            ⚠️ {error}
          </p>
        )}
      </div>
    );
  }

  // ============================
  // 🟢 BOOTSTRAP DESIGN
  // ============================
  if (currentLibrary === "bootstrap") {
    return (
      <div className="mb-4">
        <label
          htmlFor={name}
          className="block text-xs font-black text-green-900 dark:text-green-100 mb-1.5 uppercase"
        >
          {label}
          {required && <span className="text-red-600 ml-1">*</span>}
        </label>
        <textarea
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          rows={rows}
          className={`w-full px-3 py-2 text-sm font-semibold border-2 rounded-md transition-all duration-150 resize-y
            ${
              error
                ? "border-red-600 focus:ring-2 focus:ring-red-500"
                : "border-green-500 dark:border-green-700 focus:ring-2 focus:ring-green-500 focus:border-green-700"
            }
            ${
              disabled
                ? "bg-gray-200 dark:bg-gray-800 cursor-not-allowed"
                : "bg-white dark:bg-boxdark"
            }
            text-gray-900 dark:text-gray-100
            placeholder:text-gray-500 dark:placeholder:text-gray-400
          `}
        />
        {error && (
          <p className="mt-1 text-xs font-bold text-red-700 dark:text-red-400 uppercase">
            ⚠️ {error}
          </p>
        )}
      </div>
    );
  }

  // ============================
  // ⚪ Fallback genérico
  // ============================
  return (
    <div className="mb-4">
      <label
        htmlFor={name}
        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        className={`w-full px-3 py-2 border rounded-md resize-y ${
          error ? "border-red-500" : "border-gray-300"
        } ${disabled ? "bg-gray-100 cursor-not-allowed" : "bg-white"}`}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
};

export default GenericTextarea;