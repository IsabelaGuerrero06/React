// src/pages/UserSessions.tsx

import React from "react";
import { useUserSessions } from "../hooks/useUserSession";
import SessionCard from "../components/SessionCard";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorAlert from "../components/ErrorAlert";

/**
 * Componente de presentación para sesiones de usuario
 * 
 * SOLID - Single Responsibility Principle:
 * Este componente SOLO se encarga de la UI
 * Toda la lógica está delegada al hook useUserSessions
 */

interface UserSessionsProps {
    userId: number;
}

const UserSessions: React.FC<UserSessionsProps> = ({ userId }) => {
    const {
        sessions,
        loading,
        error,
        refreshSessions,
        closeSession,
        closeAllSessions,
        getActiveSessionsCount,
    } = useUserSessions(userId);

    /**
     * Maneja el cierre de una sesión individual
     */
    const handleCloseSession = async (sessionId: string) => {
        if (!window.confirm("¿Estás seguro de cerrar esta sesión?")) {
            return;
        }

        const success = await closeSession(sessionId);
        
        if (success) {
            alert("Sesión cerrada correctamente");
        } else {
            alert("Error al cerrar la sesión. Por favor intenta de nuevo.");
        }
    };

    /**
     * Maneja el cierre de todas las sesiones
     */
    const handleCloseAllSessions = async () => {
        if (!window.confirm("¿Estás seguro de cerrar TODAS las sesiones?")) {
            return;
        }

        const success = await closeAllSessions();
        
        if (success) {
            alert("Todas las sesiones han sido cerradas");
        } else {
            alert("Error al cerrar las sesiones. Por favor intenta de nuevo.");
        }
    };

    // Estado de carga
    if (loading) {
        return (
            <div className="max-w-4xl mx-auto mt-8 bg-white shadow-md rounded-lg p-6">
                <LoadingSpinner message="Cargando sesiones..." />
            </div>
        );
    }

    // Estado de error
    if (error) {
        return (
            <div className="max-w-4xl mx-auto mt-8 bg-white shadow-md rounded-lg p-6">
                <ErrorAlert 
                    message={error} 
                    onRetry={refreshSessions}
                />
            </div>
        );
    }

    const activeSessions = getActiveSessionsCount();
    const hasActiveSessions = activeSessions > 0;

    return (
        <div className="max-w-4xl mx-auto mt-8 bg-white shadow-md rounded-lg p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6 pb-4 border-b">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">
                        Sesiones del Usuario
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                        Usuario ID: <span className="font-mono font-semibold">{userId}</span>
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {/* Botón refrescar */}
                    <button
                        onClick={refreshSessions}
                        className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition-colors flex items-center gap-2"
                        title="Refrescar sesiones"
                    >
                        <svg 
                            className="w-4 h-4" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                        >
                            <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth={2} 
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
                            />
                        </svg>
                        Refrescar
                    </button>

                    {/* Botón cerrar todas */}
                    {hasActiveSessions && (
                        <button
                            onClick={handleCloseAllSessions}
                            className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded transition-colors flex items-center gap-2"
                            title="Cerrar todas las sesiones"
                        >
                            <svg 
                                className="w-4 h-4" 
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
                            Cerrar Todas
                        </button>
                    )}
                </div>
            </div>

            {/* Estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="text-sm text-blue-600 font-semibold">
                        Total de Sesiones
                    </div>
                    <div className="text-3xl font-bold text-blue-800 mt-1">
                        {sessions.length}
                    </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="text-sm text-green-600 font-semibold">
                        Sesiones Activas
                    </div>
                    <div className="text-3xl font-bold text-green-800 mt-1">
                        {activeSessions}
                    </div>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="text-sm text-gray-600 font-semibold">
                        Sesiones Inactivas
                    </div>
                    <div className="text-3xl font-bold text-gray-800 mt-1">
                        {sessions.length - activeSessions}
                    </div>
                </div>
            </div>

            {/* Lista de sesiones */}
            {sessions.length === 0 ? (
                <div className="text-center py-12">
                    <svg 
                        className="mx-auto h-16 w-16 text-gray-400" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                    >
                        <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                        />
                    </svg>
                    <h3 className="mt-4 text-lg font-semibold text-gray-700">
                        No hay sesiones disponibles
                    </h3>
                    <p className="mt-2 text-gray-500">
                        Este usuario no tiene sesiones registradas en el sistema.
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {sessions.map((session) => (
                        <SessionCard
                            key={session.id}
                            session={session}
                            onClose={() => handleCloseSession(session.id)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default UserSessions;