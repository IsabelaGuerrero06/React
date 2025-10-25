// src/services/SessionService.ts
import { BaseService } from "./base/BaseService";
import { Session } from "../models/Session";

export class SessionService extends BaseService<Session> {
  constructor() {
    super("/sessions"); // Ruta base en tu backend
  }

  // 🔹 Obtener todas las sesiones activas de un usuario
  async getByUserId(userId: number): Promise<Session[]> {
    return this.getAll(`/user/${userId}`);
  }

  // 🔹 Cerrar (eliminar) una sesión específica
  async closeSession(sessionId: number): Promise<void> {
    await this.delete(sessionId);
  }

  // 🔹 Cerrar todas las sesiones de un usuario
  async closeAllSessions(userId: number): Promise<void> {
    await this.delete(`/user/${userId}/all`);
  }
}

// Exportamos una instancia lista para usar
export const sessionService = new SessionService();
