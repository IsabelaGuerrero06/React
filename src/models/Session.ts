// src/models/Session.ts
import { User } from "./User";

/**
 * Modelo de Session que refleja EXACTAMENTE la estructura del backend
 * Backend: session.py
 * 
 * Campos del backend:
 * - id: String(36) - UUID
 * - token: String(255)
 * - expiration: DateTime
 * - FACode: String(10) - nullable
 * - state: String(20)
 * - created_at: DateTime
 * - updated_at: DateTime
 * - user_id: Integer (FK)
 */

export interface Session {
    id: string;                    // UUID desde backend
    user_id: number;               // FK a users
    token: string;                 // Token de sesión
    expiration: string;            // DateTime ISO string (desde backend)
    FACode?: string | null;        // Código de 2FA opcional
    state: string;                 // Estado: 'active', 'expired', etc.
    created_at: string;            // DateTime ISO string
    updated_at: string;            // DateTime ISO string
    user?: User;                   // Relación opcional con User
}

/**
 * DTO para crear una nueva sesión
 * Usa Date para facilitar la manipulación en frontend
 * El adapter se encargará de convertir a string ISO para el backend
 */
export interface CreateSessionDTO {
    token?: string;                // Generado automáticamente si no se provee
    expiration?: Date;             // CAMBIADO: Usa Date en lugar de string
    FACode?: string | null;
    state?: string;                // Default: 'active'
}

/**
 * DTO para actualizar una sesión
 * Todos los campos son opcionales
 */
export interface UpdateSessionDTO {
    token?: string;
    expiration?: Date;             // CAMBIADO: Usa Date en lugar de string
    FACode?: string | null;
    state?: string;
}

/**
 * Estados posibles de una sesión
 */
export enum SessionState {
    ACTIVE = 'active',
    EXPIRED = 'expired',
    CLOSED = 'closed',
    REVOKED = 'revoked'
}

/**
 * Interface para validar expiración
 */
export interface SessionValidation {
    isValid: boolean;
    isExpired: boolean;
    expiresIn?: number;  // milisegundos hasta expiración
}