// src/services/SessionService.ts

import { Session, CreateSessionDTO, UpdateSessionDTO } from '../models/Session';
import { SessionAdapter } from '../adapters/SessionAdapter';

/**
 * Servicio para gestionar sesiones de usuario
 *
 * SOLID Principles aplicados:
 * - Single Responsibility: Solo maneja comunicación con API de sesiones
 * - Open/Closed: Extendible para nuevas operaciones
 * - Dependency Inversion: Depende de abstracciones (Adapter)
 *
 * NOTA: No hereda de BaseService debido a incompatibilidades de tipos
 * (BaseService espera IDs numéricos, pero Session usa UUIDs string)
 */
export class SessionService {
  private readonly baseURL: string;
  private readonly endpoint: string;

  constructor() {
    // Ajusta esta URL según tu configuración
    // Para Vite usa import.meta.env.VITE_API_URL
    // Para Create React App usa process.env.REACT_APP_API_URL
    this.baseURL =
      typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL
        ? `${import.meta.env.VITE_API_URL}/api`
        : typeof process !== 'undefined' && process.env?.REACT_APP_API_URL
        ? `${process.env.REACT_APP_API_URL}/api`
        : 'http://localhost:8000/api';
    this.endpoint = '/sessions';
  }

  /**
   * Obtiene todas las sesiones de un usuario específico
   * Backend endpoint: GET /sessions/user/{user_id}
   *
   * @param userId - ID del usuario
   * @returns Promise<Session[]>
   */
  async getByUserId(userId: number): Promise<Session[]> {
    try {
      const url = `${this.baseURL}${this.endpoint}/user/${userId}`;

      // DEBUG TEMPORAL
      console.log('🔗 URL construida:', url);
      console.log('🔧 baseURL:', this.baseURL);
      console.log('🔧 endpoint:', this.endpoint);
      console.log('👤 userId:', userId);

      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      console.log('📊 Status HTTP:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error del servidor:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('📦 Datos crudos del backend:', data);

      if (Array.isArray(data)) {
        return SessionAdapter.fromBackendArray(data);
      }
      return [];
    } catch (error) {
      console.error(`Error obteniendo sesiones del usuario ${userId}:`, error);
      throw new Error(`No se pudieron obtener las sesiones: ${error}`);
    }
  }

  /**
   * Obtiene una sesión específica por ID
   * Backend endpoint: GET /sessions/{session_id}
   *
   * @param sessionId - UUID de la sesión
   * @returns Promise<Session>
   */
  async getById(sessionId: string): Promise<Session> {
    try {
      const url = `${this.baseURL}${this.endpoint}/${sessionId}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Sesiones crudas del backend:', data);
      return SessionAdapter.fromBackend(data);
    } catch (error) {
      console.error(`Error obteniendo sesión ${sessionId}:`, error);
      throw new Error(`No se pudo obtener la sesión: ${error}`);
    }
  }

  /**
   * Crea una nueva sesión para un usuario
   * Backend endpoint: POST /sessions/user/{user_id}
   *
   * @param userId - ID del usuario
   * @param data - Datos de la sesión a crear
   * @returns Promise<Session>
   */
  async createSession(
    userId: number,
    data: CreateSessionDTO,
  ): Promise<Session> {
    try {
      // Convertir expiration de string a Date si es necesario
      const normalizedData = {
        ...data,
        expiration: data.expiration ? new Date(data.expiration) : undefined,
      };

      // Transformar datos al formato del backend
      const backendPayload = SessionAdapter.toBackendCreate(normalizedData);

      const url = `${this.baseURL}${this.endpoint}/user/${userId}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(backendPayload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      console.log('Sesiones crudas del backend:', data);
      return SessionAdapter.fromBackend(responseData);
    } catch (error) {
      console.error(`Error creando sesión para usuario ${userId}:`, error);
      throw new Error(`No se pudo crear la sesión: ${error}`);
    }
  }

  /**
   * Actualiza una sesión existente
   * Backend endpoint: PUT /sessions/{session_id}
   *
   * @param sessionId - UUID de la sesión
   * @param data - Datos a actualizar
   * @returns Promise<Session>
   */
  async updateSession(
    sessionId: string,
    data: UpdateSessionDTO,
  ): Promise<Session> {
    try {
      // Convertir expiration de string a Date si es necesario
      const normalizedData = {
        ...data,
        expiration: data.expiration ? new Date(data.expiration) : undefined,
      };

      const backendPayload = SessionAdapter.toBackendUpdate(normalizedData);

      const url = `${this.baseURL}${this.endpoint}/${sessionId}`;
      const response = await fetch(url, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(backendPayload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      console.log('Sesiones crudas del backend:', data);
      return SessionAdapter.fromBackend(responseData);
    } catch (error) {
      console.error(`Error actualizando sesión ${sessionId}:`, error);
      throw new Error(`No se pudo actualizar la sesión: ${error}`);
    }
  }

  /**
   * Cierra (elimina) una sesión específica
   * Backend endpoint: DELETE /sessions/{session_id}
   *
   * @param sessionId - UUID de la sesión (string, no number)
   * @returns Promise<void>
   */
  async closeSession(sessionId: string): Promise<void> {
    try {
      const url = `${this.baseURL}${this.endpoint}/${sessionId}`;
      const response = await fetch(url, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error(`Error cerrando sesión ${sessionId}:`, error);
      throw new Error(`No se pudo cerrar la sesión: ${error}`);
    }
  }

  /**
   * Cierra todas las sesiones de un usuario
   * NOTA: Este endpoint NO EXISTE en el backend actual
   *
   * Alternativa: Obtener todas las sesiones y cerrarlas una por una
   *
   * @param userId - ID del usuario
   * @returns Promise<void>
   */
  async closeAllSessions(userId: number): Promise<void> {
    try {
      // Obtener todas las sesiones del usuario
      const sessions = await this.getByUserId(userId);

      // Cerrar cada sesión individualmente (secuencialmente para evitar rate limiting)
      for (const session of sessions) {
        await this.closeSession(session.id);
      }
    } catch (error) {
      console.error(
        `Error cerrando todas las sesiones del usuario ${userId}:`,
        error,
      );
      throw new Error(`No se pudieron cerrar todas las sesiones: ${error}`);
    }
  }

  /**
   * Obtiene solo sesiones activas de un usuario
   * Filtra las sesiones que están activas y no han expirado
   *
   * @param userId - ID del usuario
   * @returns Promise<Session[]>
   */
  async getActiveSessions(userId: number): Promise<Session[]> {
    try {
      const allSessions = await this.getByUserId(userId);

      // Filtrar solo sesiones válidas usando el adapter
      return allSessions.filter((session) => {
        const validation = SessionAdapter.validateSession(session);
        return validation.isValid;
      });
    } catch (error) {
      console.error(
        `Error obteniendo sesiones activas del usuario ${userId}:`,
        error,
      );
      throw new Error(`No se pudieron obtener las sesiones activas: ${error}`);
    }
  }

  /**
   * Método auxiliar para obtener headers
   * Sobrescribe este método si necesitas agregar autenticación
   */
  protected getHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      // Agregar token de autenticación si es necesario
      // 'Authorization': `Bearer ${getAuthToken()}`
    };
  }
}

// Exportar instancia singleton
export const sessionService = new SessionService();
