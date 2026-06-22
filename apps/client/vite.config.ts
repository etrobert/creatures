import { defineConfig } from "vite";

// Backend port the dev server proxies the WebSocket to. SERVER_PORT is shared
// with the server via the root `dev` script, so the two can't drift.
const backendPort = process.env.SERVER_PORT ?? "3000";

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
