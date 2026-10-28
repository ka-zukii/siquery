import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      "pa7l3e-ip-182-9-2-55.tunnelmole.net",
      "localhost",
      "127.0.0.1",
    ],
  },
});
