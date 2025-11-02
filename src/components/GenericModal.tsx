import React, { useEffect } from "react";
import { useUILibrary } from "../contexts/UILibraryContext";

interface GenericModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

const GenericModal: React.FC<GenericModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
}) => {
  const { currentLibrary } = useUILibrary();

  // Cerrar modal con tecla Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-2xl",
    lg: "max-w-4xl",
    xl: "max-w-6xl",
  };

  // ============================
  // 🔵 TAILWIND DESIGN
  // ============================
  if (currentLibrary === "tailwind") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
        <div
          className={`${sizeClasses[size]} w-full bg-white dark:bg-boxdark rounded-xl shadow-2xl border-l-4 border-blue-500 animate-in fade-in zoom-in duration-200`}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 px-6 py-4 border-b border-blue-200 dark:border-blue-800 rounded-t-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100">
                {title}
              </h3>
              <button
                onClick={onClose}
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 transition-colors duration-200"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-5 max-h-[70vh] overflow-y-auto">
            {children}
          </div>
        </div>
      </div>
    );
  }

  // ============================
  // 🟡 MATERIAL DESIGN
  // ============================
  if (currentLibrary === "material") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-60 backdrop-blur-md">
        <div
          className={`${sizeClasses[size]} w-full bg-white dark:bg-boxdark rounded-2xl shadow-2xl animate-in fade-in zoom-in duration-300`}
        >
          {/* Header */}
          <div className="bg-gradient-to-br from-yellow-400 via-yellow-500 to-amber-500 dark:from-yellow-600 dark:via-yellow-700 dark:to-amber-700 px-6 py-4 shadow-md rounded-t-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-extrabold text-gray-900 dark:text-gray-50 uppercase tracking-wide">
                ⚡ {title}
              </h3>
              <button
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-gray-800 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-100 dark:hover:bg-gray-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-6 max-h-[70vh] overflow-y-auto">
            {children}
          </div>
        </div>
      </div>
    );
  }

  // ============================
  // 🟢 BOOTSTRAP DESIGN
  // ============================
  if (currentLibrary === "bootstrap") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
        <div
          className={`${sizeClasses[size]} w-full bg-white dark:bg-boxdark rounded-md shadow-lg border-4 border-green-500 dark:border-green-700 animate-in fade-in zoom-in duration-150`}
        >
          {/* Header */}
          <div className="bg-green-600 dark:bg-green-800 px-5 py-3 border-b-4 border-green-800 dark:border-green-950 rounded-t-md">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-white uppercase">
                📋 {title}
              </h3>
              <button
                onClick={onClose}
                className="text-white hover:text-green-200 transition-colors duration-150 font-black text-2xl"
              >
                ×
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-5 py-4 max-h-[70vh] overflow-y-auto">
            {children}
          </div>
        </div>
      </div>
    );
  }

  // ============================
  // ⚪ Fallback genérico
  // ============================
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div
        className={`${sizeClasses[size]} w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

export default GenericModal;