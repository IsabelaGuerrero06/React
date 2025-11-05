import React from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import GenericForm, { FormField } from "../../components/GenericForm";
import { userService } from "../../services/userService";
import { createProfile } from "../../services/ProfileService";
import { deviceService } from "../../services/deviceService";
import { User } from "../../models/User";
import { authenticatedUserService } from "../../services/authenticatedUserService";

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
      // 🔒 GUARDAR USUARIO AUTENTICADO ANTES DE CREAR NUEVO USUARIO
      const authenticatedUser = localStorage.getItem("user");
      const authenticatedUserId = localStorage.getItem("currentUserId");

      console.log("👤 Usuario autenticado guardado:", {
        authenticatedUser,
        authenticatedUserId,
      });

      // 1️⃣ Crear usuario
      const createdUser = await userService.createUser(data as User);
      if (!createdUser?.id)
        throw new Error("User creation failed - no ID returned");
      userId = createdUser.id;

      console.log("✅ Nuevo usuario creado:", createdUser);
      // 💾 Guardar en sessionStorage para vincular el perfil luego
      sessionStorage.setItem("lastCreatedUser", JSON.stringify(createdUser));

      // 2️⃣ Crear perfil
      const formData = new FormData();
      formData.append("fullName", createdUser.name || "Usuario sin nombre");
      formData.append("email", createdUser.email || "");
      const phone = "phone" in data ? (data as any).phone : "";
      formData.append("phone", phone);

      const profile = await createProfile(userId, formData);
      console.log("✅ Perfil creado para nuevo usuario:", profile);

      // ⚠️ NO GUARDAR EN LOCALSTORAGE - ESTO SOBRESCRIBE AL USUARIO AUTENTICADO
      // ❌ ELIMINADO: localStorage.setItem('user', ...)
      // ❌ ELIMINADO: localStorage.setItem('profile', ...)
      // ❌ ELIMINADO: window.dispatchEvent(new CustomEvent('user-changed', ...))

      // 🔒 RESTAURAR USUARIO AUTENTICADO
      if (authenticatedUser) {
        localStorage.setItem("user", authenticatedUser);
        console.log("🔄 Usuario autenticado restaurado");
      }
      if (authenticatedUserId) {
        localStorage.setItem("currentUserId", authenticatedUserId);
        console.log("🔄 currentUserId restaurado:", authenticatedUserId);
      }

      // 3️⃣ Crear dispositivo (sin bloquear si falla)
      let ip = "127.0.0.1";
      try {
        const ipRes = await fetch("https://api.ipify.org?format=json");
        const ipData = await ipRes.json();
        ip = ipData.ip ?? ip;
      } catch {}

      let os = "Unknown";
      try {
        const ua = navigator.userAgent;
        if (ua.includes("Win")) os = "Windows";
        else if (ua.includes("Mac")) os = "macOS";
        else if (ua.includes("Linux")) os = "Linux";
        else if (ua.includes("Android")) os = "Android";
        else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";
      } catch {}

      const deviceData = {
        user_id: userId,
        name: `Device of ${createdUser.name || "User"}`,
        ip,
        operating_system: os,
      };

      try {
        await deviceService.createDevice(deviceData);
        console.log("✅ Dispositivo creado para nuevo usuario");
      } catch (err) {
        console.warn("⚠️ Device creation failed (continuing):", err);
      }

      // ✅ Éxito total
      await Swal.fire({
        title: "Completado",
        text: "Usuario y perfil creados correctamente",
        icon: "success",
        timer: 2000,
      });

      // ✅ Navegar primero
      navigate("/users/list");

      // 🕒 Luego limpiar después de unos segundos
      setTimeout(() => {
        sessionStorage.removeItem("lastCreatedUser");
        console.log("🧹 lastCreatedUser eliminado tras 5s");
      }, 5000);
    } catch (error) {
      console.error("❌ Error en creación de usuario:", error);
      Swal.fire({
        title: "Error",
        text:
          error instanceof Error
            ? error.message
            : "Ocurrió un error inesperado",
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
