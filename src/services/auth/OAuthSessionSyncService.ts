// src/services/OAuthSessionSyncService.ts
import { sessionService } from '../SessionService';
import { CreateSessionDTO } from '../../models/Session';

/**
 * Servicio para sincronizar sesiones OAuth con el sistema de sesiones del backend
 * SOLID: Single Responsibility - Solo sincroniza sesiones OAuth
 */
export class OAuthSessionSyncService {
  
  /**
   * Crea una sesión en la BD cuando un usuario inicia sesión con OAuth
   */
  async syncOAuthSession(userId: number, oauthToken: string): Promise<void> {
    try {
      // Validación de parámetros
      if (!userId || userId <= 0) {
        console.warn('⚠️ No se puede sincronizar sesión: userId inválido', userId);
        return;
      }

      if (!oauthToken) {
        console.warn('⚠️ No se puede sincronizar sesión: token vacío');
        return;
      }

      console.log(`🔄 Sincronizando sesión OAuth para usuario ${userId}`);

      const sessionData: CreateSessionDTO = {
        token: oauthToken,
        expiration: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 horas
        state: 'active',
        FACode: null
      };

      await sessionService.createSession(userId, sessionData);
      console.log('✅ Sesión OAuth sincronizada con BD');
      
    } catch (error) {
      console.error('❌ Error sincronizando sesión OAuth:', error);
    }
  }

  /**
   * Obtiene el ID del usuario actual desde localStorage
   */
  getCurrentUserId(): number | null {
    try {
      const userId = localStorage.getItem('currentUserId');
      return userId ? parseInt(userId) : null;
    } catch (error) {
      console.error('Error obteniendo currentUserId:', error);
      return null;
    }
  }

  /**
   * Verifica si hay una sesión OAuth activa que necesita sincronización
   */
  shouldSyncOAuthSession(): boolean {
    try {
      const token = localStorage.getItem('token');
      const userId = this.getCurrentUserId();
      return !!(token && userId && userId > 0);
    } catch (error) {
      console.error('Error verificando sesión OAuth:', error);
      return false;
    }
  }
}

export const oauthSessionSync = new OAuthSessionSyncService();