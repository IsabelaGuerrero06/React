// src/hooks/useUserSessions.ts

import { useState, useEffect, useCallback } from "react";
import { Session } from "../models/Session";
import { sessionService } from "../services/SessionService";
import { SessionAdapter } from "../adapters/SessionAdapter";

/**
 * Custom Hook para gestionar sesiones de usuario
 * 
 * SOLID - Single Responsibility Principle:
 * Este hook SOLO maneja la lógica de negocio de sesiones
 * NO maneja UI, solo estados y operaciones
 */

interface UseUserSessionsReturn {
    // Estados
    sessions: Session[];
    loading: boolean;
    error: string | null;
    
    // Acciones
    refreshSessions: () => Promise<void>;
    closeSession: (sessionId: string) => Promise<boolean>;
    closeAllSessions: () => Promise<boolean>;
    getActiveSessionsCount: () => number;
}

export const useUserSessions = (userId: number): UseUserSessionsReturn => {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    /**
     * Carga las sesiones del usuario
     */
    const loadSessions = useCallback(async () => {
        if (!userId || userId <= 0) {
            setError("ID de usuario inválido");
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            
            const data = await sessionService.getByUserId(userId);
            setSessions(data);
        } catch (err) {
            const errorMessage = err instanceof Error 
                ? err.message 
                : "Error desconocido al cargar sesiones";
            
            console.error("Error al obtener sesiones:", err);
            setError(errorMessage);
            setSessions([]);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    /**
     * Refresca la lista de sesiones
     */
    const refreshSessions = useCallback(async () => {
        await loadSessions();
    }, [loadSessions]);

    /**
     * Cierra una sesión específica
     * @returns true si fue exitoso, false si falló
     */
    const closeSession = useCallback(async (sessionId: string): Promise<boolean> => {
        try {
            await sessionService.closeSession(sessionId);
            
            // Actualizar estado local removiendo la sesión cerrada
            setSessions(prevSessions => 
                prevSessions.filter(s => s.id !== sessionId)
            );
            
            return true;
        } catch (err) {
            console.error("Error al cerrar sesión:", err);
            setError(err instanceof Error ? err.message : "Error al cerrar sesión");
            return false;
        }
    }, []);

    /**
     * Cierra todas las sesiones del usuario
     * @returns true si fue exitoso, false si falló
     */
    const closeAllSessions = useCallback(async (): Promise<boolean> => {
        try {
            await sessionService.closeAllSessions(userId);
            
            // Limpiar estado local
            setSessions([]);
            
            return true;
        } catch (err) {
            console.error("Error al cerrar todas las sesiones:", err);
            setError(err instanceof Error ? err.message : "Error al cerrar todas las sesiones");
            return false;
        }
    }, [userId]);

    /**
     * Obtiene el conteo de sesiones activas
     */
    const getActiveSessionsCount = useCallback((): number => {
        return sessions.filter(session => {
            const validation = SessionAdapter.validateSession(session);
            return validation.isValid;
        }).length;
    }, [sessions]);

    // Cargar sesiones al montar o cuando cambia userId
    useEffect(() => {
        loadSessions();
    }, [loadSessions]);

    return {
        sessions,
        loading,
        error,
        refreshSessions,
        closeSession,
        closeAllSessions,
        getActiveSessionsCount,
    };
};