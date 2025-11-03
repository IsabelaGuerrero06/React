import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { SecurityQuestion } from "../../models/SecurityQuestion";
import Breadcrumb from "../../components/Breadcrumb";
import SecurityQuestionFormValidator from "../../components/SecurityQuestionFormValidator";
import { securityQuestionService } from "../../services/securityQuestionService";

const UpdateSecurityQuestion: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [question, setQuestion] = useState<SecurityQuestion | null>(null);

  useEffect(() => {
    const fetchQuestion = async () => {
      if (!id) return;
      const data = await securityQuestionService.getById(parseInt(id));
      if (!data) {
        // manejar error (redirigir o mostrar mensaje)
        console.error("Preguntas de seguridad: no se encontró el registro");
        return;
      }
      setQuestion(data);
    };
    fetchQuestion();
  }, [id]);

  const handleUpdateQuestion = async (updatedQuestion: SecurityQuestion) => {
    try {
      const updated = await securityQuestionService.update(
        updatedQuestion.id || 0,
        updatedQuestion
      );

      if (updated) {
        Swal.fire({
          title: "Completado",
          text: "Se ha actualizado correctamente la pregunta de seguridad",
          icon: "success",
          timer: 3000,
        });
        navigate("/security-questions/list");
      } else {
        Swal.fire({
          title: "Error",
          text: "Existe un problema al momento de actualizar el registro",
          icon: "error",
          timer: 3000,
        });
      }
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: "Existe un problema al momento de actualizar el registro",
        icon: "error",
        timer: 3000,
      });
    }
  };

  if (!question) {
    return <div>Cargando...</div>;
  }

  return (
    <>
      <Breadcrumb pageName="Actualizar Pregunta de Seguridad" />
      <SecurityQuestionFormValidator
        handleUpdate={handleUpdateQuestion}
        mode={2} // modo 2 = actualización
        question={question}
      />
    </>
  );
};

export default UpdateSecurityQuestion;
