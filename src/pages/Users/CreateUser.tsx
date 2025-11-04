import React from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import GenericForm, { FormField } from "../../components/GenericForm";
import { userService } from "../../services/userService";
import { createProfile } from "../../services/ProfileService";
import { deviceService } from "../../services/deviceService";
import { User } from "../../models/User";

const CreateUser: React.FC = () => {
  const navigate = useNavigate();

  const formFields: FormField[] = [
    {
      name: "name",
      label: "Name",
      type: "text",
      required: true,
      placeholder: "Enter user name",
    },
    {
      name: "email",
      label: "Email",
      type: "email",
      required: true,
      placeholder: "Enter user email",
    },
  ];

  const handleCreateUser = async (data: Record<string, any> | User) => {
    let userId: number | null = null;

    try {
      // PASO 1: Crear usuario
      console.log("STEP 1: Creating user...");
      const createdUser = await userService.createUser(data as User);
      
      if (!createdUser?.id) {
        throw new Error("User creation failed - no ID returned");
      }
      
      userId = createdUser.id;
      console.log(`✓ User created with ID: ${userId}`);

      // PASO 2: Crear perfil (opcional, no detiene el flujo)
      console.log("STEP 2: Creating profile...");
      try {
        const formData = new FormData();
        formData.append("phone", "");
        formData.append("fullName", createdUser.name || "");
        await createProfile(userId, formData);
        console.log("✓ Profile created");
      } catch (err) {
        console.warn("Profile creation failed (continuing):", err);
      }

      // PASO 3: Crear dispositivo
      console.log("STEP 3: Creating device...");
      
      // Obtener IP
      let ip = "127.0.0.1";
      try {
        const ipRes = await fetch("https://api.ipify.org?format=json");
        const ipData = await ipRes.json();
        ip = ipData.ip;
      } catch {
        console.warn("Could not get IP, using default");
      }

      // Detectar OS
      let os = "Unknown";
      try {
        const ua = navigator.userAgent;
        if (ua.includes("Win")) os = "Windows";
        else if (ua.includes("Mac")) os = "macOS";
        else if (ua.includes("Linux")) os = "Linux";
        else if (ua.includes("Android")) os = "Android";
        else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";
      } catch {
        console.warn("Could not detect OS");
      }

      const deviceData = {
        user_id: userId,
        name: `Device of ${createdUser.name || "User"}`,
        ip: ip,
        operating_system: os,
      };

      console.log("Creating device with data:", deviceData);
      const device = await deviceService.createDevice(deviceData);

      if (device) {
        console.log("✓ Device created successfully");
        await Swal.fire({
          title: "Success!",
          text: "User, profile and device created",
          icon: "success",
          timer: 2000,
        });
      } else {
        console.warn("Device creation returned null");
        await Swal.fire({
          title: "Partial Success",
          text: "User created but device failed",
          icon: "warning",
          timer: 2000,
        });
      }

      navigate("/users/list");

    } catch (error) {
      console.error("ERROR in user creation:", error);
      
      await Swal.fire({
        title: "Error",
        text: error instanceof Error ? error.message : "Unknown error",
        icon: "error",
      });
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">
        Create User
      </h2>

      <GenericForm
        fields={formFields}
        onSubmit={handleCreateUser}
        submitLabel="Create"
        cancelLabel="Cancel"
        onCancel={() => navigate("/users/list")}
      />
    </div>
  );
};

export default CreateUser;