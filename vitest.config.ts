import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    // Anchor to the real source roots so vitest doesn't also crawl repo
    // copies that live under the working tree (git worktrees in
    // `.claude/worktrees/`, direnv's Nix-store snapshot in `.direnv/`, the
    // `result/` symlink from `nix build`). A leading `**/` would match those
    // copies too; anchored globs only match the top-level source dirs.
    include: ["apps/**/*.test.ts", "packages/**/*.test.ts"],
  },
});
