import axios from 'axios';
import { Permission, CreatePermissionDTO, UpdatePermissionDTO } from '../models/Permission';
import securityService from './securityService';

/**
 * Servicio para gestión de permisos
 * SOLID Principles:
 * - Single Responsibility: Solo maneja operaciones de permisos
 * - Dependency Inversion: Depende de abstracciones (DTOs)
 */
class PermissionService {
    private readonly baseURL: string;

    constructor() {
        this.baseURL = `${import.meta.env.VITE_API_URL}/api`;
    }

    private getHeaders() {
        const token = securityService.getToken();
        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
    }

    async getAll(): Promise<Permission[]> {
        const response = await axios.get(`${this.baseURL}/permissions`, {
            headers: this.getHeaders()
        });
        return response.data;
    }

    async getById(id: number): Promise<Permission> {
        const response = await axios.get(`${this.baseURL}/permissions/${id}`, {
            headers: this.getHeaders()
        });
        return response.data;
    }

    async create(permission: CreatePermissionDTO): Promise<Permission> {
        const response = await axios.post(`${this.baseURL}/permissions`, permission, {
            headers: this.getHeaders()
        });
        return response.data;
    }

    async update(permission: UpdatePermissionDTO): Promise<Permission> {
        const response = await axios.put(`${this.baseURL}/permissions/${permission.id}`, permission, {
            headers: this.getHeaders()
        });
        return response.data;
    }

    async delete(id: number): Promise<void> {
        await axios.delete(`${this.baseURL}/permissions/${id}`, {
            headers: this.getHeaders()
        });
    }

    /**
     * Obtiene permisos agrupados por entidad para un rol específico
     * Backend endpoint: GET /permissions/grouped/role/{role_id}
     */
    async getGroupedByRole(roleId: number): Promise<any[]> {
        const response = await axios.get(`${this.baseURL}/permissions/grouped/role/${roleId}`, {
            headers: this.getHeaders()
        });
        return response.data;
    }
}

export const permissionService = new PermissionService();