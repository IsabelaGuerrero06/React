/**
 * Modelo principal de Permiso
 * SOLID: Interface Segregation - Separamos DTOs de la entidad principal
 */
export interface Permission {
    id?: number;
    url: string;
    method: string;
    entity?: string;
    created_at?: string;
    updated_at?: string;
}

/**
 * Permiso extendido para uso en gestión de roles (incluye has_permission)
 */
export interface PermissionWithStatus extends Permission {
    has_permission?: boolean;
}

/**
 * DTO para crear permisos - Todos los campos requeridos según backend
 */
export interface CreatePermissionDTO {
    url: string;
    method: string;
    entity: string;  // 🔥 CAMBIO: Hacer entity obligatorio para coincidir con backend
}

/**
 * DTO para actualizar permisos - Todos los campos opcionales excepto ID
 */
export interface UpdatePermissionDTO {
    id: number;
    url?: string;
    method?: string;
    entity?: string;
}

/**
 * Tipos de métodos HTTP soportados
 */
export enum HttpMethod {
    GET = 'GET',
    POST = 'POST',
    PUT = 'PUT',
    DELETE = 'DELETE',
    PATCH = 'PATCH'
}

/**
 * Interfaz para permisos agrupados por entidad
 */
export interface GroupedPermissions {
    entity: string;
    permissions: PermissionWithStatus[]; // Cambiar a PermissionWithStatus
    has_permission?: boolean; // Para asignación de roles
}