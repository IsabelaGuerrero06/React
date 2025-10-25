import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

import { Answer } from "../../models/Answer";
import { answerService } from "../../services/answerService";
import AnswerFormValidator from "../../components/AnswerFormValidator";
import Breadcrumb from "../../components/Breadcrumb";

const UpdateAnswer: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [answer, setAnswer] = useState<Answer | null>(null);

  useEffect(() => {
    const fetchAnswer = async () => {
      if (!id) return;
      const data = await answerService.getAnswerById(parseInt(id));
      setAnswer(data);
    };
    fetchAnswer();
  }, [id]);

  const handleUpdateAnswer = async (updated: Answer) => {
    try {
      const updatedAnswer = await answerService.updateAnswer(updated.id || 0, updated);

      if (updatedAnswer) {
        Swal.fire({
          title: "Completado",
          text: "La respuesta se ha actualizado correctamente",
          icon: "success",
          timer: 3000,
        });
        navigate("/answers/list");
      } else {
        Swal.fire({
          title: "Error",
          text: "No se pudo actualizar la respuesta",
          icon: "error",
          timer: 3000,
        });
      }
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: "Error al actualizar la respuesta",
        icon: "error",
        timer: 3000,
      });
    }
  };

  if (!answer) {
    return <div>Cargando...</div>;
  }

  return (
    <>
      <Breadcrumb pageName="Actualizar Respuesta" />
      <AnswerFormValidator
        handleUpdate={handleUpdateAnswer}
        mode={2} // 2 = actualización
        answer={answer}
      />
    </>
  );
};

export default UpdateAnswer;
