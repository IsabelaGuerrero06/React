export interface Permission {
    id: number;
    url: string;
    method: string;
}

// Esta interfaz se usará para las operaciones de creación
export interface CreatePermissionDTO {
    url: string;
    method: string;
}

// Esta interfaz se usará para las operaciones de actualización
export interface UpdatePermissionDTO {
    id: number;
    url?: string;
    method?: string;
}
