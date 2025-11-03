import React from 'react';
import { Permission } from '../../models/Permission';
import PermissionFormValidator from '../../components/PermissionFormValidator';
import Swal from 'sweetalert2';
import { permissionService } from "../../services/permissionService";
import { useNavigate } from "react-router-dom";

const CreatePermission: React.FC = () => {
    const navigate = useNavigate();

    const handleCreatePermission = async (permission: Permission) => {
        try {
            console.log("=== CREAR PERMISO ===");
            console.log("Datos recibidos del formulario:", permission);
            
            // El entity ya viene incluido automáticamente desde el formulario
            const dataToSend = {
                url: permission.url,
                method: permission.method,
                entity: permission.entity || "Resource" // Fallback por seguridad
            };
            
            console.log("Datos preparados para enviar al backend:", dataToSend);
            console.log("JSON a enviar:", JSON.stringify(dataToSend, null, 2));
            console.log("URL del endpoint:", `${import.meta.env.VITE_API_URL}/permissions`);
            
            const createdPermission = await permissionService.create(dataToSend);
            
            console.log("✅ Respuesta exitosa del backend:", createdPermission);
            console.log("=====================");
            
            if (createdPermission) {
                Swal.fire({
                    title: "Completado",
                    text: "Se ha creado correctamente el permiso",
                    icon: "success",
                    timer: 3000
                });
                console.log("Permiso creado con éxito:", createdPermission);
                // Cambiar esta línea para redirigir a la URL específica
                navigate("/users/permissions");
            } else {
                Swal.fire({
                    title: "Error",
                    text: "Existe un problema al momento de crear el permiso",
                    icon: "error",
                    timer: 3000
                });
            }
        } catch (error: any) {
            console.error("=== ERROR AL CREAR PERMISO ===");
            console.error("Error completo:", error);
            
            // Mostrar detalles específicos del error
            if (error.response) {
                console.error("Estado HTTP:", error.response.status);
                console.error("Datos de error:", error.response.data);
                console.error("URL llamada:", error.config?.url);
                console.error("Datos enviados:", error.config?.data);
                
                // Mensajes de error más específicos
                let errorMessage = "Existe un problema al momento de crear el permiso";
                
                if (error.response.status === 404) {
                    errorMessage = "❌ Endpoint no encontrado. Verifica VITE_API_URL en tu archivo .env";
                    console.error("Verifica que la URL sea correcta:", import.meta.env.VITE_API_URL);
                } else if (error.response.status === 400) {
                    errorMessage = error.response.data?.error || "Datos inválidos o permiso duplicado";
                    console.error("Detalles del error 400:", error.response.data);
                } else if (error.response.status === 401) {
                    errorMessage = "No autorizado. Verifica tu token de acceso";
                } else if (error.response.status === 500) {
                    errorMessage = "Error interno del servidor";
                    console.error("Error 500 - Revisa los logs del backend");
                }
                
                Swal.fire({
                    title: "Error",
                    text: errorMessage,
                    icon: "error",
                    timer: 5000
                });
            } else if (error.request) {
                console.error("No se recibió respuesta del servidor");
                console.error("Request:", error.request);
                Swal.fire({
                    title: "Error de conexión",
                    text: "No se pudo conectar con el servidor. Verifica que el backend esté corriendo.",
                    icon: "error",
                    timer: 5000
                });
            } else {
                console.error("Error al configurar la petición:", error.message);
                Swal.fire({
                    title: "Error",
                    text: "Ocurrió un error inesperado",
                    icon: "error",
                    timer: 3000
                });
            }
            
            console.error("==============================");
        }
    };

    return (
        <PermissionFormValidator
            handleCreate={handleCreatePermission}
            mode={1}
        />
    );
};

export default CreatePermission;