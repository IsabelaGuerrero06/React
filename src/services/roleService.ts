// roleService wraps role operations. Re-export the project's Role model type for compatibility.
// Use a loose Role type here to avoid conflicts with model naming (descripcion vs description)
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
  private apiUrl = "http://localhost:5000/api";
  private localRoles: Role[] = [
    { id: 1, name: "Administrator", description: "Platform administrator with full access" },
    { id: 2, name: "Visitor", description: "Temporary visitor with limited access" },
    { id: 3, name: "Editor", description: "Content editor" },
    { id: 4, name: "Moderator", description: "Community moderator" },
  ];

  // userId -> roleIds[]
  private localUserRoles: Map<number, number[]> = new Map();
  private useLocalStorage = true;

  constructor() {
    this.loadFromLocalStorage();
  }

  private loadFromLocalStorage() {
    try {
      const storedRoles = localStorage.getItem('roles');
      if (storedRoles) this.localRoles = JSON.parse(storedRoles);

      const storedUserRoles = localStorage.getItem('userRoles');
      if (storedUserRoles) {
        const parsed = JSON.parse(storedUserRoles);
        // parsed is an object where values are arrays (or legacy single number)
        this.localUserRoles = new Map(Object.entries(parsed).map(([k, v]) => {
          const val = v as any;
          if (Array.isArray(val)) return [Number(k), val as number[]];
          return [Number(k), [Number(val)]];
        }));
      }
      console.debug('RoleService: loaded from localStorage', { roles: this.localRoles, userRoles: Object.fromEntries(this.localUserRoles) });
    } catch (err) {
      console.error('Error loading roleService from localStorage', err);
    }
  }

  private saveToLocalStorage() {
    try {
      localStorage.setItem('roles', JSON.stringify(this.localRoles));
      localStorage.setItem('userRoles', JSON.stringify(Object.fromEntries(this.localUserRoles)));
      console.debug('RoleService: saved to localStorage', { roles: this.localRoles, userRoles: Object.fromEntries(this.localUserRoles) });
    } catch (err) {
      console.error('Error saving roleService to localStorage', err);
    }
  }

  // Roles CRUD
  async getRoles(): Promise<Role[]> {
    if (this.useLocalStorage) {
      await new Promise(r => setTimeout(r, 200));
      return [...this.localRoles];
    }
    const res = await fetch(`${this.apiUrl}/roles`);
    if (!res.ok) throw new Error('Error fetching roles');
    return await res.json();
  }

  async getRoleById(id: number): Promise<Role> {
    if (this.useLocalStorage) {
      await new Promise(r => setTimeout(r, 150));
      const r = this.localRoles.find(x => x.id === id);
      if (!r) throw new Error('Role not found');
      return { ...r };
    }
    const res = await fetch(`${this.apiUrl}/roles/${id}`);
    if (!res.ok) throw new Error('Error fetching role');
    return await res.json();
  }

  async createRole(role: Omit<Role, 'id'>): Promise<Role> {
    if (this.useLocalStorage) {
      await new Promise(r => setTimeout(r, 150));
  const id = Math.max(0, ...this.localRoles.map(x => (x.id ?? 0))) + 1;
      const newRole: Role = { ...role, id };
      this.localRoles.push(newRole);
      this.saveToLocalStorage();
      return newRole;
    }
    const res = await fetch(`${this.apiUrl}/roles`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(role)
    });
    if (!res.ok) throw new Error('Error creating role');
    return await res.json();
  }

  async updateRole(id: number, role: Partial<Role>): Promise<Role> {
    if (this.useLocalStorage) {
      const idx = this.localRoles.findIndex(x => x.id === id);
      if (idx === -1) throw new Error('Role not found');
      this.localRoles[idx] = { ...this.localRoles[idx], ...role } as Role;
      this.saveToLocalStorage();
      return { ...this.localRoles[idx] };
    }
    const res = await fetch(`${this.apiUrl}/roles/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(role) });
    if (!res.ok) throw new Error('Error updating role');
    return await res.json();
  }

  async deleteRole(id: number): Promise<boolean> {
    if (this.useLocalStorage) {
      // check if any user has this role
      const has = Array.from(this.localUserRoles.values()).some(arr => arr.includes(id));
      if (has) throw new Error('Cannot delete role in use');
      const idx = this.localRoles.findIndex(x => x.id === id);
      if (idx === -1) return false;
      this.localRoles.splice(idx, 1);
      this.saveToLocalStorage();
      return true;
    }
    const res = await fetch(`${this.apiUrl}/roles/${id}`, { method: 'DELETE' });
    return res.ok;
  }

  // User-Role methods (multi-role support)
  async assignRoleToUser(userId: number, roleId: number): Promise<boolean> {
    if (this.useLocalStorage) {
      const list = this.localUserRoles.get(userId) || [];
      if (!list.includes(roleId)) {
        list.push(roleId);
        this.localUserRoles.set(userId, list);
        this.saveToLocalStorage();
        console.debug('assignRoleToUser:', { userId, roleId, list });
      } else {
        console.debug('assignRoleToUser: already assigned', { userId, roleId });
      }
      return true;
    }
    const res = await fetch(`${this.apiUrl}/user-roles`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: userId, role_id: roleId }) });
    return res.ok;
  }

  async removeRoleFromUser(userId: number, roleId: number): Promise<boolean> {
    if (this.useLocalStorage) {
      const list = this.localUserRoles.get(userId) || [];
      if (!list.includes(roleId)) return false;
      const filtered = list.filter(x => x !== roleId);
      if (filtered.length) this.localUserRoles.set(userId, filtered); else this.localUserRoles.delete(userId);
      this.saveToLocalStorage();
      console.debug('removeRoleFromUser:', { userId, roleId, remaining: filtered });
      return true;
    }
    const res = await fetch(`${this.apiUrl}/user-roles`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: userId, role_id: roleId }) });
    return res.ok;
  }

  async getUserRoles(userId: number): Promise<Role[]> {
    if (this.useLocalStorage) {
  const ids = this.localUserRoles.get(userId) || [];
  return this.localRoles.filter(r => ids.includes(r.id ?? -1));
    }
    const res = await fetch(`${this.apiUrl}/users/${userId}/roles`);
    if (!res.ok) return [];
    return await res.json();
  }

  async getUserIdsByRole(roleId: number): Promise<number[]> {
    if (this.useLocalStorage) {
      const result: number[] = [];
      for (const [uid, arr] of this.localUserRoles.entries()) if (arr.includes(roleId)) result.push(uid);
      return result;
    }
    const res = await fetch(`${this.apiUrl}/roles/${roleId}/users`);
    if (!res.ok) return [];
    const data = await res.json();
    if (Array.isArray(data) && data.length) {
      if (typeof data[0] === 'number') return data as number[];
      if (data[0] && typeof data[0].id === 'number') return data.map((u:any)=>u.id);
    }
    return [];
  }

  async getUserRoleId(userId: number): Promise<number | null> {
    if (this.useLocalStorage) {
      const ids = this.localUserRoles.get(userId) || [];
      return ids.length ? ids[0] : null;
    }
    const res = await fetch(`${this.apiUrl}/users/${userId}/roles/current`);
    if (!res.ok) return null;
    const data = await res.json();
    return data?.role_id || null;
  }

  async getCurrentUserRole(userId: number): Promise<Role | null> {
    const id = await this.getUserRoleId(userId);
    if (!id) return null;
    return this.getRoleById(id);
  }

  async changeUserRole(userId: number, newRoleId: number): Promise<boolean> {
    // For local storage: just assign (could also implement end date for previous role)
    return this.assignRoleToUser(userId, newRoleId);
  }

  setUseBackend(useBackend: boolean) { this.useLocalStorage = !useBackend; }
}

export const roleService = new RoleService();
// Expose helpers for debugging in the browser console
(window as any).roleService = roleService;

// Debug helpers
(roleService as any).debugDump = () => ({
  roles: roleService['localRoles'],
  userRoles: Object.fromEntries(roleService['localUserRoles'] || new Map()),
});

(roleService as any).forceReloadFromStorage = () => {
  try {
    roleService['loadFromLocalStorage']();
    return (roleService as any).debugDump();
  } catch (e) {
    console.error('forceReloadFromStorage failed', e);
    return null;
  }
};
