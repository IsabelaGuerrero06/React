import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { SecurityQuestion } from "../models/SecurityQuestion";

interface Props {
  handleCreate?: (question: SecurityQuestion) => void;
  handleUpdate?: (question: SecurityQuestion) => void;
  question?: SecurityQuestion;
  mode: number; // 1 = crear, 2 = actualizar
}

const SecurityQuestionFormValidator: React.FC<Props> = ({
  handleCreate,
  handleUpdate,
  question,
  mode,
}) => {
  const initialValues: SecurityQuestion = question || {
    name: "",
    description: "",
  };

  const validationSchema = Yup.object({
    name: Yup.string()
      .required("El nombre es obligatorio")
      .min(3, "Debe tener al menos 3 caracteres"),
    description: Yup.string()
      .required("La descripción es obligatoria")
      .min(5, "Debe tener al menos 5 caracteres"),
  });

  const onSubmit = (values: SecurityQuestion) => {
    if (mode === 1 && handleCreate) handleCreate(values);
    if (mode === 2 && handleUpdate) handleUpdate(values);
  };

  return (
    <Formik
      initialValues={initialValues}
      enableReinitialize
      validationSchema={validationSchema}
      onSubmit={onSubmit}
    >
      <Form className="max-w-md mx-auto mt-4 p-6 bg-white rounded shadow">
        <div className="mb-4">
          <label className="block text-gray-700">Nombre</label>
          <Field
            name="name"
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="Ej: Nombre de tu primera mascota"
          />
          <ErrorMessage
            name="name"
            component="p"
            className="text-red-500 text-sm mt-1"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Descripción</label>
          <Field
            as="textarea"
            name="description"
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="Ej: Pregunta personal para recuperación de cuenta"
          />
          <ErrorMessage
            name="description"
            component="p"
            className="text-red-500 text-sm mt-1"
          />
        </div>

        <button
          type="submit"
          className={`w-full py-2 px-4 rounded text-white ${
            mode === 1 ? "bg-blue-600 hover:bg-blue-700" : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {mode === 1 ? "Crear" : "Actualizar"}
        </button>
      </Form>
    </Formik>
  );
};

export default SecurityQuestionFormValidator;
