// src/pages/answers/ListAnswersByQuestion.tsx
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import { answerService } from "../../services/answerService";
import { Answer } from "../../models/Answer";
import { useEffect, useState } from "react";
import GenericTable from "../../components/GenericTable";
import GenericButton from "../../components/GenericButton"; 

const ListAnswersByQuestion: React.FC = () => {
  const { questionId } = useParams();
  const [answers, setAnswers] = useState<Answer[]>([]);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const data = await answerService.getAnswersByQuestion(Number(questionId));
      setAnswers(data);
    } catch (error) {
      console.error("Error fetching answers:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [questionId]);

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
          await answerService.deleteAnswer(item.id!);
          Swal.fire("Deleted!", "The answer has been deleted.", "success");
          fetchData();
        }
      });
    }
  };

  return (
    <div className="p-4">

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
          Answers for Question #{questionId}
        </h2>

        <div className="flex gap-2">
          <GenericButton
            label="Back to Questions"
            onClick={() => navigate("/security-questions/list")}
            variant="secondary"
          />
          <GenericButton
            label="Back to All Answers"
            onClick={() => navigate("/answers/list")}
            variant="info"
          />
        </div>
      </div>

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

export default ListAnswersByQuestion;
