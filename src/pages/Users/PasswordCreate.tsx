import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import GenericInput from "../../components/GenericInput";
import GenericButton from "../../components/GenericButton";
import { passwordService } from "../../services/passwordService";
import { userService } from "../../services/userService";
import { Password } from "../../models/Password";
import Swal from "sweetalert2";

const PasswordCreate: React.FC = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [userName, setUserName] = useState<string | null>(null);
  const [cont, setCont] = useState("");
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [passwords, setPasswords] = useState<Password[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) return;
    loadUser();
    loadPasswords();
    // Establecer fecha y hora actual por defecto
    const now = new Date();
    const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    setStartAt(localDateTime);
    
    // Fecha de fin por defecto: 30 días después
    const futureDate = new Date(now);
    futureDate.setDate(futureDate.getDate() + 30);
    const futureDateTimeLocal = new Date(futureDate.getTime() - futureDate.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    setEndAt(futureDateTimeLocal);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const loadUser = async () => {
    if (!userId) return;
    const id = Number(userId);
    const user = await userService.getUserById(id);
    setUserName(user ? user.name || user.email || `User ${id}` : `User ${id}`);
  };

  const loadPasswords = async () => {
    if (!userId) return;
    const id = Number(userId);
    const list = await passwordService.getPasswordsByUser(id);
    setPasswords(list);
  };

  const handleCreate = async () => {
    if (!userId) return;
    
    // Validaciones
    if (!cont || cont.trim().length === 0) {
      Swal.fire({ 
        title: "Advertencia", 
        text: "Ingrese una contraseña", 
        icon: "warning", 
        timer: 1500 
      });
      return;
    }

    if (!startAt) {
      Swal.fire({ 
        title: "Advertencia", 
        text: "Seleccione la fecha y hora de inicio", 
        icon: "warning", 
        timer: 1500 
      });
      return;
    }

    if (!endAt) {
      Swal.fire({ 
        title: "Advertencia", 
        text: "Seleccione la fecha y hora de fin", 
        icon: "warning", 
        timer: 1500 
      });
      return;
    }

    const startDate = new Date(startAt);
    const endDate = new Date(endAt);

    if (endDate <= startDate) {
      Swal.fire({ 
        title: "Advertencia", 
        text: "La fecha de fin debe ser posterior a la fecha de inicio", 
        icon: "warning", 
        timer: 2000 
      });
      return;
    }

    try {
      setLoading(true);
      // Convertir a formato ISO para enviar al backend
      const startAtISO = new Date(startAt).toISOString();
      const endAtISO = new Date(endAt).toISOString();
      
      const created = await passwordService.createPassword(
        Number(userId), 
        cont, 
        startAtISO, 
        endAtISO
      );
      
      setCont("");
      await loadPasswords();
      Swal.fire({ 
        title: "Éxito", 
        text: `Contraseña creada (id: ${created.id})`, 
        icon: "success", 
        timer: 1500 
      });
    } catch (e) {
      console.error(e);
      Swal.fire({ 
        title: "Error", 
        text: "No se pudo crear la contraseña", 
        icon: "error", 
        timer: 1500 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    const res = await Swal.fire({
      title: "Eliminar",
      text: "¿Desea eliminar esta contraseña?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar"
    });

    if (res.isConfirmed) {
      const success = await passwordService.deletePassword(id);
      if (success) {
        Swal.fire({ 
          title: "Eliminado", 
          text: "Se eliminó la contraseña", 
          icon: "success", 
          timer: 1200 
        });
        loadPasswords();
      }
    }
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Passwords for: {userName || userId}</h2>
        <div className="flex gap-2">
          <GenericButton 
            label="Back" 
            onClick={() => navigate(-1)} 
            variant="secondary" 
            size="md" 
          />
        </div>
      </div>

      <div className="max-w-2xl bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm mb-6">
        <h3 className="text-lg font-medium mb-3">Nueva Contraseña</h3>
        
        <div className="space-y-4">
          <GenericInput
            label="Contenido de la contraseña"
            name="cont"
            type="text"
            value={cont}
            onChange={(e) => setCont(e.target.value)}
            placeholder="Ingrese la contraseña"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Fecha y hora de inicio
              </label>
              <input
                type="datetime-local"
                value={startAt}
                onChange={(e) => setStartAt(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Fecha y hora de fin
              </label>
              <input
                type="datetime-local"
                value={endAt}
                onChange={(e) => setEndAt(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <GenericButton 
              label={loading ? "Guardando..." : "Guardar Contraseña"} 
              onClick={handleCreate} 
              variant="success" 
              size="md" 
            />
            <GenericButton 
              label="Limpiar" 
              onClick={() => setCont("")} 
              variant="secondary" 
              size="md" 
            />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
        <h3 className="text-lg font-medium mb-3">Contraseñas Existentes</h3>
        {passwords.length === 0 ? (
          <p className="text-sm text-gray-600">No hay contraseñas registradas para este usuario.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm table-auto border-collapse">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2 px-2">ID</th>
                  <th className="py-2 px-2">Contenido</th>
                  <th className="py-2 px-2">Inicio</th>
                  <th className="py-2 px-2">Fin</th>
                  <th className="py-2 px-2">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {passwords.map((p) => (
                  <tr key={p.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="py-2 px-2">{p.id}</td>
                    <td className="py-2 px-2 font-mono">{p.cont}</td>
                    <td className="py-2 px-2">{new Date(p.startAt).toLocaleString()}</td>
                    <td className="py-2 px-2">{new Date(p.endAt).toLocaleString()}</td>
                    <td className="py-2 px-2">
                      <GenericButton 
                        label="Eliminar" 
                        onClick={() => handleDelete(p.id)} 
                        variant="danger" 
                        size="sm" 
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PasswordCreate;