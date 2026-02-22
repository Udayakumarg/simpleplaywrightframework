import { Page } from "@playwright/test";
import { AuthProvider } from "../types/auth";

// Example provider implementation
export const basicAuthProvider: AuthProvider = {
  async login(page: Page) {
    // login steps...
  }
};
