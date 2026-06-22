import { expect, test } from "vitest";
import { tickDuration } from "@creatures/shared/state";

// Smoke test for the vitest harness. Proves that vitest runs, TypeScript is
// transpiled, and cross-workspace `@creatures/shared` imports resolve. It
// deliberately does not pin any behavior — characterization tests live
// colocated with the code they cover.
test("vitest harness runs and resolves workspace packages", () => {
  expect(1 + 1).toBe(2);
  expect(typeof tickDuration).toBe("number");
});
