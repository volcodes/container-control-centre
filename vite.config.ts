import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vuetify from "vite-plugin-vuetify";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vuetify({
      autoImport: true, // Automatically import Vuetify components
    }),
  ],
  define: {
    // For Vuetify 3 compatibility
    global: "globalThis",
  },
  server: {
    port: 5173,
    open: true,
  },
});
