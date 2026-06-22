import { defineConfig } from "vite";

// Backend port the dev server proxies the WebSocket to. Shared with the
// server's own PORT via the root `dev` script, so the two can't drift.
const backendPort = process.env.PORT ?? "3000";

export default defineConfig({
  server: {
    proxy: {
      "/ws": {
        target: `ws://localhost:${backendPort}`,
        ws: true,
      },
    },
  },
});
