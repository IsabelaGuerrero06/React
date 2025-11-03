import React from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { SecurityQuestion } from "../../models/SecurityQuestion";
import Breadcrumb from "../../components/Breadcrumb";
import SecurityQuestionFormValidator from "../../components/SecurityQuestionFormValidator";
import { securityQuestionService } from "../../services/securityQuestionService";

const CreateSecurityQuestion: React.FC = () => {
  const navigate = useNavigate();

  const handleCreateQuestion = async (question: SecurityQuestion) => {
    try {
        // si vas a crear ligada a un usuario, manda segundo parámetro userId
        const created = await securityQuestionService.create({
        name: question.name,
        description: question.description,
        });

        if (created) {
        Swal.fire({
            title: "Completado",
            text: "Se ha creado correctamente la pregunta de seguridad",
            icon: "success",
            timer: 3000,
        });
        navigate("/security-questions/list");
        } else {
        Swal.fire({
            title: "Error",
            text: "Existe un problema al momento de crear el registro",
            icon: "error",
            timer: 3000,
        });
        }
    } catch (error) {
        Swal.fire({
        title: "Error",
        text: "Existe un problema al momento de crear el registro",
        icon: "error",
        timer: 3000,
        });
    }
  };


  return (
    <div>
      <h2>Crear Pregunta de Seguridad</h2>
      <Breadcrumb pageName="Crear Pregunta de Seguridad" />
      <SecurityQuestionFormValidator
        handleCreate={handleCreateQuestion}
        mode={1} // modo 1 = creación
      />
    </div>
  );
};

export default CreateSecurityQuestion;
