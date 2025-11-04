// services/dummyPermissionService.ts - VERSIÓN ACTUALIZADA
import { PermissionWithStatus } from '../models/Permission';

// Interfaz para permisos dummy
export interface DummyPermission extends PermissionWithStatus {
  is_dummy?: boolean;
}

interface EntityPermissions {
  entity: string;
  permissions: {
    view: PermissionWithStatus | null;
    list: PermissionWithStatus | null;
    create: PermissionWithStatus | null;
    update: PermissionWithStatus | null;
    delete: PermissionWithStatus | null;
  };
}

/**
 * Servicio para gestión de permisos dummy persistentes
 */
class DummyPermissionService {
  private readonly STORAGE_KEY = 'dummy_permissions';

  getDummyPermissions(roleId: number): DummyPermission[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];
      
      const allDummyPermissions: Record<string, DummyPermission[]> = JSON.parse(stored);
      return allDummyPermissions[roleId.toString()] || [];
    } catch (error) {
      console.error('Error loading dummy permissions:', error);
      return [];
    }
  }

  saveDummyPermissions(roleId: number, permissions: DummyPermission[]): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      const allDummyPermissions: Record<string, DummyPermission[]> = stored ? JSON.parse(stored) : {};
      
      allDummyPermissions[roleId.toString()] = permissions;
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(allDummyPermissions));
    } catch (error) {
      console.error('Error saving dummy permissions:', error);
    }
  }

  mergeDummyPermissions(
    organizedPermissions: EntityPermissions[], 
    roleId: number
  ): EntityPermissions[] {
    const dummyPermissions = this.getDummyPermissions(roleId);
    
    return organizedPermissions.map(entity => {
      const entityDummies = dummyPermissions.filter(dp => 
        dp.entity === entity.entity
      );

      const updatedPermissions = { ...entity.permissions };
      
      entityDummies.forEach(dummy => {
        const permissionType = this.getPermissionTypeFromUrl(dummy.url);
        if (permissionType && !this.hasRealPermission(updatedPermissions[permissionType])) {
          updatedPermissions[permissionType] = { 
            ...dummy, 
            has_permission: dummy.has_permission || false 
          };
        }
      });

      return {
        ...entity,
        permissions: updatedPermissions
      };
    });
  }

  private hasRealPermission(permission: PermissionWithStatus | null): boolean {
    return permission !== null && permission.id !== undefined && permission.id > 0;
  }

  private getPermissionTypeFromUrl(url: string): keyof EntityPermissions['permissions'] | null {
    const lowerUrl = url.toLowerCase();
    if (lowerUrl.includes('/view') || lowerUrl.includes('/detail')) return 'view';
    if (lowerUrl.includes('/update') || lowerUrl.includes('/edit')) return 'update';
    if (lowerUrl.includes('/delete') || lowerUrl.includes('/remove')) return 'delete';
    if (lowerUrl.includes('/create') || lowerUrl.includes('/new')) return 'create';
    if (lowerUrl.match(/\/[^/]+$/)) return 'list';
    return null;
  }
}

export const dummyPermissionService = new DummyPermissionService();