// src/components/ErrorAlert.tsx

import React from "react";

/**
 * Componente reutilizable para mostrar errores
 * 
 * SOLID - Single Responsibility: Solo muestra mensajes de error
 */

interface ErrorAlertProps {
    message: string;
    onRetry?: () => void;
    onDismiss?: () => void;
}

const ErrorAlert: React.FC<ErrorAlertProps> = ({ message, onRetry, onDismiss }) => {
    return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
                <div className="flex-shrink-0">
                    <svg 
                        className="h-6 w-6 text-red-600" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                    >
                        <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                        />
                    </svg>
                </div>
                <div className="ml-3 flex-1">
                    <h3 className="text-sm font-semibold text-red-800">
                        Error
                    </h3>
                    <p className="mt-1 text-sm text-red-700">
                        {message}
                    </p>
                    {(onRetry || onDismiss) && (
                        <div className="mt-4 flex gap-2">
                            {onRetry && (
                                <button
                                    onClick={onRetry}
                                    className="bg-red-600 hover:bg-red-700 text-white text-sm py-1.5 px-3 rounded transition-colors"
                                >
                                    Reintentar
                                </button>
                            )}
                            {onDismiss && (
                                <button
                                    onClick={onDismiss}
                                    className="bg-white hover:bg-red-50 text-red-600 border border-red-300 text-sm py-1.5 px-3 rounded transition-colors"
                                >
                                    Cerrar
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ErrorAlert;