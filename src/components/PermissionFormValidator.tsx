// src/components/PermissionFormValidator.tsx
import React from "react";
import { Permission, CreatePermissionDTO, UpdatePermissionDTO, HttpMethod } from "../models/Permission";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

interface PermissionFormProps {
    mode: number; // 1 = crear, 2 = actualizar
    handleCreate?: (values: CreatePermissionDTO) => void;
    handleUpdate?: (values: UpdatePermissionDTO) => void;
    permission?: Permission | null;
}

const PermissionFormValidator: React.FC<PermissionFormProps> = ({ 
    mode, 
    handleCreate, 
    handleUpdate, 
    permission 
}) => {
    const extractEntityFromUrl = (url: string): string => {
        if (!url || url === '/') return "Resource";
        
        const parts = url.split('/').filter(part => part.length > 0);
        if (parts.length > 0) {
            const entity = parts[0];
            // Convertir a formato PascalCase
            return entity.charAt(0).toUpperCase() + entity.slice(1).toLowerCase();
        }
        return "Resource";
    };

    const handleSubmit = (values: Permission) => {
        // Entity siempre se autocompleta desde la URL
        const entity = extractEntityFromUrl(values.url);

        const formattedValues = {
            ...values,
            entity: entity
        };

        console.log("📤 Enviando datos al backend:", formattedValues);

        if (mode === 1 && handleCreate) {
            handleCreate(formattedValues as CreatePermissionDTO);
        } else if (mode === 2 && handleUpdate && formattedValues.id) {
            handleUpdate({
                id: formattedValues.id,
                ...formattedValues
            });
        }
    };

    const httpMethods = Object.values(HttpMethod);

    const validationSchema = Yup.object({
        url: Yup.string()
            .required("La URL es obligatoria")
            .matches(/^\//, "La URL debe comenzar con /")
            .min(2, "La URL debe tener al menos 2 caracteres"),
        method: Yup.string()
            .required("El método es obligatorio")
            .oneOf(httpMethods, "Método HTTP no válido"),
    });

    return (
        <div className="flex justify-center items-start min-h-screen bg-gray-50 dark:bg-boxdark-2 pt-10">
            <div className="w-full max-w-2xl bg-white dark:bg-boxdark rounded-lg shadow-md p-8">
                <h1 className="text-3xl font-bold text-center mb-8 text-black dark:text-white">
                    {mode === 1 ? "Crear Permiso" : "Actualizar Permiso"}
                </h1>

                <Formik
                    initialValues={permission || {
                        url: "",
                        method: HttpMethod.GET,
                        entity: "" // Se autocompletará automáticamente
                    }}
                    validationSchema={validationSchema}
                    onSubmit={handleSubmit}
                >
                    {({ values, setFieldValue }) => (
                        <Form className="space-y-6">
                            {/* URL */}
                            <div>
                                <label htmlFor="url" className="block text-sm font-medium text-black dark:text-white mb-2">
                                    URL *
                                </label>
                                <Field 
                                    type="text" 
                                    name="url" 
                                    placeholder="/users"
                                    className="w-full border border-stroke dark:border-strokedark rounded-md px-4 py-3 bg-transparent text-black dark:text-white outline-none focus:border-primary transition"
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                        const newUrl = e.target.value;
                                        // Actualizar el campo URL
                                        setFieldValue("url", newUrl);
                                        // Auto-completar entity a partir de la URL
                                        const detectedEntity = extractEntityFromUrl(newUrl);
                                        setFieldValue("entity", detectedEntity);
                                    }}
                                />
                                <ErrorMessage name="url" component="p" className="text-red-500 text-sm mt-1" />
                                <p className="text-gray-500 text-xs mt-1">
                                    Ejemplos: /users, /api/products, /admin/dashboard
                                </p>
                            </div>

                            {/* Method */}
                            <div>
                                <label htmlFor="method" className="block text-sm font-medium text-black dark:text-white mb-2">
                                    Método HTTP *
                                </label>
                                <Field 
                                    as="select" 
                                    name="method" 
                                    className="w-full border border-stroke dark:border-strokedark rounded-md px-4 py-3 bg-white dark:bg-boxdark text-black dark:text-white outline-none focus:border-primary transition appearance-none cursor-pointer"
                                >
                                    {httpMethods.map((method) => (
                                        <option key={method} value={method}>
                                            {method}
                                        </option>
                                    ))}
                                </Field>
                                <ErrorMessage name="method" component="p" className="text-red-500 text-sm mt-1" />
                            </div>

                            {/* Campo entity oculto - no se muestra al usuario */}
                            <Field type="hidden" name="entity" />

                            {/* Preview de lo que se enviará - muestra el entity autocompletado */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 dark:bg-blue-900/20 dark:border-blue-800">
                                <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2">📋 Vista previa:</h3>
                                <pre className="text-xs text-blue-700 dark:text-blue-300 bg-white dark:bg-gray-800 p-2 rounded overflow-auto">
{`{
  "url": "${values.url || ''}",
  "method": "${values.method}",
  "entity": "${extractEntityFromUrl(values.url)}"
}`}
                                </pre>
                            </div>

                            {/* Botón de enviar */}
                            <div className="pt-2">
                                <button
                                    type="submit"
                                    className="w-full bg-primary text-white rounded-md py-3 px-6 text-center font-medium hover:bg-primary-dark transition"
                                >
                                    {mode === 1 ? "Crear Permiso" : "Actualizar Permiso"}
                                </button>
                            </div>
                        </Form>
                    )}
                </Formik>
            </div>
        </div>
    );
};

export default PermissionFormValidator;