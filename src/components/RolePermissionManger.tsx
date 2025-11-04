import React, { useState, useEffect } from 'react';
import { Role } from '../models/Role';
import { PermissionWithStatus, GroupedPermissions } from '../models/Permission';
import { rolePermissionService } from '../services/rolePermissionService';
import { permissionService } from '../services/permissionService';
import { dummyPermissionService } from '../services/dummyPermissionService';
import Swal from 'sweetalert2';

interface RolePermissionManagerProps {
  role: Role;
  onClose: () => void;
}

interface EntityPermissions {
  entity: string;
  view: PermissionWithStatus | null;
  list: PermissionWithStatus | null;
  create: PermissionWithStatus | null;
  update: PermissionWithStatus | null;
  delete: PermissionWithStatus | null;
}

const RolePermissionManager: React.FC<RolePermissionManagerProps> = ({
  role,
  onClose,
}) => {
  const [organizedPermissions, setOrganizedPermissions] = useState<
    EntityPermissions[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  let dummyIdCounter = -1;

  useEffect(() => {
    loadPermissions();
  }, [role.id]);

  const organizePermissions = (
    permissions: GroupedPermissions[],
  ): EntityPermissions[] => {
    return permissions.map((group) => {
      const entityPerms: EntityPermissions = {
        entity: group.entity,
        view: null,
        list: null,
        create: null,
        update: null,
        delete: null,
      };

      group.permissions.forEach((permission) => {
        const url = permission.url.toLowerCase();
        const method = permission.method.toLowerCase();

        if (
          url.includes('/view') ||
          url.includes('/detail') ||
          (method === 'get' && url.match(/\/[^/]+\/\d+$/))
        ) {
          entityPerms.view = permission;
        } else if (
          method === 'get' &&
          !url.includes('/view') &&
          !url.includes('/detail')
        ) {
          entityPerms.list = permission;
        } else if (
          url.includes('/create') ||
          url.includes('/new') ||
          (method === 'post' && !url.includes('/update'))
        ) {
          entityPerms.create = permission;
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

      // Crear permisos dummy para los que faltan
      if (!entityPerms.view) {
        entityPerms.view = {
          id: dummyIdCounter--,
          url: `/${group.entity.toLowerCase()}/view`,
          method: 'GET',
          entity: group.entity,
          has_permission: false,
          is_dummy: true,
        };
      }
      if (!entityPerms.list) {
        entityPerms.list = {
          id: dummyIdCounter--,
          url: `/${group.entity.toLowerCase()}`,
          method: 'GET',
          entity: group.entity,
          has_permission: false,
          is_dummy: true,
        };
      }
      if (!entityPerms.create) {
        entityPerms.create = {
          id: dummyIdCounter--,
          url: `/${group.entity.toLowerCase()}/create`,
          method: 'POST',
          entity: group.entity,
          has_permission: false,
          is_dummy: true,
        };
      }
      if (!entityPerms.update) {
        entityPerms.update = {
          id: dummyIdCounter--,
          url: `/${group.entity.toLowerCase()}/update`,
          method: 'PUT',
          entity: group.entity,
          has_permission: false,
          is_dummy: true,
        };
      }
      if (!entityPerms.delete) {
        entityPerms.delete = {
          id: dummyIdCounter--,
          url: `/${group.entity.toLowerCase()}/delete`,
          method: 'DELETE',
          entity: group.entity,
          has_permission: false,
          is_dummy: true,
        };
      }

      return entityPerms;
    });
  };

  const loadPermissions = async () => {
    try {
      setLoading(true);
      const permissions = await permissionService.getGroupedByRole(role.id!);
      const organized = organizePermissions(permissions);

      // Cargar estados de permisos dummy desde localStorage
      const savedDummies = dummyPermissionService.getDummyPermissions(role.id!);
      if (savedDummies.length > 0) {
        console.log('📂 Loaded dummy permissions from storage:', savedDummies);

        // Aplicar estados guardados a los permisos dummy
        const updatedOrganized = organized.map((entity) => {
          const updated = { ...entity };

          (['view', 'list', 'create', 'update', 'delete'] as const).forEach(
            (permType) => {
              const perm = updated[permType];
              if (perm?.is_dummy) {
                const saved = savedDummies.find(
                  (sp) => sp.entity === entity.entity && sp.url === perm.url,
                );
                if (saved) {
                  updated[permType] = {
                    ...perm,
                    has_permission: saved.has_permission ?? false,
                  };
                }
              }
            },
          );
          return updated;
        });
        setOrganizedPermissions(updatedOrganized);
      } else {
        setOrganizedPermissions(organized);
      }
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
    isDummy: boolean,
  ) => {
    try {
      if (!isDummy) {
        // Permiso real - actualizar en backend
        if (currentState) {
          await rolePermissionService.delete(role.id!, permissionId);
        } else {
          await rolePermissionService.create(role.id!, permissionId);
        }
      }

      // Actualizar estado local (tanto para reales como dummy)
      const updatedPermissions = organizedPermissions.map((entity) => ({
        ...entity,
        view:
          entity.view?.id === permissionId
            ? { ...entity.view, has_permission: !currentState }
            : entity.view,
        list:
          entity.list?.id === permissionId
            ? { ...entity.list, has_permission: !currentState }
            : entity.list,
        create:
          entity.create?.id === permissionId
            ? { ...entity.create, has_permission: !currentState }
            : entity.create,
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

      // Guardar permisos dummy en localStorage
      const dummyPerms: PermissionWithStatus[] = [];
      updatedPermissions.forEach((entity) => {
        (['view', 'list', 'create', 'update', 'delete'] as const).forEach(
          (permType) => {
            const perm = entity[permType];
            if (perm?.is_dummy && perm.has_permission) {
              dummyPerms.push(perm);
            }
          },
        );
      });
      dummyPermissionService.saveDummyPermissions(role.id!, dummyPerms);
    } catch (error) {
      console.error('Error updating permission:', error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudo actualizar el permiso',
        icon: 'error',
      });
    }
  };

  const handleSave = () => {
    Swal.fire({
      title: 'Guardado',
      text: 'Los permisos han sido actualizados correctamente',
      icon: 'success',
      timer: 2000,
    });
    onClose();
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <p className="text-gray-800">Cargando permisos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header con botón de cerrar */}
        <div className="border-b border-gray-200 px-6 py-4 bg-gray-50 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">
            {role.name} - Permissions
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Close"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="border border-gray-300 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-300 w-48">
                    Model
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-300">
                    View
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-300">
                    List
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-300">
                    Create
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-300">
                    Update
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Delete
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {organizedPermissions.map((entity, index) => (
                  <tr
                    key={index}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900 border-r border-gray-200">
                      {entity.entity}
                    </td>

                    {(
                      ['view', 'list', 'create', 'update', 'delete'] as const
                    ).map((permType, idx) => {
                      const perm = entity[permType];
                      const isLast = idx === 4;

                      return (
                        <td
                          key={permType}
                          className={`px-6 py-4 text-center ${
                            !isLast ? 'border-r border-gray-200' : ''
                          }`}
                        >
                          <div className="flex justify-center items-center">
                            {perm ? (
                              <div className="relative group">
                                <input
                                  type="checkbox"
                                  checked={perm.has_permission || false}
                                  onChange={() =>
                                    handlePermissionToggle(
                                      perm.id!,
                                      perm.has_permission || false,
                                      perm.is_dummy || false,
                                    )
                                  }
                                  className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
                                />
                                {perm.is_dummy && (
                                  <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                    Dummy Permission
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {organizedPermissions.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                No hay permisos disponibles
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-stroke px-6 py-4 bg-whiten dark:bg-boxdark flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-6 py-2.5 rounded-lg border border-stroke text-body font-semibold transition-all duration-200 
               hover:bg-gray dark:hover:bg-graydark focus:ring-2 focus:ring-secondary 
               disabled:opacity-65 disabled:cursor-not-allowed shadow-1"
          >
            Cancelar
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className={`px-6 py-2.5 rounded-lg text-white font-semibold transition-all duration-200 
               ${
                 saving
                   ? 'bg-primary opacity-65 cursor-not-allowed'
                   : 'bg-primary hover:bg-blue-700 focus:ring-2 focus:ring-primary shadow-2'
               }`}
          >
            {saving ? 'Guardando...' : 'Aceptar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RolePermissionManager;
