// src/services/auth/index.ts
import { AuthProvider } from '../../types/authTypes';
import { GoogleAuthProvider } from './provider/googleProvider';
import { MicrosoftAuthProvider } from './provider/microsoftProvider';
import { GitHubAuthProvider } from './provider/githubProvider';

// cast to any to avoid TS complaining about ImportMeta types in some editors
const env: any = import.meta;
const googleClientId = env.env?.VITE_GOOGLE_CLIENT_ID as string;
const googleRedirect = env.env?.VITE_GOOGLE_REDIRECT_URI as string;

const microsoftClientId = env.env?.VITE_MICROSOFT_CLIENT_ID as string;
const microsoftRedirect = env.env?.VITE_MICROSOFT_REDIRECT_URI as string;

const githubClientId = env.env?.VITE_GITHUB_CLIENT_ID as string;
const githubRedirect = env.env?.VITE_GITHUB_REDIRECT_URI as string;

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
