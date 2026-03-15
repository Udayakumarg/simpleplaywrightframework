import fs   from "fs";
import { Page } from "@playwright/test";

/**
 * Restores a saved auth session into the browser page.
 *
 * Supports two formats:
 *
 * 1. localStorage token format: { token, user }
 *    Injects token and user into localStorage via addInitScript
 *    so they are available before the page loads.
 *
 * 2. Playwright storageState (cookies/origins):
 *    Restores cookies via addCookies — for cookie-based apps.
 */
export async function restoreSession(
  page:        Page,
  storagePath: string
): Promise<void> {
  const raw   = fs.readFileSync(storagePath, "utf-8").trim();
  const state = JSON.parse(raw);

  // ── localStorage token format (Nexus and token-based apps) ───
  if (state.token) {
    await page.addInitScript((saved) => {
      localStorage.setItem("token", saved.token);
      if (saved.user) localStorage.setItem("user", JSON.stringify(saved.user));
    }, { token: state.token, user: state.user ?? null });
    return;
  }

  // ── Playwright cookie-based storageState ─────────────────────
  if (state.cookies?.length > 0) {
    await page.context().addCookies(state.cookies);
  }
}
