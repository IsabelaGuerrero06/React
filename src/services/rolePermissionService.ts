import axios from 'axios';
import { RolePermission, CreateRolePermissionDTO, UpdateRolePermissionDTO } from '../models/RolePermission';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

export const rolePermissionService = {
    getByRoleId: async (roleId: number): Promise<RolePermission[]> => {
        const response = await axios.get(`${API_URL}/roles/${roleId}/permissions`);
        return response.data;
    },

    getByPermissionId: async (permissionId: number): Promise<RolePermission[]> => {
        const response = await axios.get(`${API_URL}/permissions/${permissionId}/roles`);
        return response.data;
    },

    assign: async (rolePermission: CreateRolePermissionDTO): Promise<RolePermission> => {
        const response = await axios.post(`${API_URL}/role-permissions`, rolePermission);
        return response.data;
    },

    update: async (rolePermission: UpdateRolePermissionDTO): Promise<RolePermission> => {
        const response = await axios.put(`${API_URL}/role-permissions/${rolePermission.id}`, rolePermission);
        return response.data;
    },

    revoke: async (id: string): Promise<void> => {
        await axios.delete(`${API_URL}/role-permissions/${id}`);
    }
};