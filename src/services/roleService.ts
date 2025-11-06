import api from "../interceptors/axiosInterceptor";

export type Role = any;
export type UserRole = {
  id?: string;
  user_id: number;
  role_id: number;
  startAt?: string;
  endAt?: string;
  created_at?: string;
  updated_at?: string;
};

class RoleService {
  private apiUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api`;
  private useLocalStorage = false;

  async getRoles(): Promise<Role[]> {
    try {
      const response = await api.get(`${this.apiUrl}/roles`);
      return response.data;
    } catch (error) {
      console.error("Error al obtener roles:", error);
      return [];
    }
  }

  async getRoleById(id: number): Promise<Role | null> {
    try {
      const response = await api.get(`${this.apiUrl}/roles/${id}`);
      return response.data;
    } catch (error) {
      console.error("Rol no encontrado:", error);
      return null;
    }
  }

  async createRole(role: Omit<Role, 'id'>): Promise<Role | null> {
    try {
      const response = await api.post(`${this.apiUrl}/roles`, role);
      return response.data;
    } catch (error) {
      console.error("Error al crear rol:", error);
      return null;
    }
  }

  async updateRole(id: number, role: Partial<Role>): Promise<Role | null> {
    try {
      const response = await api.put(`${this.apiUrl}/roles/${id}`, role);
      return response.data;
    } catch (error) {
      console.error("Error al actualizar rol:", error);
      return null;
    }
  }

  async deleteRole(id: number): Promise<boolean> {
    try {
      await api.delete(`${this.apiUrl}/roles/${id}`);
      return true;
    } catch (error) {
      console.error("Error al eliminar rol:", error);
      return false;
    }
  }

  /**
   * Asigna un rol a un usuario
   * Ruta backend: POST /api/user-roles/user/{user_id}/role/{role_id}
   * Requiere: { startAt: "YYYY-MM-DD HH:MM:SS", endAt: "YYYY-MM-DD HH:MM:SS" }
   */
  async assignRoleToUser(
    userId: number, 
    roleId: number,
    startAt?: string,
    endAt?: string
  ): Promise<boolean> {
    try {
      console.log('🔄 Asignando rol:', { userId, roleId });
      
      // Genera fechas por defecto si no se proporcionan
      const now = new Date();
      const defaultStart = startAt || this.formatDateTime(now);
      const oneYearLater = new Date(now);
      oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
      const defaultEnd = endAt || this.formatDateTime(oneYearLater);
      
      // ✅ Ruta exacta del backend
      const response = await api.post(
        `${this.apiUrl}/user-roles/user/${userId}/role/${roleId}`,
        {
          startAt: defaultStart,
          endAt: defaultEnd
        }
      );
      
      console.log('✅ Rol asignado exitosamente:', response.data);
      return true;
    } catch (error: any) {
      console.error("❌ Error al asignar rol:", error);
      console.error("📋 Detalles:", error.response?.data);
      throw error;
    }
  }

  /**
   * Remueve un rol de un usuario
   * Primero busca la relación user-role, luego la elimina por ID
   * Ruta backend: DELETE /api/user-roles/{user_role_id}
   */
  async removeRoleFromUser(userId: number, roleId: number): Promise<boolean> {
    try {
      console.log('🔄 Removiendo rol:', { userId, roleId });
      
      // Obtener todas las relaciones del usuario
      const response = await api.get(`${this.apiUrl}/user-roles/user/${userId}`);
      const userRoles = response.data;
      
      // Encontrar el ID de la relación específica
      const userRoleToDelete = userRoles.find(
        (ur: UserRole) => ur.user_id === userId && ur.role_id === roleId
      );
      
      if (!userRoleToDelete) {
        console.warn('⚠️ No se encontró la relación usuario-rol');
        return false;
      }
      
      // Eliminar por ID de la relación
      await api.delete(`${this.apiUrl}/user-roles/${userRoleToDelete.id}`);
      console.log('✅ Rol removido exitosamente');
      return true;
    } catch (error: any) {
      console.error("❌ Error al remover rol:", error);
      console.error("📋 Detalles:", error.response?.data);
      throw error;
    }
  }

  /**
   * Obtiene todos los roles de un usuario
   * Ruta backend: GET /api/user-roles/user/{user_id}
   */
  async getUserRoles(userId: number): Promise<Role[]> {
    try {
      // Obtener las relaciones user-role
      const response = await api.get(`${this.apiUrl}/user-roles/user/${userId}`);
      const userRoles = response.data;
      
      // Obtener los detalles completos de cada rol
      const roles: Role[] = [];
      for (const ur of userRoles) {
        const role = await this.getRoleById(ur.role_id);
        if (role) roles.push(role);
      }
      
      return roles;
    } catch (error) {
      console.error("Error al obtener roles del usuario:", error);
      return [];
    }
  }

  async getUserRoleId(userId: number): Promise<number | null> {
    try {
      const roles = await this.getUserRoles(userId);
      return roles.length > 0 ? roles[0].id : null;
    } catch (error) {
      console.error("Error al obtener rol actual del usuario:", error);
      return null;
    }
  }

  async getCurrentUserRole(userId: number): Promise<Role | null> {
    const roles = await this.getUserRoles(userId);
    return roles.length > 0 ? roles[0] : null;
  }

  /**
   * Obtiene todos los IDs de usuarios que tienen un rol específico
   * Ruta backend: GET /api/user-roles/role/{role_id}
   */
  async getUserIdsByRole(roleId: number): Promise<number[]> {
    try {
      const response = await api.get(`${this.apiUrl}/user-roles/role/${roleId}`);
      const userRoles = response.data;
      
      // Extraer los user_id únicos con tipo explícito
      const userIds = [...new Set(userRoles.map((ur: UserRole) => ur.user_id))] as number[];
      return userIds;
    } catch (error) {
      console.error("Error al obtener usuarios por rol:", error);
      return [];
    }
  }

  async changeUserRole(userId: number, newRoleId: number): Promise<boolean> {
    // Primero remover roles existentes
    const currentRoles = await this.getUserRoles(userId);
    for (const role of currentRoles) {
      await this.removeRoleFromUser(userId, role.id);
    }
    
    // Luego asignar el nuevo rol
    return this.assignRoleToUser(userId, newRoleId);
  }

  /**
   * Formatea una fecha al formato requerido por el backend: "YYYY-MM-DD HH:MM:SS"
   */
  private formatDateTime(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  setUseBackend(useBackend: boolean) {
    this.useLocalStorage = !useBackend;
  }
}

export const roleService = new RoleService();