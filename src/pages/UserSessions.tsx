import React, { useEffect, useState } from "react";
import { Session } from "../models/Session.ts";
import { sessionService } from "../services/SessionService.ts";

interface UserSessionsProps {
  userId: number;
}

const UserSessions: React.FC<UserSessionsProps> = ({ userId }) => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        setError(null);
        // Usa el método específico del servicio
        const data = await sessionService.getByUserId(userId);
        setSessions(data);
      } catch (error) {
        console.error("Error al obtener sesiones:", error);
        setError("Error al cargar las sesiones");
      } finally {
        setLoading(false);
      }
    };
    
    if (userId) {
      fetchSessions();
    }
  }, [userId]);

  const handleCloseSession = async (sessionId: number) => {
    if (!confirm("¿Estás seguro de cerrar esta sesión?")) return;
    
    try {
      await sessionService.closeSession(sessionId);
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      alert("Sesión cerrada correctamente");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      alert("Error al cerrar la sesión");
    }
  };

  const handleCloseAllSessions = async () => {
    if (!confirm("¿Estás seguro de cerrar TODAS las sesiones?")) return;
    
    try {
      await sessionService.closeAllSessions(userId);
      setSessions([]);
      alert("Todas las sesiones han sido cerradas");
    } catch (error) {
      console.error("Error al cerrar todas las sesiones:", error);
      alert("Error al cerrar las sesiones");
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto mt-8 bg-white shadow-md rounded-lg p-6">
        <p>Cargando sesiones...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto mt-8 bg-white shadow-md rounded-lg p-6">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto mt-8 bg-white shadow-md rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">
          Sesiones activas del usuario {userId}
        </h2>
        {sessions.length > 0 && (
          <button
            onClick={handleCloseAllSessions}
            className="bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded"
          >
            Cerrar todas
          </button>
        )}
      </div>

      {sessions.length === 0 ? (
        <p className="text-gray-500">No hay sesiones activas.</p>
      ) : (
        <ul className="space-y-3">
          {sessions.map((session) => (
            <li
              key={session.id}
              className="border p-4 rounded-md flex justify-between items-center hover:bg-gray-50"
            >
              <div>
                <p>
                  <strong>Identificación:</strong> {session.id}
                </p>
                <p>
                  <strong>Token:</strong> {session.token}
                </p>
                <p>
                  <strong>Creada:</strong>{" "}
                  {new Date(session.created_at!).toLocaleString("es-ES", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
                {session.expires_at && (
                  <p>
                    <strong>Expira:</strong>{" "}
                    {new Date(session.expires_at).toLocaleString("es-ES", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                )}
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