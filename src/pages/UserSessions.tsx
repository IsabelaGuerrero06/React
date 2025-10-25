import React, { useEffect, useState } from "react";
import { Session } from "../models/Session.ts";
import { sessionService } from "../services/SessionService.ts";

const UserSessions: React.FC = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const userId = 1; // <- más adelante se obtendrá dinámicamente

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const data = await sessionService.getAll(`/user/${userId}`);
        setSessions(data);
      } catch (error) {
        console.error("Error al obtener sesiones:", error);
      }
    };
    fetchSessions();
  }, [userId]);

  const handleCloseSession = async (sessionId: number) => {
    try {
      await sessionService.delete(`/${sessionId}`);
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      alert("Sesión cerrada correctamente");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-8 bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-semibold mb-4">Sesiones activas del usuario</h2>

      {sessions.length === 0 ? (
        <p>No hay sesiones activas.</p>
      ) : (
        <ul className="space-y-3">
          {sessions.map((session) => (
            <li
              key={session.id}
              className="border p-4 rounded-md flex justify-between items-center"
            >
              <div>
                <p><strong>ID:</strong> {session.id}</p>
                <p><strong>Token:</strong> {session.token}</p>
                <p><strong>Creada:</strong> {new Date(session.created_at!).toLocaleString()}</p>
              </div>
              <button
                onClick={() => handleCloseSession(session.id!)}
                className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded"
              >
                Cerrar sesión
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default UserSessions;
