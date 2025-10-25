import React from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

import { Answer } from "../../models/Answer";
import { answerService } from "../../services/answerService";
import Breadcrumb from "../../components/Breadcrumb";
import AnswerFormValidator from "../../components/AnswerFormValidator";

const CreateAnswer: React.FC = () => {
  const navigate = useNavigate();

  const handleCreateAnswer = async (answer: Answer) => {
    try {
      const createdAnswer = await answerService.createAnswer(answer);

      if (createdAnswer) {
        Swal.fire({
          title: "Completado",
          text: "Se ha creado correctamente la respuesta",
          icon: "success",
          timer: 3000,
        });
        navigate("/answers/list");
      } else {
        Swal.fire({
          title: "Error",
          text: "Existe un problema al crear la respuesta",
          icon: "error",
          timer: 3000,
        });
      }
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: "No se pudo crear la respuesta",
        icon: "error",
        timer: 3000,
      });
    }
  };

  return (
    <>
      <Breadcrumb pageName="Crear Respuesta" />
      <AnswerFormValidator
        handleCreate={handleCreateAnswer}
        mode={1} // 1 = creación
      />
    </>
  );
};

export default CreateAnswer;
