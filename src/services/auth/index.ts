// src/services/auth/index.ts
import { AuthProvider } from '../../types/authTypes';
import { GoogleAuthProvider } from './provider/googleProvider';
import { MicrosoftAuthProvider } from './provider/microsoftProvider';
import { GitHubAuthProvider } from './provider/githubProvider';

// Microsoft y GitHub usan OAuth tradicional (necesitan config)
const microsoftClientId = import.meta.env.VITE_MICROSOFT_CLIENT_ID || '';
const microsoftRedirect = import.meta.env.VITE_MICROSOFT_REDIRECT_URI || '';

const githubClientId = import.meta.env.VITE_GITHUB_CLIENT_ID || '';
const githubRedirect = import.meta.env.VITE_GITHUB_REDIRECT_URI || '';

// 🔍 Debug: Verificar configuración
console.log('Auth Config Debug:', {
  google: {
    method: '🔥 Firebase (no necesita clientId/redirectUri)',
    status: '✅ Ready'
  },
  microsoft: {
    clientId: microsoftClientId ? `${microsoftClientId.slice(0, 20)}...` : 'MISSING',
    redirectUri: microsoftRedirect || 'MISSING',
    method: '🔥 Firebase',
    status: microsoftClientId ? '✅ Ready' : '❌ Not configured'
  },
  github: {
    clientId: githubClientId || 'MISSING',
    redirectUri: githubRedirect || 'MISSING',
    method: '🔧 OAuth Manual',
    status: githubClientId ? '✅ Ready' : '❌ Not configured'
  }
});

// ✨ Proveedores configurados
export const providers = {
  // Google usa Firebase - NO necesita clientId ni redirectUri
  [AuthProvider.GOOGLE]: new GoogleAuthProvider({ 
    clientId: '', // Firebase lo maneja internamente
    redirectUri: '' // Firebase lo maneja internamente
  }),
  
  // Microsoft usa Firebase - pero podría necesitar config custom
  [AuthProvider.MICROSOFT]: new MicrosoftAuthProvider({ 
    clientId: microsoftClientId, 
    redirectUri: microsoftRedirect 
  }),
  
  // GitHub usa OAuth tradicional
  [AuthProvider.GITHUB]: new GitHubAuthProvider({ 
    clientId: githubClientId, 
    redirectUri: githubRedirect 
  }),
};

/**
 * Función principal para iniciar sesión con cualquier proveedor
 * @param providerKey - El proveedor a usar (GOOGLE, MICROSOFT, GITHUB)
 * @param options - Opciones adicionales (popup: true/false)
 */
export async function signInWith(
  providerKey: AuthProvider, 
  options?: { popup?: boolean }
): Promise<any> {
  const provider = providers[providerKey];
  
  if (!provider) {
    console.error(' Provider not found:', providerKey);
    throw new Error(`Provider not configured: ${providerKey}`);
  }
  
  console.log(`Starting signIn with ${providerKey}`, options);
  
  try {
    const result = await provider.signIn({ popup: options?.popup });
    console.log(` SignIn successful with ${providerKey}`, result);
    return result;
  } catch (error: any) {
    console.error(` SignIn failed with ${providerKey}:`, error);
    throw error;
  }
}

export default providers;