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
    ignores: ["**/node_modules/**", "**/dist/**"],
  },
);
