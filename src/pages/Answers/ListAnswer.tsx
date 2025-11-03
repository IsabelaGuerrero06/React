// src/pages/answers/ListAnswer.tsx
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { answerService } from "../../services/answerService";
import { Answer } from "../../models/Answer";
import { useEffect, useState } from "react";
import GenericTable from "../../components/GenericTable";
import GenericButton from "../../components/GenericButton";

const ListAnswer: React.FC = () => {
  const [answers, setAnswers] = useState<Answer[]>([]);
  const navigate = useNavigate();

  // 🔹 Cargar todas las respuestas
  const fetchData = async () => {
    try {
      const data = await answerService.getAnswers();
      setAnswers(data);
    } catch (error) {
      console.error("Error fetching answers:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 🔹 Acciones de la tabla
  const handleAction = async (action: string, item: Answer) => {
    if (action === "view") {
      navigate(`/answers/${item.id}`);
    } else if (action === "edit") {
      navigate(`/answers/update/${item.id}`);
    } else if (action === "delete") {
      Swal.fire({
        title: "Delete",
        text: "Are you sure you want to delete this answer?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it",
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            await answerService.deleteAnswer(item.id!);
            Swal.fire({
              title: "Deleted",
              text: "Answer deleted successfully.",
              icon: "success",
              timer: 2000,
            });
            fetchData();
          } catch (err) {
            Swal.fire({
              title: "Error",
              text: "There was a problem deleting the answer.",
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
          All Answers
        </h2>

        <div className="flex gap-2">
          {/* Crear nueva respuesta */}
          <GenericButton
            label="+ Add Answer"
            onClick={() => navigate("/answers/create")}
            variant="success"
          />

          {/* Volver a Users */}
          <GenericButton
            label="Back to Users"
            onClick={() => navigate("/users/list")}
            variant="secondary"
          />
        </div>
      </div>

      {/* Tabla genérica */}
      <GenericTable
        data={answers}
        columns={["id", "user_id", "security_question_id", "content"]}
        actions={[
          { name: "view", label: "View", variant: "info" },
          { name: "edit", label: "Edit", variant: "primary" },
          { name: "delete", label: "Delete", variant: "danger" },
        ]}
        onAction={handleAction}
      />
    </div>
  );
};

export default ListAnswer;
