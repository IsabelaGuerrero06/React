import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import GenericForm, { FormField } from "../../components/GenericForm";
import { deviceService } from "../../services/deviceService";
import { userService } from "../../services/userService";
import { Device } from "../../models/Device";

const UpdateDevice: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [device, setDevice] = useState<Device | null>(null);
  const [users, setUsers] = useState<{ value: number; label: string }[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      const [usersData, deviceData] = await Promise.all([
        userService.getUsers(),
        deviceService.getDeviceById(parseInt(id)),
      ]);

      setUsers(usersData.map(u => ({ value: u.id!, label: `${u.name} (${u.email})` })));
      
      if (deviceData) {
        setDevice(deviceData);
      } else {
        Swal.fire({
          title: "Error",
          text: "Device not found.",
          icon: "error",
          timer: 3000,
        });
        navigate("/devices/list");
      }
    };

    fetchData();
  }, [id, navigate]);

  // ✅ Memorizar los campos para evitar renders infinitos
  const formFields: FormField[] = useMemo(() => [
    {
      name: "user_id",
      label: "User",
      type: "select",
      required: true,
      options: users,
    },
    {
      name: "name",
      label: "Device Name",
      type: "text",
      required: true,
      placeholder: "Enter device name",
    },
    {
      name: "ip",
      label: "IP Address",
      type: "text",
      required: true,
      placeholder: "Enter device IP",
    },
    {
      name: "operating_system",
      label: "Operating System",
      type: "text",
      required: false,
      placeholder: "Enter operating system (optional)",
    },
  ], [users]);

  const handleUpdateDevice = async (updatedData: Record<string, any> | Device) => {
    try {
      const newUserId = Number(updatedData.user_id);
      const oldUserId = device?.user_id;

      // Si cambió el usuario, necesitamos eliminar y recrear
      if (newUserId !== oldUserId) {
        // Confirmar cambio de usuario
        const confirmResult = await Swal.fire({
          title: "Change User?",
          text: `This will reassign the device from User #${oldUserId} to User #${newUserId}`,
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Yes, change it",
          cancelButtonText: "Cancel",
        });

        if (!confirmResult.isConfirmed) {
          return;
        }

        // Estrategia: Eliminar el dispositivo antiguo y crear uno nuevo
        const deviceData = {
          user_id: newUserId,
          name: updatedData.name,
          ip: updatedData.ip,
          operating_system: updatedData.operating_system,
        } as Device;

        // Eliminar el dispositivo antiguo
        const deleted = await deviceService.deleteDevice(device?.id || 0);
        
        if (deleted) {
          // Crear el nuevo dispositivo con el nuevo usuario
          const created = await deviceService.createDevice(deviceData);
          
          if (created) {
            Swal.fire({
              title: "Success",
              text: "Device user changed successfully!",
              icon: "success",
              timer: 3000,
            });
            navigate("/devices/list");
          } else {
            Swal.fire({
              title: "Error",
              text: "Failed to create device with new user. The old device was deleted.",
              icon: "error",
            });
          }
        } else {
          Swal.fire({
            title: "Error",
            text: "Failed to delete the old device.",
            icon: "error",
          });
        }
      } else {
        // Si NO cambió el usuario, actualización normal
        const deviceData = {
          name: updatedData.name,
          ip: updatedData.ip,
          operating_system: updatedData.operating_system,
          user_id: newUserId,
        } as Device;

        const updated = await deviceService.updateDevice(
          device?.id || 0,
          deviceData
        );

        if (updated) {
          Swal.fire({
            title: "Success",
            text: "Device updated successfully!",
            icon: "success",
            timer: 3000,
          });
          navigate("/devices/list");
        } else {
          Swal.fire({
            title: "Error",
            text: "There was a problem updating the device.",
            icon: "error",
            timer: 3000,
          });
        }
      }
    } catch (error) {
      console.error("❌ Error updating device:", error);
      Swal.fire({
        title: "Error",
        text: "An unexpected error occurred.",
        icon: "error",
        timer: 3000,
      });
    }
  };

  if (!device) {
    return (
      <div className="p-6 text-gray-700 dark:text-gray-200">
        Loading device data...
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">
        Update Device
      </h2>

      <GenericForm
        fields={formFields}
        initialData={device}
        onSubmit={handleUpdateDevice}
        submitLabel="Update Device"
        cancelLabel="Cancel"
        onCancel={() => navigate("/devices/list")}
        mode="edit"
      />
    </div>
  );
};

export default UpdateDevice;