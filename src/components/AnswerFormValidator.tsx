import React, { useEffect, useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Answer } from '../models/Answer';
import { userService } from '../services/userService';
import { securityQuestionService } from '../services/securityQuestionService';
import { User } from '../models/User';
import { SecurityQuestion } from '../models/SecurityQuestion';

interface AnswerFormProps {
  mode: number; // 1 = crear, 2 = actualizar
  handleCreate?: (values: Answer) => void;
  handleUpdate?: (values: Answer) => void;
  answer?: Answer | null;
}

const AnswerFormValidator: React.FC<AnswerFormProps> = ({
  mode,
  handleCreate,
  handleUpdate,
  answer,
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [questions, setQuestions] = useState<SecurityQuestion[]>([]);

  // 🔹 Cargar listas de usuarios y preguntas
  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersData = await userService.getUsers();
        const questionsData = await securityQuestionService.getAll();
        setUsers(usersData);
        setQuestions(questionsData);
      } catch (error) {
        console.error('Error cargando datos para selects:', error);
      }
    };
    fetchData();
  }, []);

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
      initialValues={
        answer
          ? answer
          : {
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
          .typeError('Debe seleccionar un usuario')
          .positive('Debe seleccionar un usuario válido')
          .required('El usuario es obligatorio'),
        security_question_id: Yup.number()
          .typeError('Debe seleccionar una pregunta de seguridad')
          .positive('Debe seleccionar una pregunta válida')
          .required('La pregunta de seguridad es obligatoria'),
      })}
      onSubmit={(values) => {
        const formattedValues = {
          ...values,
          user_id: Number(values.user_id),
          security_question_id: Number(values.security_question_id),
        };
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

          {/* Usuario (select) */}
          <div>
            <label
              htmlFor="user_id"
              className="block text-lg font-medium text-gray-700"
            >
              Usuario
            </label>
            <Field
              as="select"
              name="user_id"
              className="w-full border rounded-md p-2"
            >
              <option value="">-- Selecciona un usuario --</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.email})
                </option>
              ))}
            </Field>
            <ErrorMessage
              name="user_id"
              component="p"
              className="text-red-500 text-sm"
            />
          </div>

          {/* Pregunta de seguridad (select) */}
          <div>
            <label
              htmlFor="security_question_id"
              className="block text-lg font-medium text-gray-700"
            >
              Pregunta de Seguridad
            </label>
            <Field
              as="select"
              name="security_question_id"
              className="w-full border rounded-md p-2"
            >
              <option value="">-- Selecciona una pregunta --</option>
              {questions.map((q) => (
                <option key={q.id} value={q.id}>
                  {q.name}
                </option>
              ))}
            </Field>
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
