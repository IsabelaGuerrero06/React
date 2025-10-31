export interface RolePermission {
    id: string;
    startAt: Date;
    endAt: Date;
}

export interface CreateRolePermissionDTO {
    roleId: number;
    permissionId: number;
    startAt: Date;
    endAt: Date;
}

export interface UpdateRolePermissionDTO {
    id: string;
    startAt?: Date;
    endAt?: Date;
}
