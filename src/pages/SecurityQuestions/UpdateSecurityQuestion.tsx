import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import GenericForm, { FormField } from "../../components/GenericForm";
import { securityQuestionService } from "../../services/securityQuestionService";
import { SecurityQuestion } from "../../models/SecurityQuestion";

const UpdateSecurityQuestion: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [question, setQuestion] = useState<SecurityQuestion | null>(null);

  useEffect(() => {
    const fetchQuestion = async () => {
      if (!id) return;
      const data = await securityQuestionService.getById(Number(id));
      if (data) setQuestion(data);
      else console.error("Security question not found");
    };
    fetchQuestion();
  }, [id]);

  const formFields: FormField[] = [
    {
      name: "name",
      label: "Name",
      type: "text",
      required: true,
      placeholder: "Enter security question name",
    },
    {
      name: "description",
      label: "Description",
      type: "textarea",
      required: true,
      placeholder: "Enter security question description",
    },
  ];

  const handleUpdateQuestion = async (data: Record<string, any>) => {
    try {
      if (!id) return;
      const updated = await securityQuestionService.update(Number(id), {
        name: data.name,
        description: data.description,
      });

      if (updated) {
        Swal.fire({
          title: "Success",
          text: "Security question updated successfully",
          icon: "success",
          timer: 2000,
        });
        navigate("/security-questions/list");
      } else {
        Swal.fire({
          title: "Error",
          text: "There was a problem updating the record",
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

  if (!question) {
    return <div className="p-6 text-gray-700">Loading security question...</div>;
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">
        Update Security Question
      </h2>

      <GenericForm
        fields={formFields}
        initialData={question}
        onSubmit={handleUpdateQuestion}
        submitLabel="Update"
        cancelLabel="Cancel"
        onCancel={() => navigate("/security-questions/list")}
        mode="edit"
      />
    </div>
  );
};

export default UpdateSecurityQuestion;
