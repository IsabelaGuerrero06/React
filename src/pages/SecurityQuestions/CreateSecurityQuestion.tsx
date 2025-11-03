import React from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import GenericForm, { FormField } from "../../components/GenericForm";
import { securityQuestionService } from "../../services/securityQuestionService";

const CreateSecurityQuestion: React.FC = () => {
  const navigate = useNavigate();

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

  const handleCreateQuestion = async (data: Record<string, any>) => {
    try {
      const created = await securityQuestionService.create({
        name: data.name,
        description: data.description,
      });

      if (created) {
        Swal.fire({
          title: "Success",
          text: "Security question created successfully",
          icon: "success",
          timer: 2000,
        });
        navigate("/security-questions/list");
      } else {
        Swal.fire({
          title: "Error",
          text: "There was a problem creating the security question",
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

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">
        Create Security Question
      </h2>

      <GenericForm
        fields={formFields}
        onSubmit={handleCreateQuestion}
        submitLabel="Create"
        cancelLabel="Cancel"
        onCancel={() => navigate("/security-questions/list")}
      />
    </div>
  );
};

export default CreateSecurityQuestion;
