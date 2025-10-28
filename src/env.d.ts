/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_MICROSOFT_CLIENT_ID: string
  readonly VITE_MICROSOFT_REDIRECT_URI: string
  // ... otras variables de entorno
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}