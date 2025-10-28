import { AuthProvider, AuthResponse } from "../../types/auth.types";
import { microsoftOAuthConfig } from "../../config/authConfig";

export const microsoftAuthProvider: AuthProvider = {
  async login() {
    const params = new URLSearchParams({
      client_id: microsoftOAuthConfig.clientId,
      response_type: 'code',
      redirect_uri: microsoftOAuthConfig.redirectUri,
      scope: 'openid profile email',
      response_mode: 'query'
    });

    // Redirigir a Microsoft para autenticación
    window.location.href = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${params.toString()}`;
  },

  async handleCallback(code: string): Promise<AuthResponse> {
    try {
      // Intercambiar el código por tokens usando el backend
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/microsoft/callback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code })
      });

      if (!response.ok) {
        throw new Error('Error al procesar el callback de Microsoft');
      }

      const data = await response.json();

      if (!data.user || !data.token) {
        throw new Error('Respuesta inválida del servidor');
      }

      return {
        user: {
          id: data.user.id,
          email: data.user.email,
          name: data.user.name,
          picture: data.user.picture
        },
        token: data.token
      };
    } catch (error) {
      console.error('Error en handleCallback de Microsoft:', error);
      throw error;
    }
  }
    // Por ahora solo logueamos el código
    console.log('Código de autorización recibido:', code);
    return {
      token: code,
      user: null

  }
};