import axios from "axios";
import { Role } from "../models/Role";

const API_URL = import.meta.env.VITE_API_URL + "/roles" || "";

/**
 * Servicio para gestionar operaciones CRUD de Roles
 * Sigue el principio de Responsabilidad Única (SRP) - Solo maneja operaciones de roles
 * Sigue el principio de Inversión de Dependencias (DIP) - Depende de abstracciones (axios)
 */
class RoleService {
    /**
     * Obtiene todos los roles del sistema
     * @returns Promise<Role[]> - Lista de roles
     */
    async getRoles(): Promise<Role[]> {
        try {
            const response = await axios.get<Role[]>(API_URL);
            return response.data;
        } catch (error) {
            console.error("Error al obtener roles:", error);
            return [];
        }
    }

    /**
     * Obtiene un rol específico por su ID
     * @param id - ID del rol a buscar
     * @returns Promise<Role | null> - Rol encontrado o null
     */
    async getRoleById(id: number): Promise<Role | null> {
        try {
            const response = await axios.get<Role>(`${API_URL}/${id}`);
            return response.data;
        } catch (error) {
            console.error("Rol no encontrado:", error);
            return null;
        }
    }

    /**
     * Crea un nuevo rol en el sistema
     * @param role - Datos del rol a crear (sin ID)
     * @returns Promise<Role | null> - Rol creado o null si falla
     */
    async createRole(role: Omit<Role, "id">): Promise<Role | null> {
        try {
            const response = await axios.post<Role>(API_URL, role);
            return response.data;
        } catch (error) {
            console.error("Error al crear rol:", error);
            return null;
        }
    }

    /**
     * Actualiza un rol existente
     * @param id - ID del rol a actualizar
     * @param role - Datos parciales del rol a actualizar
     * @returns Promise<Role | null> - Rol actualizado o null si falla
     */
    async updateRole(id: number, role: Partial<Role>): Promise<Role | null> {
        try {
            const response = await axios.put<Role>(`${API_URL}/${id}`, role);
            return response.data;
        } catch (error) {
            console.error("Error al actualizar rol:", error);
            return null;
        }
    }

    /**
     * Elimina un rol del sistema
     * @param id - ID del rol a eliminar
     * @returns Promise<boolean> - true si se eliminó correctamente, false si falló
     */
    async deleteRole(id: number): Promise<boolean> {
        try {
            await axios.delete(`${API_URL}/${id}`);
            return true;
        } catch (error) {
            console.error("Error al eliminar rol:", error);
            return false;
        }
    }

    /**
     * Asigna permisos a un rol específico (Relación N:N con Permissions)
     * @param roleId - ID del rol
     * @param permissionIds - Array de IDs de permisos a asignar
     * @returns Promise<boolean> - true si se asignaron correctamente
     */
    async assignPermissions(roleId: number, permissionIds: number[]): Promise<boolean> {
        try {
            await axios.post(`${API_URL}/${roleId}/permissions`, { 
                permission_ids: permissionIds 
            });
            return true;
        } catch (error) {
            console.error("Error al asignar permisos:", error);
            return false;
        }
    }

    /**
     * Obtiene los permisos asociados a un rol
     * @param roleId - ID del rol
     * @returns Promise<any[]> - Lista de permisos del rol
     */
    async getRolePermissions(roleId: number): Promise<any[]> {
        try {
            const response = await axios.get(`${API_URL}/${roleId}/permissions`);
            return response.data;
        } catch (error) {
            console.error("Error al obtener permisos del rol:", error);
            return [];
        }
    }
}

/**
 * Exportamos una instancia única de la clase (Patrón Singleton)
 * Esto asegura que solo exista una instancia del servicio en toda la aplicación
 * Principio de Abierto/Cerrado (OCP) - La clase está abierta para extensión pero cerrada para modificación
 */
export const roleService = new RoleService();