// src/adapters/SessionAdapter.ts

import { Session, SessionValidation, SessionState } from "../models/Session";

/**
 * Adapter Pattern (SOLID - Dependency Inversion Principle)
 * 
 * Responsabilidad única: Transformar y validar datos de Session
 * Permite que el frontend no dependa directamente del formato del backend
 */
export class SessionAdapter {
    
    /**
     * Transforma la respuesta del backend a nuestro modelo
     * @param backendData - Datos crudos del backend
     * @returns Session normalizada
     */
    static fromBackend(backendData: any): Session {
        return {
            id: backendData.id,
            user_id: backendData.user_id,
            token: backendData.token,
            expiration: backendData.expiration,
            FACode: backendData.FACode || null,
            state: backendData.state,
            created_at: backendData.created_at,
            updated_at: backendData.updated_at,
            user: backendData.user
        };
    }

    /**
     * Transforma un array de sesiones del backend
     */
    static fromBackendArray(backendArray: any[]): Session[] {
        return backendArray.map(item => this.fromBackend(item));
    }

    /**
     * Prepara datos para enviar al backend (CREATE)
     * Formatea el campo 'expiration' al formato esperado: "YYYY-MM-DD HH:MM:SS"
     */
    static toBackendCreate(data: {
        token?: string;
        expiration?: Date;
        FACode?: string;
        state?: string;
    }): any {
        const payload: any = {};

        if (data.token) payload.token = data.token;
        if (data.FACode) payload.FACode = data.FACode;
        if (data.state) payload.state = data.state;
        
        // Formato específico del backend: "YYYY-MM-DD HH:MM:SS"
        if (data.expiration) {
            payload.expiration = this.formatDateForBackend(data.expiration);
        }

        return payload;
    }

    /**
     * Prepara datos para enviar al backend (UPDATE)
     */
    static toBackendUpdate(data: {
        token?: string;
        expiration?: Date | string;
        FACode?: string;
        state?: string;
    }): any {
        const payload: any = {};

        if (data.token !== undefined) payload.token = data.token;
        if (data.FACode !== undefined) payload.FACode = data.FACode;
        if (data.state !== undefined) payload.state = data.state;
        
        if (data.expiration) {
            const date = data.expiration instanceof Date 
                ? data.expiration 
                : new Date(data.expiration);
            payload.expiration = this.formatDateForBackend(date);
        }

        return payload;
    }

    /**
     * Formatea una fecha al formato del backend: "YYYY-MM-DD HH:MM:SS"
     */
    private static formatDateForBackend(date: Date): string {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');

        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }

    /**
     * Valida si una sesión está activa y no ha expirado
     */
    static validateSession(session: Session): SessionValidation {
        const now = new Date().getTime();
        const expirationDate = new Date(session.expiration).getTime();
        const isExpired = now > expirationDate;
        const isActive = session.state === SessionState.ACTIVE;

        return {
            isValid: isActive && !isExpired,
            isExpired,
            expiresIn: isExpired ? 0 : expirationDate - now
        };
    }

    /**
     * Formatea la fecha de expiración para mostrar en UI
     */
    static formatExpirationDate(expiration: string, locale: string = 'es-ES'): string {
        return new Date(expiration).toLocaleString(locale, {
            dateStyle: 'medium',
            timeStyle: 'short',
        });
    }

    /**
     * Obtiene tiempo restante hasta expiración en formato legible
     */
    static getTimeUntilExpiration(expiration: string): string {
        const now = new Date().getTime();
        const expirationDate = new Date(expiration).getTime();
        const diff = expirationDate - now;

        if (diff <= 0) return "Expirada";

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        if (hours > 24) {
            const days = Math.floor(hours / 24);
            return `${days} día${days > 1 ? 's' : ''}`;
        }

        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }

        return `${minutes}m`;
    }

    /**
     * Determina la clase CSS según el estado de la sesión
     */
    static getStateClassName(state: string): string {
        switch (state) {
            case SessionState.ACTIVE:
                return 'bg-green-100 text-green-800';
            case SessionState.EXPIRED:
                return 'bg-red-100 text-red-800';
            case SessionState.CLOSED:
                return 'bg-gray-100 text-gray-800';
            case SessionState.REVOKED:
                return 'bg-orange-100 text-orange-800';
            default:
                return 'bg-blue-100 text-blue-800';
        }
    }
}