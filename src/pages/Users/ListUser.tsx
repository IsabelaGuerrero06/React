import { useNavigate } from "react-router-dom"; 
import React, { useEffect, useState } from "react";
import GenericTable from "../../components/GenericTable";
import GenericButton from "../../components/GenericButton";
import { User } from "../../models/User";
import { userService } from "../../services/userService";
import Swal from "sweetalert2";

const ListUsers: React.FC = () => {
  const navigate = useNavigate();

  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    fetchData();
    console.log("Users fetched:", users);
  }, []);

  const fetchData = async () => {
    try {
      const users = await userService.getUsers();
      setUsers(users);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleAction = async (action: string, item: User) => {
    if (action === "view") {
      navigate(`/user/${item.id}`);
    } else if (action === "edit") {
      navigate(`/users/update/${item.id}`);
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
          const success = await userService.deleteUser(item.id!);
          if (success) {
            Swal.fire({
              title: "Eliminado",
              text: "El registro se ha eliminado",
              icon: "success",
            });
          }
          fetchData();
        }
      });
    }
    // Navegaciones a relaciones
    else if (action === "profile") {
      navigate(`/profile/${item.id}`);
    } else if (action === "address") {
      navigate(`/address/${item.id}`);
    } else if (action === "digitalSignature") {
      navigate(`/digital-signature/${item.id}`);
    } else if (action === "devices") {
      navigate(`/devices/${item.id}`);
    } else if (action === "passwords") {
      navigate(`/passwords/${item.id}`);
    } else if (action === "sessions") {
      navigate(`/sessions/${item.id}`);
    }
  };

  return (
    <div className="p-4">
      {/* Header con título y botón */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
          Users
        </h2>

        {/* Aquí usamos el GenericButton */}
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
          { name: "profile", label: "Profile", variant: "info" },
          { name: "address", label: "Address", variant: "secondary" },
          { name: "digitalSignature", label: "Digital Signature", variant: "success" },
          { name: "devices", label: "Devices", variant: "success" },
          { name: "passwords", label: "Passwords", variant: "primary" },
          { name: "sessions", label: "Sessions", variant: "secondary" },
        ]}
        onAction={handleAction}
      />
    </div>
  );
};

export default ListUsers;
