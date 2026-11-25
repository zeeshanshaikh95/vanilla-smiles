/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_PUBLIC_SITE_URL?: string;
  readonly VITE_DEMO_CATALOGUE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
