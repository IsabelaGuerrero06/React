import React from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import GenericForm, { FormField } from "../../components/GenericForm";
import { userService } from "../../services/userService";
import { User } from "../../models/User";

const CreateUser: React.FC = () => {
  const navigate = useNavigate();

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

  const handleCreateUser = async (data: Record<string, any>) => {
    try {
      const createdUser = await userService.createUser(data as User);
      if (createdUser) {
        Swal.fire({
          title: "Success",
          text: "User created successfully",
          icon: "success",
          timer: 2000,
        });
        navigate("/users/list");
      } else {
        Swal.fire({
          title: "Error",
          text: "There was a problem creating the user",
          icon: "error",
          timer: 2000,
        });
      }
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: "An unexpected error occurred",
        icon: "error",
        timer: 2000,
      });
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">
        Create User
      </h2>

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
