import { useNavigate } from "react-router-dom";
import React, { useEffect, useState } from 'react';
import GenericTable from '../../components/GenericTable';
import { User } from '../../models/User';
import { userService } from '../../services/userService';
import { useUILibrary } from '../../contexts/UILibraryContext';
import Swal from 'sweetalert2';

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
      console.log('Users fetched:', users);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleAction = async (action: string, item: User) => {
    if (action === "view") {
      console.log('View user:', item);
      navigate(`/user/${item.id}`);
    } else if (action === 'edit') {
      console.log('Edit user:', item);
      navigate(`/users/update/${item.id}`);
    } else if (action === 'delete') {
      console.log('Delete user:', item);
      Swal.fire({
        title: 'Eliminación',
        text: '¿Está seguro de querer eliminar el registro?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Si, eliminar',
        cancelButtonText: 'No',
      }).then(async (result) => {
        if (result.isConfirmed) {
          const success = await userService.deleteUser(item.id!);
          if (success) {
            Swal.fire({
              title: 'Eliminado',
              text: 'El registro se ha eliminado',
              icon: 'success',
            });
          }
          // Vuelve a obtener los usuarios después de eliminar uno
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

  // Estilos dinámicos según la librería seleccionada
  const getButtonStyles = () => {
    switch (currentLibrary) {
      case 'material':
        return "mb-4 bg-indigo-600 text-white px-6 py-3 rounded shadow-md hover:bg-indigo-700 transition-all duration-200 font-medium";
      case 'bootstrap':
        return "mb-4 bg-blue-600 text-white px-4 py-2 rounded border border-blue-700 hover:bg-blue-700 font-medium";
      default: // tailwind
        return "mb-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors duration-200 font-medium";
    }
  };

  const getTitleStyles = () => {
    switch (currentLibrary) {
      case 'material':
        return "text-3xl font-bold mb-6 text-indigo-900";
      case 'bootstrap':
        return "text-2xl font-semibold mb-4 text-gray-800";
      default: // tailwind
        return "text-2xl font-semibold mb-4 text-slate-800";
    }
  };

  const getContainerStyles = () => {
    switch (currentLibrary) {
      case 'material':
        return "p-6";
      case 'bootstrap':
        return "p-4";
      default: // tailwind
        return "p-4";
    }
  };

  return (
    <div className={getContainerStyles()}>
      <h2 className={getTitleStyles()}>Users</h2>

      <button
        onClick={() => navigate("/users/create")}
        className={getButtonStyles()}
      >
        + Add User
      </button>

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
        uiLibrary={currentLibrary}
      />
    </div>
  );
};

export default ListUsers;