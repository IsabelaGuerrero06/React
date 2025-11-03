import UserFormValidator from '../../components/UserFormValidator';
import { createProfile } from "../../services/ProfileService";
import React from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import GenericForm, { FormField } from "../../components/GenericForm";
import { userService } from "../../services/userService";
import { User } from "../../models/User";
import Breadcrumb from "../../components/Breadcrumb";

const CreateUser: React.FC = () => {
  const navigate = useNavigate();

  // Campos para GenericForm
  const formFields: FormField[] = [
    {
      name: "name",
      label: "Name",
      type: "text",
      required: true,
      placeholder: "Enter user name",
    },
    {
      name: "email",
      label: "Email",
      type: "email",
      required: true,
      placeholder: "Enter user email",
    },
  ];

  // Función unificada para crear usuario
  const handleCreateUser = async (data: Record<string, any> | User) => {
    try {
      const createdUser = await userService.createUser(data as User);

      if (createdUser) {
        const formData = new FormData();
        formData.append("phone", "");
        formData.append("fullName", createdUser.name || "Usuario sin nombre");

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
        text: "Ha ocurrido un error inesperado",
        icon: "error",
        timer: 3000,
      });
    }
  };

  return (
    <div className="p-6">
      <Breadcrumb pageName="Crear Usuario" />
      <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">
        Create User
      </h2>

      <UserFormValidator
        handleCreate={handleCreateUser}
        mode={1} // 1 significa creación
      />

      <GenericForm
        fields={formFields}
        onSubmit={handleCreateUser}
        submitLabel="Create"
        cancelLabel="Cancel"
        onCancel={() => navigate("/users/list")}
      />
    </div>
  );
};

export default CreateUser;
