/**
 * framework/src/utils/api-auth-storage.ts
 * Token and session storage for API authentication
 */

import fs from 'fs';
import path from 'path';
import type { AuthToken } from '../types/api';

/**
 * API Authentication Token Storage
 * Handles token persistence and refresh
 */
export class ApiAuthStorage {
  private storagePath: string;
  private tokens: Map<string, AuthToken> = new Map();
  private refreshCallbacks: Map<string, () => Promise<AuthToken>> = new Map();

  constructor(baseStoragePath: string = './storage') {
    this.storagePath = path.join(baseStoragePath, 'api-tokens');
    this.ensureStoragePath();
  }

  /**
   * Store token for API
   */
  async setToken(apiName: string, token: AuthToken): Promise<void> {
    console.log(`[ApiAuthStorage] Storing token for ${apiName}`);

    // Store in memory
    this.tokens.set(apiName, token);

    // Persist to disk
    await this.persistTokens();
  }

  /**
   * Get token for API
   */
  async getToken(apiName: string): Promise<AuthToken | null> {
    // Try loading from disk first
    const diskTokens = await this.loadTokens();
    if (diskTokens[apiName]) {
      const token = diskTokens[apiName];

      // Check if token is expired
      if (this.isTokenExpired(token)) {
        console.log(
          `[ApiAuthStorage] Token for ${apiName} is expired, attempting refresh`
        );
        return await this.refreshToken(apiName);
      }

      console.log(`[ApiAuthStorage] Using cached token for ${apiName}`);
      return token;
    }

    return null;
  }

  /**
   * Clear token for API
   */
  async clearToken(apiName: string): Promise<void> {
    console.log(`[ApiAuthStorage] Clearing token for ${apiName}`);
    this.tokens.delete(apiName);
    await this.persistTokens();
  }

  /**
   * Clear all tokens
   */
  async clearAll(): Promise<void> {
    console.log(`[ApiAuthStorage] Clearing all tokens`);
    this.tokens.clear();
    await this.persistTokens();
  }

  /**
   * Register token refresh callback
   */
  registerRefreshCallback(
    apiName: string,
    callback: () => Promise<AuthToken>
  ): void {
    console.log(
      `[ApiAuthStorage] Registered refresh callback for ${apiName}`
    );
    this.refreshCallbacks.set(apiName, callback);
  }

  /**
   * Refresh token using registered callback
   */
  private async refreshToken(apiName: string): Promise<AuthToken | null> {
    const callback = this.refreshCallbacks.get(apiName);
    if (!callback) {
      console.warn(
        `[ApiAuthStorage] No refresh callback registered for ${apiName}`
      );
      return null;
    }

    try {
      console.log(`[ApiAuthStorage] Refreshing token for ${apiName}`);
      const newToken = await callback();
      await this.setToken(apiName, newToken);
      return newToken;
    } catch (error) {
      console.error(
        `[ApiAuthStorage] Failed to refresh token for ${apiName}:`,
        error
      );
      return null;
    }
  }

  /**
   * Check if token is expired
   */
  private isTokenExpired(token: AuthToken): boolean {
    if (!token.expiresAt) {
      return false; // No expiration
    }

    const now = Date.now() / 1000; // Current time in seconds
    const expirationBuffer = 5 * 60; // 5 minute buffer

    return token.expiresAt - expirationBuffer < now;
  }

  /**
   * Persist tokens to disk
   */
  private async persistTokens(): Promise<void> {
    const tokensObject: Record<string, AuthToken> = {};
    this.tokens.forEach((token, apiName) => {
      tokensObject[apiName] = token;
    });

    const filePath = path.join(this.storagePath, 'tokens.json');
    fs.writeFileSync(filePath, JSON.stringify(tokensObject, null, 2));
  }

  /**
   * Load tokens from disk
   */
  private async loadTokens(): Promise<Record<string, AuthToken>> {
    const filePath = path.join(this.storagePath, 'tokens.json');

    if (!fs.existsSync(filePath)) {
      return {};
    }

    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      console.warn(`[ApiAuthStorage] Failed to load tokens from disk:`, error);
      return {};
    }
  }

  /**
   * Ensure storage path exists
   */
  private ensureStoragePath(): void {
    if (!fs.existsSync(this.storagePath)) {
      fs.mkdirSync(this.storagePath, { recursive: true });
      console.log(`[ApiAuthStorage] Created storage path: ${this.storagePath}`);
    }
  }

  /**
   * Get storage path
   */
  getStoragePath(): string {
    return this.storagePath;
  }
}
