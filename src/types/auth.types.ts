export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  picture?: string;
}

export interface AuthResponse {
  user: AuthUser | null;
  token: string;
}

export interface OAuthConfig {
  clientId: string;
  redirectUri: string;
}

export interface AuthProvider {
  login: () => Promise<void>;
  handleCallback: (code: string) => Promise<AuthResponse>;
}