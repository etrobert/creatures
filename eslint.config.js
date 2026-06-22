import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      // Ban `as` type assertions by default. Each use must be justified with an
      // inline `eslint-disable-next-line` comment explaining why it is safe.
      // `as const` assertions are still allowed.
      "@typescript-eslint/consistent-type-assertions": [
        "error",
        { assertionStyle: "never" },
      ],
    },
  },
  {
    // `.claude/worktrees/` holds isolated git worktree checkouts (each a full
    // copy of the repo with its own tsconfig). Linting them makes
    // typescript-eslint see multiple candidate TSConfigRootDirs and fail to
    // parse every file, so keep them out of scope.
    ignores: ["**/node_modules/**", "**/dist/**", ".claude/**"],
  },
);
