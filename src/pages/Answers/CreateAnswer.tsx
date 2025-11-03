// src/pages/answers/CreateAnswer.tsx
import React, { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import GenericForm, { FormField } from "../../components/GenericForm";
import { userService } from "../../services/userService";
import { securityQuestionService } from "../../services/securityQuestionService";
import { answerService } from "../../services/answerService";

const CreateAnswer: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<{ value: number; label: string }[]>([]);
  const [questions, setQuestions] = useState<{ value: number; label: string }[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const usersData = await userService.getUsers();
      const questionsData = await securityQuestionService.getAll();

      setUsers(usersData.map(u => ({ value: u.id!, label: `${u.name} (${u.email})` })));
      setQuestions(questionsData.map(q => ({ value: q.id!, label: q.name! })));
    };
    fetchData();
  }, []);

  // ✅ useMemo evita re-render infinito
  const fields: FormField[] = useMemo(() => [
    { name: "content", label: "Content", type: "text", required: true },
    { name: "user_id", label: "User", type: "select", required: true, options: users },
    { name: "security_question_id", label: "Security Question", type: "select", required: true, options: questions },
  ], [users, questions]);

  const handleCreate = async (data: any) => {
    try {
      const created = await answerService.createAnswer({
        content: data.content,
        user_id: Number(data.user_id),
        security_question_id: Number(data.security_question_id),
      });

      if (created) {
        Swal.fire("Created!", "Answer created successfully.", "success");
        navigate("/answers/list");
      }
    } catch (err) {
      Swal.fire("Error", "There was a problem creating the answer.", "error");
    }
  };

  return (
    <div className="p-4">

      <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">
        Create Answer
      </h2>

      <GenericForm
        fields={fields}
        onSubmit={handleCreate}
        submitLabel="Create Answer"
        cancelLabel="Cancel"
        onCancel={() => navigate("/answers/list")}
      />
    </div>
  );
};

export default CreateAnswer;
