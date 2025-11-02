
import { useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import GenericTable from "../../components/GenericTable";
import GenericButton from "../../components/GenericButton";
import { Permission } from "../../models/Permission";
import { permissionService } from "../../services/permissionService";
import { useUILibrary } from "../../contexts/UILibraryContext";
import Swal from "sweetalert2";
import Breadcrumb from "../../components/Breadcrumb";

const Permissions: React.FC = () => {
  const navigate = useNavigate();
  const { currentLibrary } = useUILibrary();
  const [permissions, setPermissions] = useState<Permission[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  

  const fetchData = async () => {
    try {
      const permissions = await permissionService.getAll();
      setPermissions(permissions);
    } catch (error) {
      console.error("Error fetching permissions:", error);
    }
  };

  const handleAction = async (action: string, item: Record<string, any>) => {
    const permission = item as Permission;
    if (action === "view") {
      Swal.fire({
        title: "Detalle del Permiso",
        html: `
          <div style="text-align: left;">
            <p><strong>ID:</strong> ${item.id}</p>
            <p><strong>URL:</strong> ${item.url}</p>
            <p><strong>Method:</strong> ${item.method}</p>
            <p><strong>Entity:</strong> ${item.entity || 'N/A'}</p>
          </div>
        `,
        icon: "info"
      });
    } else if (action === "edit") {
      navigate(`/permissions/update/${item.id}`);
    } else if (action === "delete") {
      if (!item.id) {
        Swal.fire({
          title: "Error",
          text: "ID de permiso no válido",
          icon: "error",
        });
        return;
      }

      Swal.fire({
        title: "Eliminación",
        text: "¿Está seguro de querer eliminar el permiso?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "No",
      }).then(async (result) => {
        if (result.isConfirmed && item.id) {
          try {
            await permissionService.delete(item.id);
            Swal.fire({
              title: "Eliminado",
              text: "El permiso se ha eliminado",
              icon: "success",
            });
            fetchData();
          } catch (error) {
            Swal.fire({
              title: "Error",
              text: "No se pudo eliminar el permiso",
              icon: "error",
            });
          }
        }
      });
    }
  };

  const getTitleStyles = () => {
    switch (currentLibrary) {
      case "material":
        return "text-3xl font-bold mb-6 text-indigo-900";
      case "bootstrap":
        return "text-2xl font-semibold mb-4 text-gray-800";
      default:
        return "text-2xl font-semibold mb-4 text-slate-800";
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

  return (
    <div className={getContainerStyles()}>
      <Breadcrumb pageName="Permissions" />

      {/* Header con título y botón */}
      <div className="flex items-center justify-between mb-4">
        <h2 className={getTitleStyles()}>Permissions</h2>

        <GenericButton
          label="+ Add Permission"
          onClick={() => navigate("/permissions/create")}
          variant="success"
          size="md"
        />
      </div>

      {/* Tabla genérica */}
      <GenericTable
        data={permissions}
        columns={["id", "url", "method", "entity"]}
        actions={[
          { name: "view", label: "View", variant: "info" },
          { name: "edit", label: "Update", variant: "primary" },
          { name: "delete", label: "Delete", variant: "danger" },
        ]}
        onAction={handleAction}
      />
    </div>
  );
};

export default Permissions;