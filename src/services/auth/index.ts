// src/services/auth/index.ts
import { AuthProvider } from '../../types/authTypes';
import { GoogleAuthProvider } from './provider/googleProvider';
import { MicrosoftAuthProvider } from './provider/microsoftProvider';
import { GitHubAuthProvider } from './provider/githubProvider';

// Leer variables Vite import.meta.env directamente
const googleClientId = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID as string || '';
const googleRedirect = (import.meta as any).env?.VITE_GOOGLE_REDIRECT_URI as string || '';

const microsoftClientId = (import.meta as any).env?.VITE_MICROSOFT_CLIENT_ID as string || '';
const microsoftRedirect = (import.meta as any).env?.VITE_MICROSOFT_REDIRECT_URI as string || '';

const githubClientId = (import.meta as any).env?.VITE_GITHUB_CLIENT_ID as string || '';
const githubRedirect = (import.meta as any).env?.VITE_GITHUB_REDIRECT_URI as string || '';

export const providers = {
  [AuthProvider.GOOGLE]: new GoogleAuthProvider({ clientId: googleClientId, redirectUri: googleRedirect }),
  [AuthProvider.MICROSOFT]: new MicrosoftAuthProvider({ clientId: microsoftClientId, redirectUri: microsoftRedirect }),
  [AuthProvider.GITHUB]: new GitHubAuthProvider({ clientId: githubClientId, redirectUri: githubRedirect }),
};

export async function signInWith(providerKey: AuthProvider, options?: { popup?: boolean }) {
  const provider = providers[providerKey];
  if (!provider) throw new Error('Provider not configured: ' + providerKey);
  return provider.signIn({ popup: options?.popup });
}

export default providers;
