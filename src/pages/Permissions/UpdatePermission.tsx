import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { permissionService } from "../../services/permissionService";
import Swal from "sweetalert2";
import { Permission } from '../../models/Permission';
import PermissionFormValidator from '../../components/PermissionFormValidator';

const UpdatePermission: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [permission, setPermission] = useState<Permission | null>(null);

    useEffect(() => {
        console.log("Id->", id);
        const fetchPermission = async () => {
            if (!id) return;
            try {
                const permissionData = await permissionService.getById(parseInt(id));
                setPermission(permissionData);
            } catch (error) {
                console.error("Error al cargar el permiso:", error);
                Swal.fire({
                    title: "Error",
                    text: "No se pudo cargar el permiso",
                    icon: "error",
                    timer: 3000
                });
                navigate("/permissions");
            }
        };

        fetchPermission();
    }, [id, navigate]);

    const handleUpdatePermission = async (thePermission: Permission) => {
        try {
            const updatedPermission = await permissionService.update({
                id: thePermission.id || 0,
                url: thePermission.url,
                method: thePermission.method,
                entity: thePermission.entity
            });
            
            if (updatedPermission) {
                Swal.fire({
                    title: "Completado",
                    text: "Se ha actualizado correctamente el permiso",
                    icon: "success",
                    timer: 3000
                });
                navigate("/users/permissions");
            } else {
                Swal.fire({
                    title: "Error",
                    text: "Existe un problema al momento de actualizar el permiso",
                    icon: "error",
                    timer: 3000
                });
            }
        } catch (error) {
            Swal.fire({
                title: "Error",
                text: "Existe un problema al momento de actualizar el permiso",
                icon: "error",
                timer: 3000
            });
        }
    };

    if (!permission) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <p className="text-black dark:text-white">Cargando...</p>
            </div>
        );
    }

    return (
        <PermissionFormValidator
            handleUpdate={handleUpdatePermission}
            mode={2}
            permission={permission}
        />
    );
};

export default UpdatePermission;