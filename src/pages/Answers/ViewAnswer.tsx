import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { Answer } from "../../models/Answer";
import { answerService } from "../../services/answerService";
import GenericTable from "../../components/GenericTable";
import GenericButton from "../../components/GenericButton";

const ViewAnswer: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  // 👇 usamos "any" para aceptar también created_at / updated_at
  const [answer, setAnswer] = useState<any | null>(null);

  useEffect(() => {
    const fetchAnswer = async () => {
      if (!id) return;
      const data = await answerService.getAnswerById(parseInt(id));
      if (!data) {
        Swal.fire({
          title: "Not Found",
          text: "The answer could not be found.",
          icon: "error",
          timer: 2500,
        });
        navigate("/answers/list");
        return;
      }
      setAnswer(data);
    };
    fetchAnswer();
  }, [id, navigate]);

  if (!answer) {
    return <div className="p-4 text-gray-600">Loading answer...</div>;
  }

  const answerData = [answer];

  const handleAction = async (action: string, item: Answer) => {
    if (action === "back") navigate("/answers/list");
    else if (action === "edit") navigate(`/answers/update/${item.id}`);
    else if (action === "delete") {
      Swal.fire({
        title: "Delete",
        text: "Are you sure you want to delete this answer?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it",
        cancelButtonText: "Cancel",
      }).then(async (result) => {
        if (result.isConfirmed) {
          const success = await answerService.deleteAnswer(item.id!);
          if (success) {
            Swal.fire({
              title: "Deleted",
              text: "The answer has been deleted successfully.",
              icon: "success",
              timer: 2500,
            });
            navigate("/answers/list");
          } else {
            Swal.fire({
              title: "Error",
              text: "The answer could not be deleted.",
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
  const displayedData = answerData.map((a: any) => ({
    id: a.id,
    user_id: a.user_id,
    security_question_id: a.security_question_id,
    content: a.content,
    created_at: formatDate(a.created_at),
    updated_at: formatDate(a.updated_at),
  }));

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
          Answer Details
        </h2>

        <GenericButton
          label="Back to List"
          onClick={() => handleAction("back", answer)}
          variant="secondary"
        />
      </div>

      <GenericTable
        data={displayedData}
        columns={[
          "id",
          "user_id",
          "security_question_id",
          "content",
          "created_at",
          "updated_at",
        ]}
        actions={[
          { name: "edit", label: "Edit", variant: "primary" },
          { name: "delete", label: "Delete", variant: "danger" },
        ]}
        onAction={handleAction}
      />
    </div>
  );
};

export default ViewAnswer;
