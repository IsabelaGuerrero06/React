import { useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import GenericTable from "../../components/GenericTable";
import GenericButton from "../../components/GenericButton";
import GenericModal from "../../components/GenericModal";
import { User } from "../../models/User";
import { userService } from "../../services/userService";
import { roleService, Role } from "../../services/roleService";
import { useUILibrary } from "../../contexts/UILibraryContext";
import Swal from "sweetalert2";

// Extender User para incluir roleId si no lo tiene
interface UserWithRole extends User {
  roleId?: number;
  roleName?: string;
}

const ListUsers: React.FC = () => {
  const navigate = useNavigate();
  const { currentLibrary } = useUILibrary();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithRole | null>(null);
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [currentRoleId, setCurrentRoleId] = useState<number | null>(null);
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const users = await userService.getUsers();
      setUsers(users);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchRoles = async () => {
    try {
      setLoadingRoles(true);
      const roles = await roleService.getRoles();
      setAvailableRoles(roles);
    } catch (error) {
      console.error("Error fetching roles:", error);
      Swal.fire({
        title: "Error",
        text: "No se pudieron cargar los roles disponibles",
        icon: "error",
        timer: 2000,
      });
    } finally {
      setLoadingRoles(false);
    }
  };

  const handleAction = async (action: string, item: User) => {
    const userWithRole = item as UserWithRole;
    
    if (action === "view") {
      navigate(`/user/${userWithRole.id}`);
    } else if (action === "edit") {
      navigate(`/users/update/${userWithRole.id}`);
    } else if (action === "delete") {
      Swal.fire({
        title: "Eliminación",
        text: "¿Está seguro de querer eliminar el registro?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "No",
      }).then(async (result) => {
        if (result.isConfirmed) {
          const success = await userService.deleteUser(userWithRole.id!);
          if (success) {
            Swal.fire({
              title: "Eliminado",
              text: "El registro se ha eliminado",
              icon: "success",
            });
            fetchData();
          }
        }
      });
    } else if (action === "role") {
      // Cargar roles disponibles al abrir el modal
      await fetchRoles();
      
      // Obtener el rol actual del usuario desde el servicio
      const currentRoleId = await roleService.getUserRoleId(userWithRole.id!);
      
      // Abrir modal de asignación de roles
      setSelectedUser(userWithRole);
      setCurrentRoleId(currentRoleId);
      setSelectedRoleId(currentRoleId);
      setIsRoleModalOpen(true);
    } else if (action === "profile") {
      navigate(`/profile/${userWithRole.id}`);
    } else if (action === "address") {
      navigate(`/address/${userWithRole.id}`);
    } else if (action === "digitalSignature") {
      navigate(`/digital-signature/${userWithRole.id}`);
    } else if (action === "devices") {
      navigate(`/devices/${userWithRole.id}`);
    } else if (action === "passwords") {
      navigate(`/passwords/${userWithRole.id}`);
    } else if (action === "sessions") {
      navigate(`/sessions/${userWithRole.id}`);
    }
  };

  const handleAssignRole = async () => {
    if (selectedRoleId === null || !selectedUser) {
      Swal.fire({
        title: "Advertencia",
        text: "Por favor seleccione un rol",
        icon: "warning",
        timer: 2000,
      });
      return;
    }

    // Verificar si el rol cambió
    if (selectedRoleId === currentRoleId) {
      Swal.fire({
        title: "Sin cambios",
        text: "El usuario ya tiene este rol asignado",
        icon: "info",
        timer: 2000,
      });
      setIsRoleModalOpen(false);
      return;
    }

    const selectedRole = availableRoles.find((r) => r.id === selectedRoleId);

    try {
      // Llamar al servicio para cambiar el rol (finaliza el actual y asigna el nuevo)
      const success = currentRoleId 
        ? await roleService.changeUserRole(selectedUser.id!, selectedRoleId)
        : await roleService.assignRoleToUser(selectedUser.id!, selectedRoleId);
      
      if (success) {
        // Actualizar el usuario en la lista local
        setUsers(users.map(u => 
          u.id === selectedUser.id 
            ? { ...u, roleId: selectedRoleId, roleName: selectedRole?.name }
            : u
        ));

        Swal.fire({
          title: "Completado",
          text: `Rol "${selectedRole?.name}" asignado a ${selectedUser.name}`,
          icon: "success",
          timer: 2000,
        });

        setIsRoleModalOpen(false);
        setSelectedUser(null);
        setSelectedRoleId(null);
        setCurrentRoleId(null);
        
        // Recargar usuarios para obtener datos actualizados
        fetchData();
      } else {
        Swal.fire({
          title: "Error",
          text: "No se pudo asignar el rol",
          icon: "error",
          timer: 2000,
        });
      }
    } catch (error) {
      console.error("Error al asignar rol:", error);
      Swal.fire({
        title: "Error",
        text: "Ocurrió un error al asignar el rol",
        icon: "error",
        timer: 2000,
      });
    }
  };

  const getCurrentRoleName = () => {
    if (!currentRoleId) return "Sin rol asignado";
    const role = availableRoles.find(r => r.id === currentRoleId);
    return role ? role.name : "Desconocido";
  };

  // Estilos adaptados según la librería UI
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
      {/* Header con título y botón */}
      <div className="flex items-center justify-between mb-4">
        <h2 className={getTitleStyles()}>Users</h2>

        <GenericButton
          label="+ Add User"
          onClick={() => navigate("/users/create")}
          variant="success"
          size="md"
        />
      </div>

      {/* Tabla genérica */}
      <GenericTable
        data={users}
        columns={["id", "name", "email"]}
        actions={[
          { name: "view", label: "View", variant: "info" },
          { name: "edit", label: "Update", variant: "primary" },
          { name: "delete", label: "Delete", variant: "danger" },
          { name: "role", label: "Role", variant: "success" },
          { name: "profile", label: "Profile", variant: "info" },
          { name: "address", label: "Address", variant: "secondary" },
          {
            name: "digitalSignature",
            label: "Digital Signature",
            variant: "success",
          },
          { name: "devices", label: "Devices", variant: "success" },
          { name: "passwords", label: "Passwords", variant: "primary" },
          { name: "sessions", label: "Sessions", variant: "secondary" },
        ]}
        onAction={handleAction}
      />

      {/* Modal para asignar/cambiar rol */}
      <GenericModal
        isOpen={isRoleModalOpen}
        onClose={() => {
          setIsRoleModalOpen(false);
          setSelectedUser(null);
          setSelectedRoleId(null);
          setCurrentRoleId(null);
        }}
        title="Asignar/Cambiar Rol del Usuario"
        size="md"
      >
        {selectedUser && (
          <div className="space-y-6">
            {/* Información del usuario */}
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Usuario seleccionado:
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {selectedUser.name}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {selectedUser.email}
              </p>
            </div>

            {/* Rol actual */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
              <p className="text-sm text-blue-700 dark:text-blue-300 mb-1 font-medium">
                🎭 Rol actual:
              </p>
              <p className="text-base font-bold text-blue-900 dark:text-blue-100">
                {getCurrentRoleName()}
              </p>
            </div>

            {/* Lista de roles disponibles */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Seleccione un nuevo rol:
              </label>
              
              {loadingRoles ? (
                <div className="text-center py-8">
                  <p className="text-gray-600 dark:text-gray-400">Cargando roles...</p>
                </div>
              ) : availableRoles.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                  <p className="text-gray-600 dark:text-gray-400">
                    No hay roles disponibles. Por favor, cree roles primero.
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {availableRoles.map((role) => (
                    <label
                      key={role.id}
                      className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedRoleId === role.id
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md"
                          : currentRoleId === role.id
                          ? "border-green-400 bg-green-50 dark:bg-green-900/20"
                          : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
                      }`}
                    >
                      <input
                        type="radio"
                        name="role"
                        value={role.id}
                        checked={selectedRoleId === role.id}
                        onChange={() => setSelectedRoleId(role.id)}
                        className="mt-1 w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            {role.name}
                          </p>
                          {currentRoleId === role.id && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                              ✓ Actual
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {role.description}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Botones de acción */}
            <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <GenericButton
                label={currentRoleId ? "Cambiar Rol" : "Asignar Rol"}
                onClick={handleAssignRole}
                variant="success"
                size="md"
              />
              <GenericButton
                label="Cancelar"
                onClick={() => {
                  setIsRoleModalOpen(false);
                  setSelectedUser(null);
                  setSelectedRoleId(null);
                  setCurrentRoleId(null);
                }}
                variant="secondary"
                size="md"
              />
            </div>
          </div>
        )}
      </GenericModal>
    </div>
  );
};

export default ListUsers;