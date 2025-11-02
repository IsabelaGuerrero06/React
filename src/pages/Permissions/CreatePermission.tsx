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
            const createdPermission = await permissionService.create({
                url: permission.url,
                method: permission.method,
                entity: permission.entity || ""
            });
            
            if (createdPermission) {
                Swal.fire({
                    title: "Completado",
                    text: "Se ha creado correctamente el permiso",
                    icon: "success",
                    timer: 3000
                });
                console.log("Permiso creado con éxito:", createdPermission);
                navigate("/permissions");
            } else {
                Swal.fire({
                    title: "Error",
                    text: "Existe un problema al momento de crear el permiso",
                    icon: "error",
                    timer: 3000
                });
            }
        } catch (error) {
            Swal.fire({
                title: "Error",
                text: "Existe un problema al momento de crear el permiso",
                icon: "error",
                timer: 3000
            });
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