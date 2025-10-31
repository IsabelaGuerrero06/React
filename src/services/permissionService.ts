import axios from 'axios';
import { Permission, CreatePermissionDTO, UpdatePermissionDTO } from '../models/Permission';

const API_URL = import.meta.env.VITE_API_URL;

export const permissionService = {
    getAll: async (): Promise<Permission[]> => {
        const response = await axios.get(`${API_URL}/permissions`);
        return response.data;
    },

    getById: async (id: number): Promise<Permission> => {
        const response = await axios.get(`${API_URL}/permissions/${id}`);
        return response.data;
    },

    create: async (permission: CreatePermissionDTO): Promise<Permission> => {
        const response = await axios.post(`${API_URL}/permissions`, permission);
        return response.data;
    },

    update: async (permission: UpdatePermissionDTO): Promise<Permission> => {
        const response = await axios.put(`${API_URL}/permissions/${permission.id}`, permission);
        return response.data;
    },

    delete: async (id: number): Promise<void> => {
        await axios.delete(`${API_URL}/permissions/${id}`);
    }
};
