/**
 * framework/src/fixtures/api.fixture.ts
 * API testing utilities fixtures
 */

import path from 'path';
import type { EnvConfig } from '../types/env';
import { ApiClient } from '../utils/api-client';
import { ApiAuthStorage } from '../utils/api-auth-storage';
import { ApiValidator } from '../utils/api-validators';
import type { ApiResponse, AuthToken } from '../types/api';

export const apiFixture = {
  /**
   * ApiClient fixture - generic HTTP client with retry and error handling
   */
  apiClient: async (
    { envConfig }: { envConfig: EnvConfig },
    use: (client: ApiClient) => Promise<void>,
  ) => {
    // Get API base URL from config
    const baseUrl = envConfig.apiUrl || envConfig.baseUrl;

    if (!baseUrl) {
      throw new Error(
        '[Framework] No apiUrl or baseUrl found in environment config for API tests'
      );
    }

    const client = new ApiClient({
      baseUrl,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000,
      retryConfig: {
        maxRetries: 3,
        initialDelayMs: 100,
        maxDelayMs: 10000,
        backoffMultiplier: 2,
        retryableStatusCodes: [408, 429, 500, 502, 503, 504],
      },
    });

    console.log(`[Framework] Initialized ApiClient with baseUrl: ${baseUrl}`);

    await use(client);
  },

  /**
   * ApiAuthStorage fixture - token persistence and refresh management
   */
  apiAuth: async (
    { envConfig }: { envConfig: EnvConfig },
    use: (storage: ApiAuthStorage) => Promise<void>,
  ) => {
    const storagePath = path.join(process.cwd(), '.storage', 'api-tokens');
    const storage = new ApiAuthStorage(storagePath);

    console.log(`[Framework] Initialized ApiAuthStorage at: ${storagePath}`);

    await use(storage);

    // Cleanup: Clear all tokens on test completion if needed
    // Optional: persist tokens for next test run
  },

  /**
   * ApiValidator fixture - response validation utilities
   */
  apiValidator: async ({}, use: (validator: typeof ApiValidator) => Promise<void>) => {
    console.log('[Framework] Initialized ApiValidator');
    await use(ApiValidator);
  },
};
