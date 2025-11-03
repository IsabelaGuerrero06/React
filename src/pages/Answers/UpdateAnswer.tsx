// src/pages/answers/UpdateAnswer.tsx
import React, { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import { useNavigate, useParams } from "react-router-dom";
import GenericForm, { FormField } from "../../components/GenericForm";
import { userService } from "../../services/userService";
import { securityQuestionService } from "../../services/securityQuestionService";
import { answerService } from "../../services/answerService";

const UpdateAnswer: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [answer, setAnswer] = useState<any>(null);
  const [users, setUsers] = useState<{ value: number; label: string }[]>([]);
  const [questions, setQuestions] = useState<{ value: number; label: string }[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      const [usersData, questionsData, answerData] = await Promise.all([
        userService.getUsers(),
        securityQuestionService.getAll(),
        answerService.getAnswerById(Number(id)),
      ]);

      setUsers(usersData.map(u => ({ value: u.id!, label: `${u.name} (${u.email})` })));
      setQuestions(questionsData.map(q => ({ value: q.id!, label: q.name! })));
      setAnswer(answerData);
    };
    fetchData();
  }, [id]);

  // ✅ Memorizar los campos para evitar renders infinitos
  const fields: FormField[] = useMemo(() => [
    { name: "content", label: "Content", type: "text", required: true },
    { name: "user_id", label: "User", type: "select", required: true, options: users },
    { name: "security_question_id", label: "Security Question", type: "select", required: true, options: questions },
  ], [users, questions]);

  const handleUpdate = async (data: any) => {
    try {
      const newUserId = Number(data.user_id);
      const newQuestionId = Number(data.security_question_id);
      const oldUserId = answer.user_id;
      const oldQuestionId = answer.security_question_id;

      // Si cambió el usuario o la pregunta, necesitamos eliminar y recrear
      if (newUserId !== oldUserId || newQuestionId !== oldQuestionId) {
        // Confirmar cambio
        const changes = [];
        if (newUserId !== oldUserId) changes.push(`User (${oldUserId} → ${newUserId})`);
        if (newQuestionId !== oldQuestionId) changes.push(`Question (${oldQuestionId} → ${newQuestionId})`);

        const confirmResult = await Swal.fire({
          title: "Change Answer Assignment?",
          text: `This will change: ${changes.join(", ")}`,
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Yes, change it",
          cancelButtonText: "Cancel",
        });

        if (!confirmResult.isConfirmed) {
          return;
        }

        // Estrategia: Eliminar la respuesta antigua y crear una nueva
        const answerData = {
          user_id: newUserId,
          security_question_id: newQuestionId,
          content: data.content,
        };

        // Eliminar la respuesta antigua
        const deleted = await answerService.deleteAnswer(Number(id));
        
        if (deleted) {
          // Crear la nueva respuesta
          const created = await answerService.createAnswer(answerData);
          
          if (created) {
            Swal.fire({
              title: "Success",
              text: "Answer reassigned successfully!",
              icon: "success",
              timer: 3000,
            });
            navigate("/answers/list");
          } else {
            Swal.fire({
              title: "Error",
              text: "Failed to create answer with new assignment. The old answer was deleted.",
              icon: "error",
            });
          }
        } else {
          Swal.fire({
            title: "Error",
            text: "Failed to delete the old answer.",
            icon: "error",
          });
        }
      } else {
        // Si NO cambió usuario ni pregunta, actualización normal
        const updated = await answerService.updateAnswer(Number(id), {
          content: data.content,
          user_id: newUserId,
          security_question_id: newQuestionId,
        });

        if (updated) {
          Swal.fire("Updated!", "Answer updated successfully.", "success");
          navigate("/answers/list");
        } else {
          Swal.fire("Error", "There was a problem updating the answer.", "error");
        }
      }
    } catch (err) {
      console.error("❌ Error updating answer:", err);
      Swal.fire("Error", "An unexpected error occurred.", "error");
    }
  };

  if (!answer) return <div className="p-4 text-gray-600">Loading...</div>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">
        Update Answer
      </h2>

      <GenericForm
        fields={fields}
        initialData={answer}
        onSubmit={handleUpdate}
        submitLabel="Update Answer"
        cancelLabel="Cancel"
        onCancel={() => navigate("/answers/list")}
        mode="edit"
      />
    </div>
  );
};

export default UpdateAnswer;