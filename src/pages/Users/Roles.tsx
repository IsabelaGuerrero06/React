import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import GenericTable from "../../components/GenericTable";
import GenericButton from "../../components/GenericButton";
import GenericModal from "../../components/GenericModal";
import GenericForm, { FormField } from "../../components/GenericForm";
import { useUILibrary } from "../../contexts/UILibraryContext";
import { roleService, Role } from "../../services/roleService";
import RolePermissionManager from "../../components/RolePermissionManger"; // NUEVA IMPORTACIÓN
import Swal from "sweetalert2";

const UsersRoles: React.FC = () => {
  const navigate = useNavigate();
  const { currentLibrary } = useUILibrary();

  const [roles, setRoles] = useState<Role[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"view" | "add" | "edit" | "permissions">("view");
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPermissionManager, setShowPermissionManager] = useState(false); // NUEVO ESTADO

  // Cargar roles al montar el componente
  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const rolesData = await roleService.getRoles();
      setRoles(rolesData);
    } catch (error) {
      console.error("Error fetching roles:", error);
      Swal.fire({
        title: "Error",
        text: "No se pudieron cargar los roles",
        icon: "error",
        timer: 2000,
      });
    } finally {
      setLoading(false);
    }
  };

  // Campos del formulario
  const formFields: FormField[] = [
    {
      name: "name",
      label: "Role Name",
      type: "text",
      required: true,
      placeholder: "Enter role name",
    },
    {
      name: "description",
      label: "Description",
      type: "textarea",
      required: true,
      placeholder: "Enter role description",
    },
  ];

  const handleAction = (action: string, item: Record<string, any>) => {
    const role = item as Role;
    
    if (action === "view") {
      setSelectedRole(role);
      setModalType("view");
      setIsModalOpen(true);
    } else if (action === "edit") {
      setSelectedRole(role);
      setModalType("edit");
      setIsModalOpen(true);
    } else if (action === "delete") {
      Swal.fire({
        title: "Eliminación",
        text: `¿Está seguro de querer eliminar el rol "${role.name}"?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "No",
      }).then(async (result) => {
        if (result.isConfirmed) {
          const success = await roleService.deleteRole(role.id);
          if (success) {
            Swal.fire({
              title: "Eliminado",
              text: "El rol se ha eliminado correctamente",
              icon: "success",
              timer: 2000,
            });
            fetchRoles(); // Recargar roles
          } else {
            Swal.fire({
              title: "Error",
              text: "No se pudo eliminar el rol",
              icon: "error",
              timer: 2000,
            });
          }
        }
      });
    } else if (action === "permissions") {
      setSelectedRole(role);
      setShowPermissionManager(true); // NUEVO: Abrir el RolePermissionManager
    }
  };

  const handleAddNew = () => {
    setSelectedRole(null);
    setModalType("add");
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (data: Record<string, any>) => {
    try {
      if (modalType === "add") {
        await roleService.createRole({
          name: data.name,
          description: data.description,
        });
        Swal.fire({
          title: "Completado",
          text: "Se ha creado correctamente el rol",
          icon: "success",
          timer: 2000,
        });
      } else if (modalType === "edit" && selectedRole) {
        await roleService.updateRole(selectedRole.id, {
          name: data.name,
          description: data.description,
        });
        Swal.fire({
          title: "Completado",
          text: "Se ha actualizado correctamente el rol",
          icon: "success",
          timer: 2000,
        });
      }
      setIsModalOpen(false);
      fetchRoles(); // Recargar roles
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: "Ocurrió un error al guardar el rol",
        icon: "error",
        timer: 2000,
      });
    }
  };

  // NUEVA FUNCIÓN: Manejar el cierre del RolePermissionManager
  const handlePermissionsClose = () => {
    setShowPermissionManager(false);
    setSelectedRole(null);
  };

  const getTitleStyles = () => {
    switch (currentLibrary) {
      case "material":
        return "text-3xl font-bold mb-6 text-indigo-900 dark:text-indigo-100";
      case "bootstrap":
        return "text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100";
      default:
        return "text-2xl font-semibold mb-4 text-slate-800 dark:text-slate-100";
    }
  };

  const getContainerStyles = () => {
    switch (currentLibrary) {
      case "material":
        return "p-6";
      case "bootstrap":
        return "p-4";
      default:
        return "p-4";
    }
  };

  if (loading) {
    return (
      <div className={getContainerStyles()}>
        <div className="flex items-center justify-center h-64">
          <p className="text-lg text-gray-600 dark:text-gray-400">Cargando roles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={getContainerStyles()}>
      {/* Header con título y botón */}
      <div className="flex items-center justify-between mb-4">
        <h2 className={getTitleStyles()}>Roles Management</h2>

        <GenericButton
          label="+ Add Role"
          onClick={handleAddNew}
          variant="success"
          size="md"
        />
      </div>

      {/* Tabla con roles */}
      <GenericTable
        data={roles}
        columns={["id", "name", "description"]}
        actions={[
          { name: "view", label: "View", variant: "info" as const },
          { name: "edit", label: "Update", variant: "primary" as const },
          { name: "delete", label: "Delete", variant: "danger" as const },
          { name: "permissions", label: "Permissions", variant: "success" as const },
        ]}
        onAction={handleAction}
      />

      {/* Modal multifuncional (MANTENIDO COMPLETO) */}
      <GenericModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          modalType === "view"
            ? "View Role"
            : modalType === "edit"
            ? "Edit Role"
            : modalType === "add"
            ? "Add New Role"
            : "Manage Permissions"
        }
        size="lg"
      >
        {/* Vista de detalle */}
        {modalType === "view" && selectedRole && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                ID
              </label>
              <p className="text-base text-gray-900 dark:text-gray-100">
                {selectedRole.id}
              </p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Name
              </label>
              <p className="text-base text-gray-900 dark:text-gray-100">
                {selectedRole.name}
              </p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <p className="text-base text-gray-900 dark:text-gray-100">
                {selectedRole.description}
              </p>
            </div>
          </div>
        )}

        {/* Formulario para agregar/editar */}
        {(modalType === "add" || modalType === "edit") && (
          <GenericForm
            fields={formFields}
            initialData={selectedRole || {}}
            onSubmit={handleFormSubmit}
            onCancel={() => setIsModalOpen(false)}
            submitLabel={modalType === "add" ? "Create Role" : "Update Role"}
            cancelLabel="Cancel"
            mode={modalType === "add" ? "create" : "edit"}
          />
        )}

        {/* Gestión de permisos (MANTENIDO - ahora no se usa pero lo dejamos por si acaso) */}
        {modalType === "permissions" && selectedRole && (
          <div className="space-y-4">
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
              Configure permissions for role:{" "}
              <strong className="text-gray-900 dark:text-gray-100">
                {selectedRole.name}
              </strong>
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { id: "users", label: "Users Management", icon: "👥" },
                { id: "roles", label: "Roles Management", icon: "🎭" },
                { id: "permissions", label: "Permissions Management", icon: "🔒" },
                { id: "settings", label: "Settings", icon: "⚙️" },
                { id: "reports", label: "Reports", icon: "📊" },
                { id: "logs", label: "System Logs", icon: "📋" },
              ].map((perm) => (
                <label
                  key={perm.id}
                  className="flex items-center gap-3 p-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {perm.icon} {perm.label}
                  </span>
                </label>
              ))}
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <GenericButton
                label="Save Permissions"
                onClick={() => {
                  Swal.fire({
                    title: "Completado",
                    text: "Permisos actualizados correctamente",
                    icon: "success",
                    timer: 2000,
                  });
                  setIsModalOpen(false);
                }}
                variant="success"
                size="md"
              />
              <GenericButton
                label="Cancel"
                onClick={() => setIsModalOpen(false)}
                variant="secondary"
                size="md"
              />
            </div>
          </div>
        )}
      </GenericModal>

      {/* NUEVO: Modal de gestión de permisos real */}
      {showPermissionManager && selectedRole && (
        <RolePermissionManager
          role={selectedRole}
          onClose={handlePermissionsClose}
        />
      )}
    </div>
  );
};

export default UsersRoles;