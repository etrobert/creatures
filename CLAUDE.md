# CLAUDE.md

## Seeing / testing the client

The client renders the entire game into a single `<canvas>`, so there is no DOM
or accessibility tree to inspect — the only way to observe it is pixels, and the
only way to drive it is coordinate-based input.

The Nix dev shell provides the **Playwright CLI** (`playwright-test`) for this,
wired to the NixOS-compatible browsers from `playwright-driver.browsers`. Use it
to snapshot or drive the running client:

```bash
npm run dev   # client :5173, server :3000
playwright screenshot --browser chromium --wait-for-timeout 3000 \
  --viewport-size 960,720 http://localhost:5173 game.png
playwright codegen http://localhost:5173   # record interactions
```

This is the **CLI only**, not an importable library — `import { chromium } from
"playwright"` will not resolve, since the package is not in `node_modules`. If
scripted tests are ever needed, add `@playwright/test` as a dev dependency and
point it at the same Nix browsers (`PLAYWRIGHT_BROWSERS_PATH`, already set in the
dev shell).
