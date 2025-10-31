import React, { useState, useEffect } from "react";
import Breadcrumb from "../components/Breadcrumb";
import GenericTable from "../components/GenericTable";
import { Permission } from "../models/Permission";
import { permissionService } from "../services/permissionService";

const Permissions: React.FC = () => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Datos mock como fallback
  const mockPermissions: Permission[] = [
    { id: 1, url: "/users", method: "GET" },
    { id: 2, url: "/users/:id", method: "DELETE" },
    { id: 3, url: "/users", method: "POST" },
    { id: 4, url: "/roles", method: "GET" },
    { id: 5, url: "/roles/:id", method: "PUT" },
  ];

  // Cargar permisos al montar el componente
  useEffect(() => {
    loadPermissions();
  }, []);

  const loadPermissions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Intentar cargar desde el API
      try {
        const data = await permissionService.getAll();
        setPermissions(data);
      } catch (apiError) {
        console.warn("API no disponible, usando datos mock:", apiError);
        // Si falla el API, usar datos mock
        setPermissions(mockPermissions);
      }
    } catch (err) {
      setError("Error al cargar los permisos");
      console.error("Error loading permissions:", err);
      // Incluso si hay error, mostrar datos mock
      setPermissions(mockPermissions);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (action: string, item: Record<string, any>) => {
    // Convertir el item genérico a Permission
    const permission = item as Permission;

    switch (action) {
      case "view":
        console.log("View permission:", permission);
        // Aquí puedes abrir un modal o navegar a una página de detalles
        alert(`Ver permiso:\nID: ${permission.id}\nURL: ${permission.url}\nMétodo: ${permission.method}`);
        break;

      case "update":
        console.log("Update permission:", permission);
        // Aquí puedes abrir un modal de edición
        alert(`Editar permiso: ${permission.id}`);
        break;

      case "delete":
        if (window.confirm(`¿Está seguro de eliminar el permiso con ID ${permission.id}?`)) {
          deletePermission(permission.id);
        }
        break;

      default:
        console.log("Unknown action:", action);
    }
  };

  const deletePermission = async (id: number) => {
    try {
      // Intentar eliminar del API
      try {
        await permissionService.delete(id);
        alert("Permiso eliminado exitosamente");
      } catch (apiError) {
        console.warn("API no disponible, eliminando del estado local:", apiError);
        alert("Permiso eliminado exitosamente (modo local)");
      }
      
      // Eliminar del estado local
      setPermissions(permissions.filter(p => p.id !== id));
    } catch (err) {
      console.error("Error deleting permission:", err);
      alert("Error al eliminar el permiso");
    }
  };

  const handleCreatePermission = () => {
    console.log("Create new permission");
    // Aquí puedes abrir un modal o navegar a una página de creación
    alert("Abrir formulario de creación de permiso");
  };

  if (loading) {
    return (
      <>
        <Breadcrumb pageName="Permissions" />
        <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
          <div className="flex justify-center items-center py-10">
            <p className="text-gray-600 dark:text-gray-400">Cargando permisos...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Breadcrumb pageName="Permissions" />

      <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
        <div className="mb-6 flex justify-between items-center">
          <h4 className="text-xl font-semibold text-black dark:text-white">
            Permissions Management
          </h4>
          <button
            className="inline-flex items-center justify-center rounded-md bg-primary py-2 px-6 text-center font-medium text-white hover:bg-opacity-90"
            onClick={handleCreatePermission}
          >
            Add Permission
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-md bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 px-4 py-3">
            <p className="text-sm text-yellow-800 dark:text-yellow-300">
              ⚠️ Mostrando datos de ejemplo. El API no está disponible.
            </p>
          </div>
        )}

        <GenericTable
          data={permissions}
          columns={["id", "url", "method"]}
          actions={[
            { name: "view", label: "View", variant: "info" },
            { name: "update", label: "Update", variant: "primary" },
            { name: "delete", label: "Delete", variant: "danger" },
          ]}
          onAction={handleAction}
        />
      </div>
    </>
  );
};

export default Permissions;