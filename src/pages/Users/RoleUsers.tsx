import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { roleService } from "../../services/roleService";
import { userService } from "../../services/userService";
import GenericTable from "../../components/GenericTable";
import GenericButton from "../../components/GenericButton";
import GenericModal from "../../components/GenericModal";
import Swal from "sweetalert2";
import Breadcrumb from "../../components/Breadcrumb";
import { Role } from "../../services/roleService";
import { User } from "../../models/User";

const RoleUsers: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [role, setRole] = useState<Role | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  useEffect(() => {
    if (!id) return;
    fetchAllUsers();
    fetchRole();
    fetchUsersWithRole();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchAllUsers = async () => {
    try {
      const u = await userService.getUsers();
      setAllUsers(u);
    } catch (error) {
      console.error("Error fetching all users:", error);
      setAllUsers([]);
    }
  };

  const fetchRole = async () => {
    try {
      const r = await roleService.getRoleById(Number(id));
      setRole(r);
    } catch (error) {
      console.error("Error fetching role:", error);
      setRole(null);
    }
  };

  const fetchUsersWithRole = async () => {
    try {
  const userIds = await (roleService as any).getUserIdsByRole(Number(id));
      // fetch user details for each id (or filter from allUsers if available)
      const usersData: User[] = [];
      for (const uid of userIds) {
        const u = await userService.getUserById(uid);
        if (u) usersData.push(u);
      }
      setUsers(usersData);
    } catch (error) {
      console.error("Error fetching users with role:", error);
      setUsers([]);
    }
  };

  const handleRemove = async (item: any) => {
    const user = item as User;
    Swal.fire({
      title: "Quitar rol",
      text: `¿Deseas quitar el rol a ${user.name}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, quitar",
      cancelButtonText: "Cancelar",
    }).then(async (res) => {
      if (res.isConfirmed) {
  const ok = await (roleService as any).removeRoleFromUser(user.id!, Number(id));
        if (ok) {
          Swal.fire("Eliminado", "Rol eliminado correctamente", "success");
          fetchUsersWithRole();
        } else {
          Swal.fire("Error", "No se pudo eliminar el rol", "error");
        }
      }
    });
  };

  const openAddModal = () => {
    setSelectedUserId(null);
    setIsModalOpen(true);
  };

  const handleAdd = async () => {
    if (!selectedUserId) return;
  const ok = await (roleService as any).assignRoleToUser(selectedUserId, Number(id));
    if (ok) {
      Swal.fire("Completado", "Usuario añadido al rol", "success");
      setIsModalOpen(false);
      fetchUsersWithRole();
    } else {
      Swal.fire("Error", "No se pudo asignar el rol", "error");
    }
  };

  // users available to add = allUsers - users
  const usersToAdd = allUsers.filter(u => !users.some(uu => uu.id === u.id));

  return (
    <div className="p-6">
      <Breadcrumb pageName={`Users with role`} />
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">
          Usuarios con rol: <span className="text-indigo-600">{role?.name}</span>
        </h2>
        <div className="flex gap-2">
          <GenericButton label="Back" variant="secondary" onClick={() => navigate(-1)} />
          <GenericButton label="Add User" variant="success" onClick={openAddModal} />
        </div>
      </div>

      <GenericTable
        data={users}
        columns={["id", "name", "email"]}
        actions={[{ name: "remove", label: "Remove Role", variant: "danger" }]}
        onAction={(action, item) => { if (action === 'remove') handleRemove(item); }}
      />

      <GenericModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add User to Role">
        <div className="space-y-4">
          {usersToAdd.length === 0 ? (
            <p>No hay usuarios disponibles para asignar.</p>
          ) : (
            <select className="w-full border rounded p-2" value={selectedUserId ?? ''} onChange={(e) => setSelectedUserId(e.target.value ? Number(e.target.value) : null)}>
              <option value="">-- Selecciona un usuario --</option>
              {usersToAdd.map(u => (
                <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
              ))}
            </select>
          )}

          <div className="flex justify-end gap-2">
            <GenericButton label="Cancelar" variant="secondary" onClick={() => setIsModalOpen(false)} />
            <GenericButton label="Agregar" variant="success" onClick={handleAdd} />
          </div>
        </div>
      </GenericModal>
    </div>
  );
};

export default RoleUsers;
