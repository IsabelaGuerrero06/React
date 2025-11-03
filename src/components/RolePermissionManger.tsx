import React, { useState, useEffect } from 'react';
import { Role } from '../models/Role';
import { PermissionWithStatus, GroupedPermissions } from '../models/Permission';
import { rolePermissionService } from '../services/rolePermissionService';
import { permissionService } from '../services/permissionService';
import Swal from 'sweetalert2';

interface RolePermissionManagerProps {
  role: Role;
  onClose: () => void;
}

interface EntityPermissions {
  entity: string;
  model: PermissionWithStatus | null;
  view: PermissionWithStatus | null;
  list: PermissionWithStatus | null;
  update: PermissionWithStatus | null;
  delete: PermissionWithStatus | null;
}

// Interfaz para permisos dummy
interface DummyPermission extends PermissionWithStatus {
  is_dummy?: boolean;
}

const RolePermissionManager: React.FC<RolePermissionManagerProps> = ({
  role,
  onClose,
}) => {
  const [groupedPermissions, setGroupedPermissions] = useState<
    GroupedPermissions[]
  >([]);
  const [organizedPermissions, setOrganizedPermissions] = useState<
    EntityPermissions[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPermissions();
  }, [role.id]);

  const organizePermissions = (
    permissions: GroupedPermissions[],
  ): EntityPermissions[] => {
    let dummyIdCounter = -1; // Contador para IDs únicos de permisos dummy
    
    return permissions.map((group) => {
      const entityPerms: EntityPermissions = {
        entity: group.entity,
        model: null,
        view: null,
        list: null,
        update: null,
        delete: null,
      };

      group.permissions.forEach((permission) => {
        const url = permission.url.toLowerCase();
        const method = permission.method.toLowerCase();

        // Asignar permisos basándose únicamente en URL y método
        if (
          url.includes('/create') || 
          url.includes('/new') ||
          (method === 'post' && !url.includes('/update'))
        ) {
          entityPerms.model = permission;
        } else if (
          url.includes('/view') || 
          url.includes('/detail') ||
          (method === 'get' && url.match(/\/[^/]+\/\d+$/))
        ) {
          entityPerms.view = permission;
        } else if (
          method === 'get' && 
          !url.includes('/view') && 
          !url.includes('/detail') && 
          !url.match(/\/[^/]+\/\d+$/)
        ) {
          entityPerms.list = permission;
        } else if (
          url.includes('/update') || 
          url.includes('/edit') ||
          method === 'put' || 
          method === 'patch'
        ) {
          entityPerms.update = permission;
        } else if (
          url.includes('/delete') || 
          url.includes('/remove') ||
          method === 'delete'
        ) {
          entityPerms.delete = permission;
        }
      });

      // Si algún permiso no se asignó, crear uno dummy con ID único
      if (!entityPerms.view) {
        entityPerms.view = {
          id: dummyIdCounter--, // ID único y negativo
          url: `/${group.entity.toLowerCase()}/view`,
          method: 'GET',
          has_permission: false,
          is_dummy: true
        } as DummyPermission;
      }
      if (!entityPerms.list) {
        entityPerms.list = {
          id: dummyIdCounter--, // ID único y negativo
          url: `/${group.entity.toLowerCase()}`,
          method: 'GET',
          has_permission: false,
          is_dummy: true
        } as DummyPermission;
      }
      if (!entityPerms.update) {
        entityPerms.update = {
          id: dummyIdCounter--, // ID único y negativo
          url: `/${group.entity.toLowerCase()}/update`,
          method: 'PUT',
          has_permission: false,
          is_dummy: true
        } as DummyPermission;
      }
      if (!entityPerms.delete) {
        entityPerms.delete = {
          id: dummyIdCounter--, // ID único y negativo
          url: `/${group.entity.toLowerCase()}/delete`,
          method: 'DELETE',
          has_permission: false,
          is_dummy: true
        } as DummyPermission;
      }

      return entityPerms;
    });
  };

  const loadPermissions = async () => {
    try {
      setLoading(true);
      const permissions = await permissionService.getGroupedByRole(role.id!);
      setGroupedPermissions(permissions);
      
      // Cambiar "roles" por "Permission" en la última fila
      const organized = organizePermissions(permissions);
      const updatedOrganized = organized.map(entity => {
        if (entity.entity.toLowerCase() === 'roles') {
          return {
            ...entity,
            entity: 'Permission'
          };
        }
        return entity;
      });
      
      setOrganizedPermissions(updatedOrganized);
    } catch (error) {
      console.error('Error loading permissions:', error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudieron cargar los permisos',
        icon: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionToggle = async (
    permissionId: number,
    currentState: boolean,
    isDummy: boolean = false
  ) => {
    try {
      // Si es un permiso dummy, actualizar el estado visual pero no guardar en BD
      if (isDummy) {
        console.log('Permiso dummy clickeado:', permissionId);
        
        // Actualizar el estado visual del checkbox dummy
        const updatedPermissions = organizedPermissions.map((entity) => ({
          ...entity,
          model:
            entity.model?.id === permissionId
              ? { ...entity.model, has_permission: !currentState }
              : entity.model,
          view:
            entity.view?.id === permissionId
              ? { ...entity.view, has_permission: !currentState }
              : entity.view,
          list:
            entity.list?.id === permissionId
              ? { ...entity.list, has_permission: !currentState }
              : entity.list,
          update:
            entity.update?.id === permissionId
              ? { ...entity.update, has_permission: !currentState }
              : entity.update,
          delete:
            entity.delete?.id === permissionId
              ? { ...entity.delete, has_permission: !currentState }
              : entity.delete,
        }));

        setOrganizedPermissions(updatedPermissions);
        return;
      }

      // Para permisos reales, guardar en BD
      if (currentState) {
        await rolePermissionService.delete(role.id!, permissionId);
      } else {
        await rolePermissionService.create(role.id!, permissionId);
      }

      const updatedPermissions = organizedPermissions.map((entity) => ({
        ...entity,
        model:
          entity.model?.id === permissionId
            ? { ...entity.model, has_permission: !currentState }
            : entity.model,
        view:
          entity.view?.id === permissionId
            ? { ...entity.view, has_permission: !currentState }
            : entity.view,
        list:
          entity.list?.id === permissionId
            ? { ...entity.list, has_permission: !currentState }
            : entity.list,
        update:
          entity.update?.id === permissionId
            ? { ...entity.update, has_permission: !currentState }
            : entity.update,
        delete:
          entity.delete?.id === permissionId
            ? { ...entity.delete, has_permission: !currentState }
            : entity.delete,
      }));

      setOrganizedPermissions(updatedPermissions);
    } catch (error) {
      console.error('Error updating permission:', error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudo actualizar el permiso',
        icon: 'error',
      });
    }
  };

  const handleSaveAll = async () => {
    try {
      setSaving(true);

      const selectedPermissionIds: number[] = [];
      organizedPermissions.forEach((entity) => {
        [
          entity.model,
          entity.view,
          entity.list,
          entity.update,
          entity.delete,
        ].forEach((permission) => {
          // Solo incluir permisos reales (ID positivo) en el guardado
          if (permission?.has_permission && permission.id && permission.id > 0) {
            selectedPermissionIds.push(permission.id);
          }
        });
      });

      await rolePermissionService.bulkAssign(role.id!, selectedPermissionIds);

      Swal.fire({
        title: 'Guardado',
        text: 'Los permisos han sido actualizados correctamente',
        icon: 'success',
        timer: 2000,
      });

      onClose();
    } catch (error) {
      console.error('Error saving permissions:', error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudieron guardar los permisos',
        icon: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <p className="text-black dark:text-white">Cargando permisos...</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="border-b border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-gray-800">Gestión de roles</h2>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="border border-gray-300 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100 border-b border-gray-300">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 uppercase border-r border-gray-300">
                    MODELO
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 uppercase border-r border-gray-300">
                    VISTA
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 uppercase border-r border-gray-300">
                    LISTA
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 uppercase border-r border-gray-300">
                    ACTUALIZAR
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 uppercase">
                    BORRAR
                  </th>
                </tr>
              </thead>
              <tbody>
                {organizedPermissions.map((entity) => (
                  <tr
                    key={entity.entity}
                    className="hover:bg-gray-50 border-t border-gray-300"
                  >
                    <td className="px-4 py-2 border-r border-gray-300 font-medium text-gray-800">
                      {entity.entity}
                    </td>
                    
                    {/* Columna VISTA con 1 checkbox */}
                    <td className="px-4 py-2 border-r border-gray-300">
                      <div className="flex justify-center">
                        <input
                          type="checkbox"
                          checked={entity.view?.has_permission || false}
                          onChange={() =>
                            handlePermissionToggle(
                              entity.view!.id!,
                              entity.view!.has_permission || false,
                              (entity.view as DummyPermission)?.is_dummy || false
                            )
                          }
                          className="w-5 h-5 text-blue-600 border-gray-400 rounded focus:ring-blue-500 focus:ring-2"
                        />
                      </div>
                    </td>

                    {/* Columna LISTA con 1 checkbox */}
                    <td className="px-4 py-2 border-r border-gray-300">
                      <div className="flex justify-center">
                        <input
                          type="checkbox"
                          checked={entity.list?.has_permission || false}
                          onChange={() =>
                            handlePermissionToggle(
                              entity.list!.id!,
                              entity.list!.has_permission || false,
                              (entity.list as DummyPermission)?.is_dummy || false
                            )
                          }
                          className="w-5 h-5 text-blue-600 border-gray-400 rounded focus:ring-blue-500 focus:ring-2"
                        />
                      </div>
                    </td>

                    {/* Columna ACTUALIZAR con 1 checkbox */}
                    <td className="px-4 py-2 border-r border-gray-300">
                      <div className="flex justify-center">
                        <input
                          type="checkbox"
                          checked={entity.update?.has_permission || false}
                          onChange={() =>
                            handlePermissionToggle(
                              entity.update!.id!,
                              entity.update!.has_permission || false,
                              (entity.update as DummyPermission)?.is_dummy || false
                            )
                          }
                          className="w-5 h-5 text-blue-600 border-gray-400 rounded focus:ring-blue-500 focus:ring-2"
                        />
                      </div>
                    </td>

                    {/* Columna BORRAR con 1 checkbox */}
                    <td className="px-4 py-2">
                      <div className="flex justify-center">
                        <input
                          type="checkbox"
                          checked={entity.delete?.has_permission || false}
                          onChange={() =>
                            handlePermissionToggle(
                              entity.delete!.id!,
                              entity.delete!.has_permission || false,
                              (entity.delete as DummyPermission)?.is_dummy || false
                            )
                          }
                          className="w-5 h-5 text-blue-600 border-gray-400 rounded focus:ring-blue-500 focus:ring-2"
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {organizedPermissions.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No hay permisos disponibles</p>
            </div>
          )}
        </div>
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-8 py-3 border border-gray-400 rounded text-gray-700 hover:bg-gray-100 transition-colors font-medium text-base"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RolePermissionManager;