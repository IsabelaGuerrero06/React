/**
 * Servicio para gestionar el usuario autenticado
 * 
 * ✅ SOLUCIÓN: Centraliza la lógica para obtener y mantener
 * el usuario que inició sesión, separado de otros usuarios del sistema
 */

import { User } from '../models/User';

class AuthenticatedUserService {
  private readonly USER_KEY = 'user';
  private readonly USER_ID_KEY = 'currentUserId';
  private readonly TOKEN_KEY = 'token';

  /**
   * Obtiene el ID del usuario autenticado
   * @returns El ID del usuario autenticado o null si no hay sesión
   */
  getAuthenticatedUserId(): number | null {
    try {
      // 1️⃣ Intentar obtener de currentUserId
      const currentUserId = localStorage.getItem(this.USER_ID_KEY);
      if (currentUserId && !isNaN(Number(currentUserId))) {
        return Number(currentUserId);
      }

      // 2️⃣ Fallback: obtener del objeto user
      const userStr = localStorage.getItem(this.USER_KEY);
      if (userStr) {
        const user = JSON.parse(userStr);
        if (user.id && !isNaN(Number(user.id))) {
          // Sincronizar currentUserId
          localStorage.setItem(this.USER_ID_KEY, String(user.id));
          return Number(user.id);
        }
      }

      return null;
    } catch (error) {
      console.error('❌ Error obteniendo ID de usuario autenticado:', error);
      return null;
    }
  }

  /**
   * Obtiene el objeto completo del usuario autenticado
   * @returns El usuario autenticado o null si no hay sesión
   */
  getAuthenticatedUser(): User | null {
    try {
      const userStr = localStorage.getItem(this.USER_KEY);
      if (!userStr) return null;

      const user = JSON.parse(userStr);
      return user as User;
    } catch (error) {
      console.error('❌ Error obteniendo usuario autenticado:', error);
      return null;
    }
  }

  /**
   * Establece el usuario autenticado
   * @param user - Usuario que inició sesión
   * @param token - Token de autenticación (opcional)
   */
  setAuthenticatedUser(user: User, token?: string): void {
    try {
      // Guardar usuario
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
      
      // Guardar ID del usuario
      if (user.id) {
        localStorage.setItem(this.USER_ID_KEY, String(user.id));
      }

      // Guardar token si se proporciona
      if (token) {
        localStorage.setItem(this.TOKEN_KEY, token);
      }

      console.log('✅ Usuario autenticado guardado:', {
        id: user.id,
        name: user.name,
        email: user.email
      });
    } catch (error) {
      console.error('❌ Error guardando usuario autenticado:', error);
    }
  }

  /**
   * Actualiza el usuario autenticado (por ejemplo, después de actualizar el perfil)
   * @param updates - Campos a actualizar
   */
  updateAuthenticatedUser(updates: Partial<User>): void {
    try {
      const currentUser = this.getAuthenticatedUser();
      if (!currentUser) {
        console.warn('⚠️ No hay usuario autenticado para actualizar');
        return;
      }

      const updatedUser = { ...currentUser, ...updates };
      localStorage.setItem(this.USER_KEY, JSON.stringify(updatedUser));

      console.log('✅ Usuario autenticado actualizado:', updates);
    } catch (error) {
      console.error('❌ Error actualizando usuario autenticado:', error);
    }
  }

  /**
   * Verifica si hay un usuario autenticado
   * @returns true si hay sesión activa, false en caso contrario
   */
  isAuthenticated(): boolean {
    const userId = this.getAuthenticatedUserId();
    const token = localStorage.getItem(this.TOKEN_KEY);
    return userId !== null && token !== null;
  }

  /**
   * Verifica si un ID corresponde al usuario autenticado
   * @param userId - ID a verificar
   * @returns true si el ID corresponde al usuario autenticado
   */
  isAuthenticatedUser(userId: number): boolean {
    const authenticatedId = this.getAuthenticatedUserId();
    return authenticatedId === userId;
  }

  /**
   * Limpia los datos del usuario autenticado (logout)
   */
  clearAuthenticatedUser(): void {
    try {
      localStorage.removeItem(this.USER_KEY);
      localStorage.removeItem(this.USER_ID_KEY);
      localStorage.removeItem(this.TOKEN_KEY);
      console.log('✅ Datos de usuario autenticado limpiados');
    } catch (error) {
      console.error('❌ Error limpiando datos de usuario autenticado:', error);
    }
  }

  /**
   * Guarda temporalmente el usuario autenticado antes de una operación
   * que podría sobrescribirlo
   * @returns Los datos guardados para restaurar después
   */
  backupAuthenticatedUser(): { user: string | null; userId: string | null; token: string | null } {
    return {
      user: localStorage.getItem(this.USER_KEY),
      userId: localStorage.getItem(this.USER_ID_KEY),
      token: localStorage.getItem(this.TOKEN_KEY)
    };
  }

  /**
   * Restaura el usuario autenticado desde un backup
   * @param backup - Backup creado con backupAuthenticatedUser()
   */
  restoreAuthenticatedUser(backup: { user: string | null; userId: string | null; token: string | null }): void {
    try {
      if (backup.user) {
        localStorage.setItem(this.USER_KEY, backup.user);
      }
      if (backup.userId) {
        localStorage.setItem(this.USER_ID_KEY, backup.userId);
      }
      if (backup.token) {
        localStorage.setItem(this.TOKEN_KEY, backup.token);
      }
      console.log('✅ Usuario autenticado restaurado desde backup');
    } catch (error) {
      console.error('❌ Error restaurando usuario autenticado:', error);
    }
  }

  /**
   * Obtiene el token del usuario autenticado
   * @returns El token o null si no existe
   */
  getAuthToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }
}

// Exportar instancia singleton
export const authenticatedUserService = new AuthenticatedUserService();