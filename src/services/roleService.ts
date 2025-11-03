// services/roleService.ts

export interface Role {
  id: number;
  name: string;
  description: string;
  created_at?: string;
  updated_at?: string;
}

export interface UserRole {
  id: string;
  user_id: number;
  role_id: number;
  startAt: string;
  endAt?: string;
  created_at?: string;
  updated_at?: string;
}

class RoleService {
  private apiUrl = "http://localhost:5000/api"; // Cambia esto por tu URL de API
  
  // Almacenamiento local temporal (simulando base de datos)
  private localRoles: Role[] = [
    { id: 1, name: "Administrator", description: "Platform administrator with full access" },
    { id: 2, name: "Visitor", description: "Temporary visitor with limited access" },
    { id: 3, name: "Editor", description: "Content editor" },
    { id: 4, name: "Moderator", description: "Community moderator" },
  ];
  
  private localUserRoles: Map<number, number> = new Map(); // userId -> roleId
  private useLocalStorage = true; // Cambiar a false cuando el backend esté listo

  constructor() {
    // Cargar datos del localStorage si existen
    this.loadFromLocalStorage();
  }

  private loadFromLocalStorage() {
    try {
      const storedRoles = localStorage.getItem('roles');
      if (storedRoles) {
        this.localRoles = JSON.parse(storedRoles);
      }
      
      const storedUserRoles = localStorage.getItem('userRoles');
      if (storedUserRoles) {
        const parsed = JSON.parse(storedUserRoles);
        this.localUserRoles = new Map(Object.entries(parsed).map(([k, v]) => [Number(k), v as number]));
      }
    } catch (error) {
      console.error("Error loading from localStorage:", error);
    }
  }

  private saveToLocalStorage() {
    try {
      localStorage.setItem('roles', JSON.stringify(this.localRoles));
      localStorage.setItem('userRoles', JSON.stringify(Object.fromEntries(this.localUserRoles)));
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }
  }

  // ============================================
  // MÉTODOS PARA ROLES
  // ============================================

  async getRoles(): Promise<Role[]> {
    if (this.useLocalStorage) {
      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 300));
      return [...this.localRoles];
    }
    
    try {
      const response = await fetch(`${this.apiUrl}/roles`);
      if (!response.ok) {
        throw new Error("Error al obtener roles");
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching roles:", error);
      throw error;
    }
  }

  async getRoleById(id: number): Promise<Role> {
    if (this.useLocalStorage) {
      await new Promise(resolve => setTimeout(resolve, 200));
      const role = this.localRoles.find(r => r.id === id);
      if (!role) throw new Error("Rol no encontrado");
      return { ...role };
    }
    
    try {
      const response = await fetch(`${this.apiUrl}/roles/${id}`);
      if (!response.ok) {
        throw new Error("Error al obtener el rol");
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching role:", error);
      throw error;
    }
  }

  async createRole(role: Omit<Role, "id">): Promise<Role> {
    if (this.useLocalStorage) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const newId = Math.max(...this.localRoles.map(r => r.id), 0) + 1;
      const newRole: Role = {
        ...role,
        id: newId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      this.localRoles.push(newRole);
      this.saveToLocalStorage();
      return { ...newRole };
    }
    
    try {
      const response = await fetch(`${this.apiUrl}/roles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(role),
      });
      if (!response.ok) {
        throw new Error("Error al crear el rol");
      }
      return await response.json();
    } catch (error) {
      console.error("Error creating role:", error);
      throw error;
    }
  }

  async updateRole(id: number, role: Partial<Role>): Promise<Role> {
    if (this.useLocalStorage) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const index = this.localRoles.findIndex(r => r.id === id);
      if (index === -1) throw new Error("Rol no encontrado");
      
      this.localRoles[index] = {
        ...this.localRoles[index],
        ...role,
        id, // Mantener el ID original
        updated_at: new Date().toISOString(),
      };
      this.saveToLocalStorage();
      return { ...this.localRoles[index] };
    }
    
    try {
      const response = await fetch(`${this.apiUrl}/roles/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(role),
      });
      if (!response.ok) {
        throw new Error("Error al actualizar el rol");
      }
      return await response.json();
    } catch (error) {
      console.error("Error updating role:", error);
      throw error;
    }
  }

  async deleteRole(id: number): Promise<boolean> {
    if (this.useLocalStorage) {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Verificar si hay usuarios con este rol
      const usersWithRole = Array.from(this.localUserRoles.values()).filter(roleId => roleId === id);
      if (usersWithRole.length > 0) {
        throw new Error(`No se puede eliminar el rol. Hay ${usersWithRole.length} usuario(s) con este rol asignado`);
      }
      
      const index = this.localRoles.findIndex(r => r.id === id);
      if (index === -1) return false;
      
      this.localRoles.splice(index, 1);
      this.saveToLocalStorage();
      return true;
    }
    
    try {
      const response = await fetch(`${this.apiUrl}/roles/${id}`, {
        method: "DELETE",
      });
      return response.ok;
    } catch (error) {
      console.error("Error deleting role:", error);
      return false;
    }
  }

  // ============================================
  // MÉTODOS PARA USER_ROLES
  // ============================================

  async assignRoleToUser(userId: number, roleId: number): Promise<boolean> {
    if (this.useLocalStorage) {
      await new Promise(resolve => setTimeout(resolve, 300));
      this.localUserRoles.set(userId, roleId);
      this.saveToLocalStorage();
      return true;
    }
    
    try {
      const response = await fetch(`${this.apiUrl}/user-roles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId,
          role_id: roleId,
          startAt: new Date().toISOString(),
        }),
      });
      return response.ok;
    } catch (error) {
      console.error("Error assigning role:", error);
      return false;
    }
  }

  async getUserRoleId(userId: number): Promise<number | null> {
    if (this.useLocalStorage) {
      await new Promise(resolve => setTimeout(resolve, 200));
      return this.localUserRoles.get(userId) || null;
    }
    
    try {
      const response = await fetch(`${this.apiUrl}/users/${userId}/roles/current`);
      if (!response.ok) return null;
      const data = await response.json();
      return data.role_id || null;
    } catch (error) {
      console.error("Error fetching user role:", error);
      return null;
    }
  }

  async getCurrentUserRole(userId: number): Promise<Role | null> {
    if (this.useLocalStorage) {
      await new Promise(resolve => setTimeout(resolve, 200));
      const roleId = this.localUserRoles.get(userId);
      if (!roleId) return null;
      const role = this.localRoles.find(r => r.id === roleId);
      return role ? { ...role } : null;
    }
    
    try {
      const roleId = await this.getUserRoleId(userId);
      if (!roleId) return null;
      return await this.getRoleById(roleId);
    } catch (error) {
      console.error("Error fetching current user role:", error);
      return null;
    }
  }

  async changeUserRole(userId: number, newRoleId: number): Promise<boolean> {
    // Para el almacenamiento local, es lo mismo que asignar
    return await this.assignRoleToUser(userId, newRoleId);
  }

  // Método para cambiar entre local y backend
  setUseBackend(useBackend: boolean) {
    this.useLocalStorage = !useBackend;
  }
}

export const roleService = new RoleService();