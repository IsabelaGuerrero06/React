import axios from 'axios';
import { Permission, CreatePermissionDTO, UpdatePermissionDTO } from '../models/Permission';
import securityService from './securityService';

const API_URL = import.meta.env.VITE_API_URL;

export const permissionService = {
    getAll: async (): Promise<Permission[]> => {
        const token = securityService.getToken();
        const response = await axios.get(`${API_URL}/permissions`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    },

    getById: async (id: number): Promise<Permission> => {
        const token = securityService.getToken();
        const response = await axios.get(`${API_URL}/permissions/${id}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    },

    create: async (permission: CreatePermissionDTO): Promise<Permission> => {
        const token = securityService.getToken();
        const response = await axios.post(`${API_URL}/permissions`, permission, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    },

    update: async (permission: UpdatePermissionDTO): Promise<Permission> => {
        const token = securityService.getToken();
        const response = await axios.put(`${API_URL}/permissions/${permission.id}`, permission, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    },

    delete: async (id: number): Promise<void> => {
        const token = securityService.getToken();
        await axios.delete(`${API_URL}/permissions/${id}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
    }
};