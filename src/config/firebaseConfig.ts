// src/config/firebaseConfig.ts
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  OAuthProvider,
  GoogleAuthProvider as FirebaseGoogleProvider,
  GithubAuthProvider as FirebaseGithubProvider 
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar Auth
export const auth = getAuth(app);

// 🔹 Microsoft Provider
export const microsoftProvider = new OAuthProvider('microsoft.com');
microsoftProvider.setCustomParameters({
  tenant: 'common',
  prompt: 'select_account',
});

// 🔹 Google Provider
export const googleProvider = new FirebaseGoogleProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});
googleProvider.addScope('profile');
googleProvider.addScope('email');

// 🔹 GitHub Provider  
export const githubProvider = new FirebaseGithubProvider();
githubProvider.addScope('read:user');
githubProvider.addScope('user:email');

export default app;