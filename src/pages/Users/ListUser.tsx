import { useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import GenericTable from "../../components/GenericTable";
import GenericButton from "../../components/GenericButton";
import { User } from "../../models/User";
import { userService } from "../../services/userService";
import { useUILibrary } from "../../contexts/UILibraryContext";
import Swal from "sweetalert2";

const ListUsers: React.FC = () => {
  const navigate = useNavigate();
  const { currentLibrary } = useUILibrary();
  const [users, setUsers] = useState<User[]>([]);

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
            fetchData();
          }
        }
      });
    } else if (action === "profile") {
      navigate(`/profile/${item.id}`);
    } else if (action === "address") {
      navigate(`/address/${item.id}`);
    } else if (action === "digitalSignature") {
      navigate(`/digital-signature/${item.id}`);
    } else if (action === "devices") {
      navigate(`/devices/${item.id}`);
    } else if (action === "securityQuestions") {
      navigate(`/security-questions/list`);
    } else if (action === "answers") {
      navigate(`/answers/list`);
    } else if (action === "passwords") {
      navigate(`/passwords/${item.id}`);
    } else if (action === "sessions") {
      navigate(`/sessions/${item.id}`);
    }
  };

  // 🎨 Estilos adaptados según la librería UI
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
          { name: "profile", label: "Profile", variant: "info" },
          { name: "address", label: "Address", variant: "secondary" },
          { name: "digitalSignature", label: "Digital Signature", variant: "success" },
          { name: "devices", label: "Devices", variant: "primary" },
          { name: "securityQuestions", label: "Security Questions", variant: "info" },
          { name: "answers", label: "Security Answers", variant: "secondary" },
          { name: "passwords", label: "Passwords", variant: "primary" },
          { name: "sessions", label: "Sessions", variant: "secondary" },
        ]}
        onAction={handleAction}
      />
    </div>
  );
};

export default ListUsers;
