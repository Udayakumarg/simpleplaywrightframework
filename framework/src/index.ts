// framework/src/index.ts
export { test } from "./fixtures/index";   // ✅ use the extended test
export { expect } from "@playwright/test";
export * from "./loaders/scenario.loader";
