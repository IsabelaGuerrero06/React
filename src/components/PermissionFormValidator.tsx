import React from "react";
import { Permission } from "../models/Permission";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

// Definimos la interfaz para los props
interface PermissionFormProps {
    mode: number; // Puede ser 1 (crear) o 2 (actualizar)
    handleCreate?: (values: Permission) => void;
    handleUpdate?: (values: Permission) => void;
    permission?: Permission | null;
}

const PermissionFormValidator: React.FC<PermissionFormProps> = ({ 
    mode, 
    handleCreate, 
    handleUpdate, 
    permission 
}) => {
    // Función para extraer la entidad de la URL
    const extractEntityFromUrl = (url: string): string => {
        // Eliminar el primer slash y obtener la primera parte de la ruta
        // Ejemplos:
        // "/users" -> "Users"
        // "/users/profile" -> "Users"
        // "/api/products" -> "Products"
        const parts = url.split('/').filter(part => part.length > 0);
        if (parts.length > 0) {
            // Tomar la primera parte y capitalizarla
            const entity = parts[0];
            return entity.charAt(0).toUpperCase() + entity.slice(1);
        }
        return "Resource"; // Valor por defecto
    };

    const handleSubmit = (formattedValues: Permission) => {
        if (mode === 1 && handleCreate) {
            handleCreate(formattedValues);
        } else if (mode === 2 && handleUpdate) {
            handleUpdate(formattedValues);
        } else {
            console.error('No function provided for the current mode');
        }
    };

    const httpMethods = ["GET", "POST", "PUT", "DELETE", "PATCH"];

    return (
        <div className="flex justify-center items-start min-h-screen bg-gray-50 dark:bg-boxdark-2 pt-10">
            <div className="w-full max-w-2xl bg-white dark:bg-boxdark rounded-lg shadow-md p-8">
                <h1 className="text-3xl font-bold text-center mb-8 text-black dark:text-white">
                    Permission {mode === 1 ? "Create" : "Update"}
                </h1>

                <Formik
                    initialValues={permission ? permission : {
                        url: "",
                        method: "GET",
                    }}
                    validationSchema={Yup.object({
                        url: Yup.string()
                            .required("La URL es obligatoria")
                            .matches(/^\//, "La URL debe comenzar con /"),
                        method: Yup.string()
                            .required("El método es obligatorio")
                            .oneOf(httpMethods, "Método HTTP no válido"),
                    })}
                    onSubmit={(values) => {
                        console.log("=== VALORES DEL FORMULARIO ===");
                        console.log("Values recibidos:", values);
                        console.log("Modo:", mode === 1 ? "CREAR" : "ACTUALIZAR");
                        
                        // Extraer entity automáticamente de la URL
                        const entity = extractEntityFromUrl(values.url);
                        
                        const formattedValues = { 
                            ...values,
                            entity: entity // Agregamos entity automáticamente
                        };
                        
                        console.log("Entity extraída automáticamente:", entity);
                        console.log("Valores formateados a enviar:", formattedValues);
                        console.log("JSON esperado por backend:", JSON.stringify(formattedValues, null, 2));
                        console.log("==============================");
                        
                        handleSubmit(formattedValues);
                    }}
                >
                    {({ handleSubmit }) => (
                        <Form onSubmit={handleSubmit} className="space-y-6">
                            {/* URL */}
                            <div>
                                <label htmlFor="url" className="block text-sm font-medium text-black dark:text-white mb-2">
                                    Url
                                </label>
                                <Field 
                                    type="text" 
                                    name="url" 
                                    placeholder="/users"
                                    className="w-full border border-stroke dark:border-strokedark rounded-md px-4 py-3 bg-transparent text-black dark:text-white outline-none focus:border-primary transition"
                                />
                                <ErrorMessage name="url" component="p" className="text-red-500 text-sm mt-1" />
                            </div>

                            {/* Method */}
                            <div>
                                <label htmlFor="method" className="block text-sm font-medium text-black dark:text-white mb-2">
                                    Method
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

                            {/* Botón de enviar */}
                            <div className="pt-2">
                                <button
                                    type="submit"
                                    className="w-full bg-white border-2 border-stroke dark:border-strokedark rounded-md py-3 px-6 text-center font-medium text-black dark:text-white hover:bg-gray-50 dark:hover:bg-meta-4 transition"
                                >
                                    {mode === 1 ? "Create" : "Update"}
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