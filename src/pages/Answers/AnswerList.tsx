import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { answerService } from "../../services/answerService";
import { Answer } from "../../models/Answer";
import { useEffect, useState } from "react";
import GenericTable from "../../components/GenericTable";

const AnswerList: React.FC = () => {
  const [answers, setAnswers] = useState<Answer[]>([]);
  const navigate = useNavigate();

  // Cargar respuestas
  const fetchData = async () => {
    try {
      const data = await answerService.getAnswers();
      setAnswers(data);
    } catch (error) {
      console.error("Error al cargar las respuestas:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Columnas y acciones
  const columns = ["id", "user_id", "security_question_id", "content", "created_at"];
  const actions = [
    { name: "edit", label: "Editar" },
    { name: "delete", label: "Eliminar" },
  ];

  // Manejo de acciones
  const handleAction = async (action: string, item: Answer) => {
    if (action === "edit") {
      console.log("Edit answer:", item);
      navigate(`/answers/update/${item.id}`);
    } else if (action === "delete") {
      console.log("Delete answer:", item);

      Swal.fire({
        title: "Eliminación",
        text: "¿Está seguro de querer eliminar esta respuesta?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "No",
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            await answerService.deleteAnswer(item.id!);
            Swal.fire({
              title: "Eliminado",
              text: "La respuesta se ha eliminado correctamente.",
              icon: "success",
            });
            await fetchData(); // Recargar respuestas después de eliminar
          } catch (err) {
            console.error("Error al eliminar:", err);
            Swal.fire({
              title: "Error",
              text: "Hubo un problema al eliminar la respuesta.",
              icon: "error",
            });
          }
        }
      });
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Respuestas de seguridad</h2>
      <GenericTable
        data={answers}
        columns={columns}
        actions={actions}
        onAction={handleAction}
      />
    </div>
  );
};

export default AnswerList;
