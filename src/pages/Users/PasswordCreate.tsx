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
  const [passwords, setPasswords] = useState<Password[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) return;
    loadUser();
    loadPasswords();
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
    if (!cont || cont.trim().length === 0) {
      Swal.fire({ title: "Advertencia", text: "Ingrese una contraseña", icon: "warning", timer: 1500 });
      return;
    }

    try {
      setLoading(true);
      const created = await passwordService.createPassword(Number(userId), cont);
      setCont("");
      await loadPasswords();
      Swal.fire({ title: "Éxito", text: `Contraseña creada (id: ${created.id})`, icon: "success", timer: 1500 });
    } catch (e) {
      console.error(e);
      Swal.fire({ title: "Error", text: "No se pudo crear la contraseña", icon: "error", timer: 1500 });
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
    });

    if (res.isConfirmed) {
      const success = await passwordService.deletePassword(id);
      if (success) {
        Swal.fire({ title: "Eliminado", text: "Se eliminó la contraseña", icon: "success", timer: 1200 });
        loadPasswords();
      }
    }
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Passwords for: {userName || userId}</h2>
        <div className="flex gap-2">
          <GenericButton label="Back" onClick={() => navigate(-1)} variant="secondary" size="md" />
        </div>
      </div>

      <div className="max-w-md bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm mb-6">
        <GenericInput
          label="Password content"
          name="cont"
          type="text"
          value={cont}
          onChange={(e) => setCont(e.target.value)}
          placeholder="Enter password text"
        />
        <div className="flex gap-3">
          <GenericButton label={loading ? "Saving..." : "Save Password"} onClick={handleCreate} variant="success" size="md" />
          <GenericButton label="Clear" onClick={() => setCont("")} variant="secondary" size="md" />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
        <h3 className="text-lg font-medium mb-3">Existing Passwords</h3>
        {passwords.length === 0 ? (
          <p className="text-sm text-gray-600">No hay contraseñas registradas para este usuario.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm table-auto border-collapse">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2">ID</th>
                  <th className="py-2">Content</th>
                  <th className="py-2">Start At</th>
                  <th className="py-2">End At</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {passwords.map((p) => (
                  <tr key={p.id} className="border-b">
                    <td className="py-2">{p.id}</td>
                    <td className="py-2">{p.cont}</td>
                    <td className="py-2">{new Date(p.startAt).toLocaleString()}</td>
                    <td className="py-2">{new Date(p.endAt).toLocaleString()}</td>
                    <td className="py-2">
                      <div className="flex gap-2">
                        <GenericButton label="Delete" onClick={() => handleDelete(p.id)} variant="danger" size="sm" />
                      </div>
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
