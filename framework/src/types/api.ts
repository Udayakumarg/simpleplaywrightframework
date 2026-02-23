/**
 * framework/src/types/api.ts
 * Type definitions and contracts for API automation layer
 */

/**
 * HTTP methods supported
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

/**
 * API Request configuration
 */
export interface ApiRequest {
  method: HttpMethod;
  endpoint: string;
  body?: Record<string, any>;
  headers?: Record<string, string>;
  query?: Record<string, string | number | boolean>;
  timeout?: number;
  retries?: number;
}

/**
 * API Response structure
 */
export interface ApiResponse<T = any> {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: T;
  raw: Response;
}

/**
 * API Error with context
 */
export class ApiError extends Error {
  status: number = 0;
  endpoint: string = '';
  method: HttpMethod = 'GET';
  requestBody?: Record<string, any>;
  responseData?: any;
  originalError?: Error;

  constructor(message: string) {
    super(message);
    this.name = 'ApiError';
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

/**
 * Retry configuration
 */
export interface RetryConfig {
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
  retryableStatusCodes: number[];
}

/**
 * API Client configuration
 */
export interface ApiClientConfig {
  baseUrl: string;
  headers?: Record<string, string>;
  timeout?: number;
  retryConfig?: Partial<RetryConfig>;
  interceptors?: {
    request?: (config: ApiRequest) => ApiRequest;
    response?: <T>(response: ApiResponse<T>) => ApiResponse<T>;
  };
}

/**
 * Authentication token structure
 */
export interface AuthToken {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
  type?: string;
}

/**
 * Response validation schema
 */
export interface ValidationSchema {
  required?: string[];
  type?: 'object' | 'array' | 'string' | 'number' | 'boolean';
  properties?: Record<string, any>;
  minLength?: number;
  maxLength?: number;
}
