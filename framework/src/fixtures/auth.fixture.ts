import { Page } from "@playwright/test";

// Contract for all login providers
export interface AuthProvider {
  login(page: Page): Promise<void>;
}
