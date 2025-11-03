export interface RolePermission {
    id: string;
    role_id: number;
    permission_id: number;
    created_at?: string;
    updated_at?: string;
}

export interface CreateRolePermissionDTO {
    role_id: number;
    permission_id: number;
}

export interface UpdateRolePermissionDTO {
    id: string;
    role_id?: number;
    permission_id?: number;
}

// Para la asignación masiva de permisos
export interface BulkRolePermissionDTO {
    role_id: number;
    permission_ids: number[];
}