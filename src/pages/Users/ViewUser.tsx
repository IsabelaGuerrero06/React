import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { User } from "../../models/User";
import { userService } from "../../services/userService";
import GenericTable from "../../components/GenericTable";
import GenericButton from "../../components/GenericButton";

const ViewUser: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  // 👇 usamos "any" para aceptar también created_at / updated_at si existen
  const [user, setUser] = useState<any | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      if (!id) return;
      const data = await userService.getUserById(parseInt(id));
      if (!data) {
        Swal.fire({
          title: "Not Found",
          text: "The user could not be found.",
          icon: "error",
          timer: 2500,
        });
        navigate("/users/list");
        return;
      }
      setUser(data);
    };
    fetchUser();
  }, [id, navigate]);

  if (!user) {
    return <div className="p-4 text-gray-600">Loading user...</div>;
  }

  const userData = [user];

  const handleAction = async (action: string, item: User) => {
    if (action === "back") {
      navigate("/users/list");
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
            navigate("/users/list");
          } else {
            Swal.fire({
              title: "Error",
              text: "The user could not be deleted.",
              icon: "error",
            });
          }
        }
      });
    } else if (action === "profile") {
      navigate(`/profile/${item.id}`);
    } else if (action === "address") {
      navigate(`/address/${item.id}`);
    } else if (action === "digitalSignature") {
      navigate(`/digital-signature/${item.id}`);
    } else if (action === "securityQuestions") {
      navigate(`/security-questions/list`);
    } else if (action === "answers") {
      navigate(`/answers/user/${item.id}`);
    } else if (action === "devices") {
      navigate(`/devices/user/${item.id}`);
    } else if (action === "passwords") {
      navigate(`/passwords/${item.id}`);
    } else if (action === "sessions") {
      navigate(`/sessions/${item.id}`);
    }
  };

  // 👇 formato bonito para las fechas
  const formatDate = (date: string | null | undefined) => {
    if (!date) return "—";
    const d = new Date(date);
    return d.toLocaleString();
  };

  // 👇 mapeamos los campos incluyendo las fechas si existen
  const displayedData = userData.map((u: any) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    created_at: formatDate(u.created_at),
    updated_at: formatDate(u.updated_at),
  }));

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
          User Details
        </h2>

        <GenericButton
          label="Back to List"
          onClick={() => handleAction("back", user)}
          variant="secondary"
        />
      </div>

      <GenericTable
        data={displayedData}
        columns={[
          "id",
          "name",
          "email",
          "created_at",
          "updated_at",
        ]}
        actions={[
          { name: "edit", label: "Edit", variant: "primary" },
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

export default ViewUser;