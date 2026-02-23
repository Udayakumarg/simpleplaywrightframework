/**
 * framework/src/utils/api-client.ts
 * Generic HTTP client with retry, logging, and error handling
 */

import type {
  HttpMethod,
  ApiRequest,
  ApiResponse,
  RetryConfig,
  ApiClientConfig,
} from '../types/api';
import { ApiError } from '../types/api';

/**
 * Generic API Client for HTTP requests
 * Supports retry logic, logging, error handling
 */
export class ApiClient {
  private baseUrl: string;
  private headers: Record<string, string>;
  private timeout: number;
  private retryConfig: RetryConfig;
  private interceptors?: ApiClientConfig['interceptors'];

  constructor(config: ApiClientConfig) {
    this.baseUrl = config.baseUrl;
    this.headers = config.headers || {};
    this.timeout = config.timeout || 30000;
    this.retryConfig = {
      maxRetries: 3,
      initialDelayMs: 100,
      maxDelayMs: 10000,
      backoffMultiplier: 2,
      retryableStatusCodes: [408, 429, 500, 502, 503, 504],
      ...config.retryConfig,
    };
    this.interceptors = config.interceptors;
  }

  /**
   * Make HTTP request with retry logic
   */
  async request<T = any>(
    method: HttpMethod,
    endpoint: string,
    body?: Record<string, any>,
    customHeaders?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    let lastError: ApiError | null = null;

    for (let attempt = 0; attempt <= this.retryConfig.maxRetries; attempt++) {
      try {
        const response = await this.makeRequest<T>(
          method,
          endpoint,
          body,
          customHeaders,
          attempt
        );
        return response;
      } catch (error) {
        lastError = error as ApiError;

        // Check if error is retryable
        if (
          attempt < this.retryConfig.maxRetries &&
          this.isRetryableError(lastError)
        ) {
          const delay = this.calculateBackoff(attempt);
          console.log(
            `[ApiClient] Retry ${attempt + 1}/${this.retryConfig.maxRetries} for ${method} ${endpoint} after ${delay}ms`
          );
          await this.delay(delay);
          continue;
        }

        // Don't retry, throw error
        throw error;
      }
    }

    throw lastError || new Error('Failed to complete request');
  }

  /**
   * Make single HTTP request
   */
  private async makeRequest<T = any>(
    method: HttpMethod,
    endpoint: string,
    body?: Record<string, any>,
    customHeaders?: Record<string, string>,
    attempt: number = 0
  ): Promise<ApiResponse<T>> {
    const url = this.buildUrl(endpoint);
    const headers = {
      ...this.headers,
      ...customHeaders,
    };

    let config: ApiRequest = {
      method,
      endpoint,
      body,
      headers,
      timeout: this.timeout,
    };

    // Apply request interceptor
    if (this.interceptors?.request) {
      config = this.interceptors.request(config);
    }

    console.log(
      `[ApiClient] ${method} ${url}${attempt > 0 ? ` (attempt ${attempt + 1})` : ''}`
    );
    if (config.body) {
      console.log(`[ApiClient] Request body:`, JSON.stringify(config.body));
    }

    try {
      const fetchOptions: RequestInit = {
        method: config.method,
        headers: config.headers,
        signal: AbortSignal.timeout(config.timeout || this.timeout),
      };

      if (config.body) {
        fetchOptions.body = JSON.stringify(config.body);
      }

      const response = await fetch(url, fetchOptions);
      const contentType = response.headers.get('content-type');
      let data: T;

      if (contentType && contentType.includes('application/json')) {
        data = (await response.json()) as T;
      } else {
        data = (await response.text()) as unknown as T;
      }

      console.log(
        `[ApiClient] Response status: ${response.status} ${response.statusText}`
      );

      const apiResponse: ApiResponse<T> = {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        data,
        raw: response,
      };

      // Check status
      if (!response.ok) {
        throw this.createApiError(
          method,
          endpoint,
          response.status,
          config.body,
          data
        );
      }

      // Apply response interceptor
      if (this.interceptors?.response) {
        return this.interceptors.response(apiResponse);
      }

      return apiResponse;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      throw this.createApiError(
        method,
        endpoint,
        0,
        config.body,
        undefined,
        error as Error
      );
    }
  }

  /**
   * GET request
   */
  async get<T = any>(
    endpoint: string,
    customHeaders?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    return this.request<T>('GET', endpoint, undefined, customHeaders);
  }

  /**
   * POST request
   */
  async post<T = any>(
    endpoint: string,
    body?: Record<string, any>,
    customHeaders?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    return this.request<T>('POST', endpoint, body, customHeaders);
  }

  /**
   * PUT request
   */
  async put<T = any>(
    endpoint: string,
    body?: Record<string, any>,
    customHeaders?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', endpoint, body, customHeaders);
  }

  /**
   * PATCH request
   */
  async patch<T = any>(
    endpoint: string,
    body?: Record<string, any>,
    customHeaders?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    return this.request<T>('PATCH', endpoint, body, customHeaders);
  }

  /**
   * DELETE request
   */
  async delete<T = any>(
    endpoint: string,
    customHeaders?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', endpoint, undefined, customHeaders);
  }

  /**
   * Check if error is retryable
   */
  private isRetryableError(error: ApiError): boolean {
    return this.retryConfig.retryableStatusCodes.includes(error.status);
  }

  /**
   * Calculate exponential backoff delay
   */
  private calculateBackoff(attempt: number): number {
    const delay =
      this.retryConfig.initialDelayMs *
      Math.pow(this.retryConfig.backoffMultiplier, attempt);
    return Math.min(delay, this.retryConfig.maxDelayMs);
  }

  /**
   * Delay execution
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Build full URL
   */
  private buildUrl(endpoint: string): string {
    if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
      return endpoint; // Absolute URL
    }
    return `${this.baseUrl}${endpoint}`;
  }

  /**
   * Create API error
   */
  private createApiError(
    method: HttpMethod,
    endpoint: string,
    status: number,
    requestBody?: Record<string, any>,
    responseData?: any,
    originalError?: Error
  ): ApiError {
    const error = new ApiError(
      `API request failed: ${method} ${endpoint} (${status})`
    );

    error.status = status;
    error.endpoint = endpoint;
    error.method = method;
    error.requestBody = requestBody;
    error.responseData = responseData;
    error.originalError = originalError;

    return error;
  }

  /**
   * Update headers
   */
  setHeaders(headers: Record<string, string>): void {
    this.headers = { ...this.headers, ...headers };
  }

  /**
   * Remove header
   */
  removeHeader(key: string): void {
    delete this.headers[key];
  }

  /**
   * Get current headers
   */
  getHeaders(): Record<string, string> {
    return { ...this.headers };
  }
}
