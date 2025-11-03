import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import GenericForm, { FormField } from "../../components/GenericForm";
import { userService } from "../../services/userService";
import { User } from "../../models/User";

const UpdateUser: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      if (!id) return;
      const data = await userService.getUserById(Number(id));
      setUser(data);
    };
    fetchUser();
  }, [id]);

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

  const handleUpdateUser = async (data: Record<string, any>) => {
    try {
      if (!id) return;
      const updatedUser = await userService.updateUser(Number(id), data as User);
      if (updatedUser) {
        Swal.fire({
          title: "Success",
          text: "User updated successfully",
          icon: "success",
          timer: 2000,
        });
        navigate("/users/list");
      } else {
        Swal.fire({
          title: "Error",
          text: "There was a problem updating the user",
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

  if (!user) {
    return <div className="p-6 text-gray-700">Loading user...</div>;
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">
        Update User
      </h2>

      <GenericForm
        fields={formFields}
        initialData={user}
        onSubmit={handleUpdateUser}
        submitLabel="Update"
        cancelLabel="Cancel"
        onCancel={() => navigate("/users/list")}
        mode="edit"
      />
    </div>
  );
};

export default UpdateUser;
