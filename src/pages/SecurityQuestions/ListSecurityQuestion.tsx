// src/pages/securityQuestions/ListSecurityQuestion.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { securityQuestionService } from "../../services/securityQuestionService";
import { SecurityQuestion } from "../../models/SecurityQuestion";
import GenericTable from "../../components/GenericTable";
import GenericButton from "../../components/GenericButton";

const ListSecurityQuestion: React.FC = () => {
  const [questions, setQuestions] = useState<SecurityQuestion[]>([]);
  const navigate = useNavigate();

  // 🔹 Cargar todas las preguntas
  const fetchData = async () => {
    try {
      const data = await securityQuestionService.getAll();
      setQuestions(data);
    } catch (error) {
      console.error("Error fetching security questions:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 🔹 Manejar acciones
  const handleAction = async (action: string, item: SecurityQuestion) => {
    if (action === "view") {
      navigate(`/security-questions/${item.id}`);
    } else if (action === "edit") {
      navigate(`/security-questions/update/${item.id}`);
    } else if (action === "answers") {
      navigate(`/answers/question/${item.id}`);
    } else if (action === "delete") {
      Swal.fire({
        title: "Delete",
        text: "Are you sure you want to delete this security question?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it",
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            await securityQuestionService.delete(item.id!);
            Swal.fire({
              title: "Deleted",
              text: "Security question deleted successfully.",
              icon: "success",
              timer: 2000,
            });
            fetchData();
          } catch (err) {
            Swal.fire({
              title: "Error",
              text: "There was a problem deleting the question.",
              icon: "error",
            });
          }
        }
      });
    }
  };

  return (
    <div className="p-4">
      {/* Header con título y botones */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
          Security Questions
        </h2>

        <div className="flex gap-2">
          {/* Botón: Crear nueva pregunta */}
          <GenericButton
            label="+ Add Question"
            onClick={() => navigate("/security-questions/create")}
            variant="success"
          />

          {/* 🔹 Botón: volver a lista de usuarios */}
          <GenericButton
            label="Back to Users"
            onClick={() => navigate("/users/list")}
            variant="secondary"
          />
        </div>
      </div>

      {/* Tabla genérica */}
      <GenericTable
        data={questions}
        columns={["id", "name", "description"]}
        actions={[
          { name: "view", label: "View", variant: "info" },
          { name: "answers", label: "Answers", variant: "secondary" },
          { name: "edit", label: "Edit", variant: "primary" },
          { name: "delete", label: "Delete", variant: "danger" },
        ]}
        onAction={handleAction}
      />
    </div>
  );
};

export default ListSecurityQuestion;
