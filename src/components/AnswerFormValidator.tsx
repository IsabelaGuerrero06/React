import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Answer } from '../models/Answer';

// Props para el formulario
interface AnswerFormProps {
  mode: number; // 1 = crear, 2 = actualizar
  handleCreate?: (values: Answer) => void;
  handleUpdate?: (values: Answer) => void;
  answer?: Answer | null;
}

const AnswerFormValidator: React.FC<AnswerFormProps> = ({mode, handleCreate, handleUpdate, answer }) => {
  // Función que decide si crear o actualizar
  const handleSubmit = (formattedValues: Answer) => {
    if (mode === 1 && handleCreate) {
      handleCreate(formattedValues);
    } else if (mode === 2 && handleUpdate) {
      handleUpdate(formattedValues);
    } else {
      console.error('No se definió una función para el modo actual');
    }
  };

  return (
    <Formik
      initialValues={answer ? answer : {
              content: '',
              user_id: 0,
              security_question_id: 0,
            }
      }
      validationSchema={Yup.object({
        content: Yup.string()
          .max(255, 'El contenido no puede superar los 255 caracteres')
          .required('El contenido es obligatorio'),
        user_id: Yup.number()
          .typeError('Debe ser un número')
          .positive('Debe ser un número positivo')
          .required('El ID de usuario es obligatorio'),
        security_question_id: Yup.number()
          .typeError('Debe ser un número')
          .positive('Debe ser un número positivo')
          .required('El ID de la pregunta de seguridad es obligatorio'),
      })}
      onSubmit={(values) => {
        const formattedValues = { ...values, user_id: Number(values.user_id), security_question_id: Number(values.security_question_id) }; // Formateo adicional si es necesario
        handleSubmit(formattedValues);
      }}
    >
      {({ handleSubmit }) => (
        <Form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 gap-4 p-6 bg-white rounded-md shadow-md"
        >
          {/* Contenido */}
          <div>
            <label
              htmlFor="content"
              className="block text-lg font-medium text-gray-700"
            >
              Contenido
            </label>
            <Field
              type="text"
              name="content"
              className="w-full border rounded-md p-2"
            />
            <ErrorMessage
              name="content"
              component="p"
              className="text-red-500 text-sm"
            />
          </div>

          {/* ID del Usuario */}
          <div>
            <label
              htmlFor="user_id"
              className="block text-lg font-medium text-gray-700"
            >
              ID de Usuario
            </label>
            <Field
              type="number"
              name="user_id"
              className="w-full border rounded-md p-2"
            />
            <ErrorMessage
              name="user_id"
              component="p"
              className="text-red-500 text-sm"
            />
          </div>

          {/* ID de la Pregunta de Seguridad */}
          <div>
            <label
              htmlFor="security_question_id"
              className="block text-lg font-medium text-gray-700"
            >
              ID de Pregunta de Seguridad
            </label>
            <Field
              type="number"
              name="security_question_id"
              className="w-full border rounded-md p-2"
            />
            <ErrorMessage
              name="security_question_id"
              component="p"
              className="text-red-500 text-sm"
            />
          </div>

          {/* Botón de enviar */}
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-md"
          >
            {mode === 1 ? 'Crear Respuesta' : 'Actualizar Respuesta'}
          </button>
        </Form>
      )}
    </Formik>
  );
};

export default AnswerFormValidator;
