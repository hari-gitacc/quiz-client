/// <reference types="vite/client" />
// frontend/src/vite-env.d.ts

interface ImportMetaEnv {
    readonly VITE_API_URL: string
    readonly VITE_WS_URL: string
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv
  }