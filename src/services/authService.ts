import {
  AuthProvider,
  AuthResponse,
  AuthToken,
  AuthUser,
  LoginCredentials,
  OAuthResult,
  ProviderOptions,
} from '../types/authTypes';
import { AuthProviderFactory } from './authFactory';
import { IAuthProvider } from './auth/provider/baseProvider';

/**
 * Servicio principal de autenticación
 * Maneja tanto autenticación tradicional como OAuth
 */
export class AuthService {
  private static instance: AuthService;
  private currentProvider: IAuthProvider | null = null;
  private apiBaseUrl: string;

  private constructor(apiBaseUrl: string = '/api') {
    this.apiBaseUrl = apiBaseUrl;
  }

  /**
   * Obtiene la instancia única del servicio (Singleton)
   */
  static getInstance(apiBaseUrl?: string): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService(apiBaseUrl);
    }
    return AuthService.instance;
  }

  /**
   * Configura la URL base de la API
   */
  setApiBaseUrl(url: string): void {
    this.apiBaseUrl = url;
  }

  // ==================== AUTENTICACIÓN TRADICIONAL ====================

  /**
   * Login con email y password
   */
  async signIn(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }

      const data = await response.json();
      
      // Guardar token y usuario en storage
      this.saveAuthData(data.token, data.user);

      return {
        token: data.token,
        user: data.user,
      };
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  }

  /**
   * Registro de nuevo usuario
   */
  async signUp(userData: {
    email: string;
    password: string;
    name: string;
  }): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Registration failed');
      }

      const data = await response.json();
      
      // Guardar token y usuario en storage
      this.saveAuthData(data.token, data.user);

      return {
        token: data.token,
        user: data.user,
      };
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  }

  /**
   * Cierra la sesión actual
   */
  async signOut(): Promise<void> {
    try {
      const token = this.getToken();
      
      if (token) {
        // Intentar notificar al backend
        await fetch(`${this.apiBaseUrl}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token.accessToken}`,
          },
        });
      }

      // Si hay un proveedor OAuth activo, cerrar sesión
      if (this.currentProvider) {
        await this.currentProvider.signOut();
      }

      // Limpiar datos locales
      this.clearAuthData();
      this.currentProvider = null;
    } catch (error) {
      console.error('Sign out error:', error);
      // Aún así limpiar datos locales
      this.clearAuthData();
      throw error;
    }
  }

  // ==================== AUTENTICACIÓN OAUTH ====================

  /**
   * Inicia el flujo OAuth con un proveedor específico
   */
  async signInWithOAuth(
    provider: AuthProvider,
    config: any,
    options?: ProviderOptions
  ): Promise<OAuthResult | void> {
    try {
      // Crear o obtener instancia del proveedor
      this.currentProvider = AuthProviderFactory.createProvider(provider, config);
      
      // Verificar que el proveedor se creó correctamente
      if (!this.currentProvider) {
        throw new Error('Failed to create authentication provider');
      }
      
      // Inicializar el proveedor
      await this.currentProvider.initialize();
      
      // Ejecutar sign in
      // Nota: Si options.redirect es true, esta llamada redireccionará
      // y nunca retornará. Solo retorna resultado si es popup.
      const result = await this.currentProvider.signIn(options);

      // Solo llegamos aquí si es modo popup
      return result;
    } catch (error) {
      console.error('OAuth sign in error:', error);
      throw error;
    }
  }

  /**
   * Maneja el callback de OAuth (después del redirect)
   */
  async handleOAuthCallback(
    provider: AuthProvider,
    code: string,
    state: string
  ): Promise<AuthResponse> {
    try {
      // Validar state para prevenir CSRF
      const savedState = sessionStorage.getItem('oauth_state');
      if (savedState !== state) {
        throw new Error('Invalid state parameter - possible CSRF attack');
      }

      // Enviar el código al backend para validación y obtener usuario
      const response = await fetch(`${this.apiBaseUrl}/auth/oauth/callback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider,
          code,
          state,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'OAuth callback failed');
      }

      const data = await response.json();
      
      // Guardar datos de autenticación
      this.saveAuthData(data.token, data.user);

      // Limpiar state
      sessionStorage.removeItem('oauth_state');
      sessionStorage.removeItem('oauth_nonce');

      return {
        token: data.token,
        user: data.user,
      };
    } catch (error) {
      console.error('OAuth callback error:', error);
      throw error;
    }
  }

  // ==================== GESTIÓN DE TOKENS ====================

  /**
   * Obtiene el token actual
   */
  getToken(): AuthToken | null {
    const tokenStr = localStorage.getItem('auth_token');
    if (!tokenStr) return null;

    try {
      return JSON.parse(tokenStr);
    } catch {
      return null;
    }
  }

  /**
   * Obtiene el access token
   */
  getAccessToken(): string | null {
    const token = this.getToken();
    return token?.accessToken || null;
  }

  /**
   * Verifica si el token está expirado
   */
  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token || !token.expiresIn) return true;

    const expirationTime = token.expiresIn * 1000; // Convertir a ms
    return Date.now() >= expirationTime;
  }

  /**
   * Refresca el token de acceso
   */
  async refreshToken(): Promise<AuthToken> {
    try {
      const token = this.getToken();
      if (!token?.refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await fetch(`${this.apiBaseUrl}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refreshToken: token.refreshToken,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }

      const data = await response.json();
      const newToken: AuthToken = data.token;

      // Actualizar token en storage
      localStorage.setItem('auth_token', JSON.stringify(newToken));

      return newToken;
    } catch (error) {
      console.error('Refresh token error:', error);
      // Si falla el refresh, cerrar sesión
      await this.signOut();
      throw error;
    }
  }

  // ==================== GESTIÓN DE USUARIO ====================

  /**
   * Obtiene el usuario actual
   */
  getCurrentUser(): AuthUser | null {
    const userStr = localStorage.getItem('auth_user');
    if (!userStr) return null;

    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  /**
   * Actualiza la información del usuario
   */
  async updateUser(userData: Partial<AuthUser>): Promise<AuthUser> {
    try {
      const token = this.getAccessToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await fetch(`${this.apiBaseUrl}/auth/user`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error('Failed to update user');
      }

      const data = await response.json();
      const updatedUser: AuthUser = data.user;

      // Actualizar usuario en storage
      localStorage.setItem('auth_user', JSON.stringify(updatedUser));

      return updatedUser;
    } catch (error) {
      console.error('Update user error:', error);
      throw error;
    }
  }

  /**
   * Verifica si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    const user = this.getCurrentUser();
    return !!(token && user && !this.isTokenExpired());
  }

  /**
   * Verifica si el usuario tiene un rol específico
   */
  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.roles?.includes(role) || false;
  }

  /**
   * Verifica si el usuario tiene un permiso específico
   */
  hasPermission(permission: string): boolean {
    const user = this.getCurrentUser();
    return user?.permissions?.includes(permission) || false;
  }

  // ==================== HELPERS PRIVADOS ====================

  /**
   * Guarda los datos de autenticación en storage
   */
  private saveAuthData(token: AuthToken, user: AuthUser): void {
    localStorage.setItem('auth_token', JSON.stringify(token));
    localStorage.setItem('auth_user', JSON.stringify(user));
  }

  /**
   * Limpia los datos de autenticación del storage
   */
  private clearAuthData(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    sessionStorage.removeItem('oauth_state');
    sessionStorage.removeItem('oauth_nonce');
    sessionStorage.removeItem('refresh_token');
  }

  /**
   * Obtiene el proveedor OAuth actual
   */
  getCurrentProvider(): IAuthProvider | null {
    return this.currentProvider;
  }
}

// Export de la instancia singleton
export default AuthService;