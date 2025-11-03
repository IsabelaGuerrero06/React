import React, { useState } from 'react'; // Asegúrate de importar useState
import { User } from '../../models/User';
import UserFormValidator from '../../components/UserFormValidator';
import { createProfile } from "../../services/ProfileService";
import Swal from 'sweetalert2';
import { userService } from "../../services/userService";
import Breadcrumb from '../../components/Breadcrumb';
import { useNavigate } from "react-router-dom";

const CreateUser: React.FC = () => {
    const navigate = useNavigate();

    // Estado para almacenar el usuario a editar

    // Lógica de creación
    const handleCreateUser = async (user: User) => {
  try {
    const createdUser = await userService.createUser(user);

    if (createdUser) {
      const formData = new FormData();
      formData.append("phone", "");
      formData.append("fullName", createdUser.name || "Usuario sin nombre"); // ✅ nuevo

      await createProfile(createdUser.id!, formData);

      Swal.fire({
        title: "Completado",
        text: "Se ha creado correctamente el usuario y su perfil.",
        icon: "success",
        timer: 3000,
      });

      console.log("🆕 Usuario y perfil creados:", createdUser);
      navigate("/users/list");
    } else {
      Swal.fire({
        title: "Error",
        text: "Existe un problema al momento de crear el usuario.",
        icon: "error",
        timer: 3000,
      });
    }
  } catch (error) {
    console.error("❌ Error en creación de usuario:", error);
    Swal.fire({
      title: "Error",
      text: "Existe un problema al momento de crear el registro.",
      icon: "error",
      timer: 3000,
    });
  }
};

    return (
        <div>
            {/* Formulario para crear un nuevo usuario */}
            <h2>Create User</h2>
            <Breadcrumb pageName="Crear Usuario" />
            <UserFormValidator
                handleCreate={handleCreateUser}
                mode={1} // 1 significa creación
            />
        </div>
    );
};

export default CreateUser;