// src/services/auth/index.ts
import { AuthProvider } from '../../types/authTypes';
import { GoogleAuthProvider } from './provider/googleProvider';
import { MicrosoftAuthProvider } from './provider/microsoftProvider';
import { GitHubAuthProvider } from './provider/githubProvider';

// Leer variables de entorno
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
const googleRedirect = import.meta.env.VITE_GOOGLE_REDIRECT_URI || '';

const microsoftClientId = import.meta.env.VITE_MICROSOFT_CLIENT_ID || '';
const microsoftRedirect = import.meta.env.VITE_MICROSOFT_REDIRECT_URI || '';

const githubClientId = import.meta.env.VITE_GITHUB_CLIENT_ID || '';
const githubRedirect = import.meta.env.VITE_GITHUB_REDIRECT_URI || '';

// 🔍 Debug: Verificar que las variables se lean correctamente
console.log('Auth Config Debug:', {
  google: {
    clientId: googleClientId ? `${googleClientId.slice(0, 20)}...` : 'MISSING',
    redirectUri: googleRedirect || 'MISSING',
  },
  microsoft: {
    clientId: microsoftClientId ? `${microsoftClientId.slice(0, 20)}...` : 'MISSING',
    redirectUri: microsoftRedirect || 'MISSING',
  },
  github: {
    clientId: githubClientId || ' MISSING',
    redirectUri: githubRedirect || ' MISSING',
  }
});

export const providers = {
  [AuthProvider.GOOGLE]: new GoogleAuthProvider({ 
    clientId: googleClientId, 
    redirectUri: googleRedirect 
  }),
  [AuthProvider.MICROSOFT]: new MicrosoftAuthProvider({ 
    clientId: microsoftClientId, 
    redirectUri: microsoftRedirect 
  }),
  [AuthProvider.GITHUB]: new GitHubAuthProvider({ 
    clientId: githubClientId, 
    redirectUri: githubRedirect 
  }),
};

export async function signInWith(providerKey: AuthProvider, options?: { popup?: boolean }) {
  const provider = providers[providerKey];
  if (!provider) {
    console.error('Provider not found:', providerKey);
    throw new Error('Provider not configured: ' + providerKey);
  }
  
  console.log(`Starting signIn with ${providerKey}`, options);
  return provider.signIn({ popup: options?.popup });
}

export default providers;