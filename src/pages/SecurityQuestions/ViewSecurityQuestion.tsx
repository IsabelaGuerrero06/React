import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { SecurityQuestion } from "../../models/SecurityQuestion";
import { securityQuestionService } from "../../services/securityQuestionService";
import Breadcrumb from "../../components/Breadcrumb";
import GenericTable from "../../components/GenericTable";
import GenericButton from "../../components/GenericButton";

const ViewSecurityQuestion: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  // 👇 usamos "any" para aceptar también created_at / updated_at
  const [question, setQuestion] = useState<any | null>(null);

  useEffect(() => {
    const fetchQuestion = async () => {
      if (!id) return;
      const data = await securityQuestionService.getById(parseInt(id));
      if (!data) {
        Swal.fire({
          title: "Not Found",
          text: "No se encontró la pregunta de seguridad.",
          icon: "error",
          timer: 2500,
        });
        navigate("/security-questions/list");
        return;
      }
      setQuestion(data);
    };
    fetchQuestion();
  }, [id, navigate]);

  if (!question) {
    return <div className="p-4 text-gray-600">Cargando pregunta...</div>;
  }

  const questionData = [question];

  const handleAction = async (action: string, item: SecurityQuestion) => {
    if (action === "back") navigate("/security-questions/list");
    else if (action === "edit") navigate(`/security-questions/update/${item.id}`);
    else if (action === "delete") {
      Swal.fire({
        title: "Eliminar",
        text: "¿Seguro que deseas eliminar esta pregunta?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar",
      }).then(async (result) => {
        if (result.isConfirmed) {
          const success = await securityQuestionService.delete(item.id!);
          if (success) {
            Swal.fire({
              title: "Eliminada",
              text: "La pregunta ha sido eliminada correctamente.",
              icon: "success",
              timer: 2500,
            });
            navigate("/security-questions/list");
          } else {
            Swal.fire({
              title: "Error",
              text: "No se pudo eliminar la pregunta.",
              icon: "error",
            });
          }
        }
      });
    }
  };

  // 👇 formato bonito para las fechas
  const formatDate = (date: string | null | undefined) => {
    if (!date) return "—";
    const d = new Date(date);
    return d.toLocaleString();
  };

  // 👇 mapeamos los campos incluyendo las fechas
  const displayedData = questionData.map((q: any) => ({
    id: q.id,
    name: q.name,
    description: q.description,
    created_at: formatDate(q.created_at),
    updated_at: formatDate(q.updated_at),
  }));

  return (
    <div className="p-4">
      <Breadcrumb pageName="Ver Pregunta de Seguridad" />
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
          Security Question Details
        </h2>

        <GenericButton
          label="Back to List"
          onClick={() => handleAction("back", question)}
          variant="secondary"
        />
      </div>

      <GenericTable
        data={displayedData}
        columns={["id", "name", "description", "created_at", "updated_at"]}
        actions={[
          { name: "edit", label: "Edit", variant: "primary" },
          { name: "delete", label: "Delete", variant: "danger" },
        ]}
        onAction={handleAction}
      />
    </div>
  );
};

export default ViewSecurityQuestion;
