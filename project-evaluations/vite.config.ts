import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

const now = new Date();
const buildVersion = `v${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, "0")}`;

export default defineConfig({
  base: "/",
  plugins: [react(), tailwindcss()],
  define: {
    __APP_VERSION__: JSON.stringify(buildVersion),
  },
  build: {
    target: "es2022",
  },
});
