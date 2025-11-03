import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import GenericForm, { FormField } from "../../components/GenericForm";
import { deviceService } from "../../services/deviceService";
import { userService } from "../../services/userService";
import { Device } from "../../models/Device";

const CreateDevice: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<{ value: number; label: string }[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const usersData = await userService.getUsers();
      setUsers(usersData.map(u => ({ 
        value: u.id!, 
        label: `${u.name} (${u.email})` 
      })));
    };
    fetchUsers();
  }, []);

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

  const handleCreateDevice = async (data: Record<string, any> | Device) => {
    try {
      const deviceData = {
        user_id: Number(data.user_id),
        name: data.name,
        ip: data.ip,
        operating_system: data.operating_system,
      } as Device;

      console.log("Creating device:", deviceData);
      const created = await deviceService.createDevice(deviceData);

      if (created) {
        await Swal.fire({
          title: "Success",
          text: "Device created successfully!",
          icon: "success",
          timer: 2000,
        });
        navigate("/devices/list");
      } else {
        await Swal.fire({
          title: "Error",
          text: "Device creation failed",
          icon: "error",
        });
      }
    } catch (error) {
      console.error("Error creating device:", error);
      await Swal.fire({
        title: "Error",
        text: "An error occurred",
        icon: "error",
      });
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">
        Create Device
      </h2>

      <GenericForm
        fields={formFields}
        onSubmit={handleCreateDevice}
        submitLabel="Create Device"
        cancelLabel="Cancel"
        onCancel={() => navigate("/devices/list")}
      />
    </div>
  );
};

export default CreateDevice;