import axios from 'axios';
import { RolePermission, CreateRolePermissionDTO, UpdateRolePermissionDTO, BulkRolePermissionDTO } from '../models/RolePermission';
import securityService from './securityService';
import api from '../interceptors/axiosInterceptor';

class RolePermissionService {
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

    async getAll(): Promise<RolePermission[]> {
        const response = await api.get(`${this.baseURL}/role-permissions`, {
            headers: this.getHeaders()
        });
        return response.data;
    }

    async getById(id: string): Promise<RolePermission> {
        const response = await api.get(`${this.baseURL}/role-permissions/${id}`, {
            headers: this.getHeaders()
        });
        return response.data;
    }

    async getByRoleId(roleId: number): Promise<RolePermission[]> {
        const response = await api.get(`${this.baseURL}/role-permissions/role/${roleId}`, {
            headers: this.getHeaders()
        });
        return response.data;
    }

    async getByPermissionId(permissionId: number): Promise<RolePermission[]> {
        const response = await api.get(`${this.baseURL}/role-permissions/permission/${permissionId}`, {
            headers: this.getHeaders()
        });
        return response.data;
    }

    async create(roleId: number, permissionId: number): Promise<RolePermission> {
        const response = await api.post(
            `${this.baseURL}/role-permissions/role/${roleId}/permission/${permissionId}`, 
            {},
            { headers: this.getHeaders() }
        );
        return response.data;
    }

    async delete(roleId: number, permissionId: number): Promise<void> {
        await axios.delete(
            `${this.baseURL}/role-permissions/role/${roleId}/permission/${permissionId}`,
            { headers: this.getHeaders() }
        );
    }

    async deleteById(id: string): Promise<void> {
        await axios.delete(`${this.baseURL}/role-permissions/${id}`, {
            headers: this.getHeaders()
        });
    }

    // Método para asignación masiva
    async bulkAssign(roleId: number, permissionIds: number[]): Promise<void> {
        // Primero revocar todos los permisos existentes
        const existingPermissions = await this.getByRoleId(roleId);
        
        // Revocar permisos existentes
        for (const rp of existingPermissions) {
            await this.deleteById(rp.id);
        }

        // Asignar nuevos permisos
        for (const permissionId of permissionIds) {
            await this.create(roleId, permissionId);
        }
    }
}

export const rolePermissionService = new RolePermissionService();