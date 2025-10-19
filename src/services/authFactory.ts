// src/services/auth/authFactory.ts

import { AuthProvider, OAuthConfig } from '../../types/authTypes';
import { IAuthProvider } from './providers/baseProvider';
import { GoogleAuthProvider } from './providers/googleProvider';
import { MicrosoftAuthProvider } from './providers/microsoftProvider';
import { GitHubAuthProvider } from './provider/githubProvider';

/**
 * Factory para crear instancias de proveedores de autenticación OAuth
 * Implementa el patrón Factory para desacoplar la creación de objetos
 */
export class AuthProviderFactory {
  private static instances: Map<AuthProvider, IAuthProvider> = new Map();

  /**
   * Crea o retorna una instancia existente del proveedor especificado
   * @param provider - Tipo de proveedor OAuth
   * @param config - Configuración OAuth del proveedor
   * @param singleton - Si true, retorna la misma instancia (patrón Singleton)
   * @returns Instancia del proveedor de autenticación
   */
  static createProvider(
    provider: AuthProvider,
    config: OAuthConfig,
    singleton: boolean = true
  ): IAuthProvider {
    // Si es singleton y ya existe una instancia, retornarla
    if (singleton && this.instances.has(provider)) {
      const existingInstance = this.instances.get(provider);
      if (existingInstance) {
        return existingInstance;
      }
    }

    // Crear nueva instancia según el tipo de proveedor
    let providerInstance: IAuthProvider;

    switch (provider) {
      case AuthProvider.GOOGLE:
        providerInstance = new GoogleAuthProvider(config);
        break;

      case AuthProvider.MICROSOFT:
        providerInstance = new MicrosoftAuthProvider(config);
        break;

      case AuthProvider.GITHUB:
        providerInstance = new GitHubAuthProvider(config);
        break;

      default:
        throw new Error(`Unknown authentication provider: ${provider}`);
    }

    // Guardar instancia si es singleton
    if (singleton) {
      this.instances.set(provider, providerInstance);
    }

    return providerInstance;
  }

  /**
   * Obtiene una instancia existente del proveedor
   * @param provider - Tipo de proveedor OAuth
   * @returns Instancia del proveedor o undefined si no existe
   */
  static getInstance(provider: AuthProvider): IAuthProvider | undefined {
    return this.instances.get(provider);
  }

  /**
   * Verifica si existe una instancia del proveedor
   * @param provider - Tipo de proveedor OAuth
   * @returns true si existe una instancia
   */
  static hasInstance(provider: AuthProvider): boolean {
    return this.instances.has(provider);
  }

  /**
   * Elimina la instancia del proveedor del cache
   * @param provider - Tipo de proveedor OAuth
   */
  static clearInstance(provider: AuthProvider): void {
    this.instances.delete(provider);
  }

  /**
   * Limpia todas las instancias almacenadas
   */
  static clearAllInstances(): void {
    this.instances.clear();
  }

  /**
   * Obtiene todos los proveedores disponibles
   * @returns Array con los tipos de proveedores disponibles
   */
  static getAvailableProviders(): AuthProvider[] {
    return [
      AuthProvider.GOOGLE,
      AuthProvider.MICROSOFT,
      AuthProvider.GITHUB,
    ];
  }

  /**
   * Verifica si un proveedor está soportado
   * @param provider - Tipo de proveedor a verificar
   * @returns true si el proveedor está soportado
   */
  static isProviderSupported(provider: string): provider is AuthProvider {
    return this.getAvailableProviders().includes(provider as AuthProvider);
  }

  /**
   * Crea múltiples proveedores a la vez
   * @param configs - Mapa de configuraciones por proveedor
   * @returns Mapa de instancias de proveedores
   */
  static createMultipleProviders(
    configs: Map<AuthProvider, OAuthConfig>
  ): Map<AuthProvider, IAuthProvider> {
    const providers = new Map<AuthProvider, IAuthProvider>();

    configs.forEach((config, provider) => {
      try {
        const instance = this.createProvider(provider, config, true);
        providers.set(provider, instance);
      } catch (error) {
        console.error(`Failed to create provider ${provider}:`, error);
      }
    });

    return providers;
  }
}

/**
 * Función helper para crear un proveedor rápidamente
 * @param provider - Tipo de proveedor OAuth
 * @param config - Configuración OAuth del proveedor
 * @returns Instancia del proveedor de autenticación
 */
export const createAuthProvider = (
  provider: AuthProvider,
  config: OAuthConfig
): IAuthProvider => {
  return AuthProviderFactory.createProvider(provider, config);
};

/**
 * Función helper para obtener un proveedor existente
 * @param provider - Tipo de proveedor OAuth
 * @returns Instancia del proveedor o undefined
 */
export const getAuthProvider = (
  provider: AuthProvider
): IAuthProvider | undefined => {
  return AuthProviderFactory.getInstance(provider);
};

// Export default para importación simplificada
export default AuthProviderFactory;