// vite-env.d.ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly CD_API_URL: string;
  }
  
  interface ImportMeta {
	readonly env: ImportMetaEnv;
  }
  