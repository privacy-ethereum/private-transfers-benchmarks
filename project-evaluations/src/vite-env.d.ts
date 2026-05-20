/// <reference types="vite/client" />

declare const __APP_VERSION__: string;

// Adds this project's VITE_* variables to Vite's `import.meta.env` typing.
interface ImportMetaEnv {
  readonly VITE_REPORT_PUBLISHED?: string;
}
