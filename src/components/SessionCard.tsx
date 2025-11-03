// src/components/SessionCard.tsx

import React from "react";
import { Session } from "../models/Session";
import { SessionAdapter } from "../adapters/SessionAdapter";

/**
 * Componente para mostrar una tarjeta de sesión individual
 * 
 * SOLID Principles:
 * - Single Responsibility: Solo renderiza información de una sesión
 * - Open/Closed: Puede extenderse para mostrar más información sin modificar
 */

interface SessionCardProps {
    session: Session;
    onClose: () => void;
}

const SessionCard: React.FC<SessionCardProps> = ({ session, onClose }) => {
    const validation = SessionAdapter.validateSession(session);
    const stateClassName = SessionAdapter.getStateClassName(session.state);
    const timeRemaining = SessionAdapter.getTimeUntilExpiration(session.expiration);

    return (
        <div 
            className={`border rounded-lg p-5 transition-all hover:shadow-md ${
                validation.isValid ? 'bg-white' : 'bg-gray-50 opacity-75'
            }`}
        >
            <div className="flex justify-between items-start">
                {/* Información de la sesión */}
                <div className="flex-1 space-y-2">
                    {/* Header con ID y estado */}
                    <div className="flex items-center gap-3">
                        <h3 className="text-sm font-mono text-gray-600">
                            ID: {session.id}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${stateClassName}`}>
                            {session.state.toUpperCase()}
                        </span>
                        {!validation.isValid && (
                            <span className="px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                                ⚠️ INVÁLIDA
                            </span>
                        )}
                    </div>

                    {/* Token */}
                    <div className="flex items-start gap-2">
                        <span className="text-sm font-semibold text-gray-700 min-w-[80px]">
                            Token:
                        </span>
                        <span className="text-sm font-mono text-gray-600 break-all">
                            {session.token}
                        </span>
                    </div>

                    {/* Fechas */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        <div>
                            <span className="font-semibold text-gray-700">Creada:</span>
                            <span className="ml-2 text-gray-600">
                                {SessionAdapter.formatExpirationDate(session.created_at)}
                            </span>
                        </div>
                        <div>
                            <span className="font-semibold text-gray-700">Última actualización:</span>
                            <span className="ml-2 text-gray-600">
                                {SessionAdapter.formatExpirationDate(session.updated_at)}
                            </span>
                        </div>
                    </div>

                    {/* Expiración */}
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-700">
                            Expira:
                        </span>
                        <span className={`text-sm ${validation.isExpired ? 'text-red-600 font-semibold' : 'text-gray-600'}`}>
                            {SessionAdapter.formatExpirationDate(session.expiration)}
                        </span>
                        {!validation.isExpired && (
                            <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                                ⏱️ {timeRemaining}
                            </span>
                        )}
                        {validation.isExpired && (
                            <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs font-medium">
                                ❌ Expirada
                            </span>
                        )}
                    </div>

                    {/* Código 2FA (si existe) */}
                    {session.FACode && (
                        <div className="flex items-center gap-2 mt-2 p-2 bg-yellow-50 rounded border border-yellow-200">
                            <span className="text-sm font-semibold text-yellow-800">
                                🔐 Código 2FA:
                            </span>
                            <span className="text-sm font-mono text-yellow-900">
                                {session.FACode}
                            </span>
                        </div>
                    )}
                </div>

                {/* Botón de cerrar */}
                <button
                    onClick={onClose}
                    className="ml-4 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded transition-colors flex-shrink-0"
                    title="Cerrar esta sesión"
                >
                    ✕ Cerrar
                </button>
            </div>
        </div>
    );
};

export default SessionCard;