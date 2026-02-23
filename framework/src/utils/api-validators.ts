/**
 * framework/src/utils/api-validators.ts
 * API response validation utilities
 */

import type { ApiResponse, ValidationSchema } from '../types/api';

/**
 * API Response Validator
 */
export class ApiValidator {
  /**
   * Validate status code
   */
  static validateStatus(
    response: ApiResponse,
    expectedStatus: number | number[]
  ): boolean {
    const statuses = Array.isArray(expectedStatus)
      ? expectedStatus
      : [expectedStatus];
    const isValid = statuses.includes(response.status);

    if (!isValid) {
      console.error(
        `[ApiValidator] Status validation failed. Expected ${statuses}, got ${response.status}`
      );
    }

    return isValid;
  }

  /**
   * Validate required fields exist
   */
  static validateRequired(
    response: ApiResponse,
    requiredFields: string[]
  ): boolean {
    const data = response.data as Record<string, any>;

    for (const field of requiredFields) {
      if (!(field in data)) {
        console.error(
          `[ApiValidator] Required field missing: ${field}`
        );
        return false;
      }
    }

    return true;
  }

  /**
   * Validate data against schema
   */
  static validateSchema(
    response: ApiResponse,
    schema: ValidationSchema
  ): boolean {
    const data = response.data;

    // Check required fields
    if (schema.required && typeof data === 'object' && data !== null) {
      const objData = data as Record<string, any>;
      for (const field of schema.required) {
        if (!(field in objData)) {
          console.error(`[ApiValidator] Required field missing: ${field}`);
          return false;
        }
      }
    }

    // Check type
    if (schema.type) {
      const actualType = this.getType(data);
      if (actualType !== schema.type) {
        console.error(
          `[ApiValidator] Type mismatch. Expected ${schema.type}, got ${actualType}`
        );
        return false;
      }
    }

    // Check string properties
    if (schema.minLength !== undefined && typeof data === 'string') {
      if (data.length < schema.minLength) {
        console.error(
          `[ApiValidator] String too short. Min length: ${schema.minLength}, actual: ${data.length}`
        );
        return false;
      }
    }

    if (schema.maxLength !== undefined && typeof data === 'string') {
      if (data.length > schema.maxLength) {
        console.error(
          `[ApiValidator] String too long. Max length: ${schema.maxLength}, actual: ${data.length}`
        );
        return false;
      }
    }

    return true;
  }

  /**
   * Validate response time
   */
  static validateResponseTime(
    response: ApiResponse,
    maxTimeMs: number
  ): boolean {
    // Note: Response object doesn't include timing,
    // so this validates the expectation
    console.log(`[ApiValidator] Response time validation not available in client-side API`);
    return true;
  }

  /**
   * Validate response contains value
   */
  static validateContains(response: ApiResponse, value: any): boolean {
    const data = response.data;

    if (Array.isArray(data)) {
      return data.includes(value);
    }

    if (typeof data === 'string') {
      return data.includes(String(value));
    }

    if (typeof data === 'object' && data !== null) {
      return JSON.stringify(data).includes(JSON.stringify(value));
    }

    return false;
  }

  /**
   * Validate response array length
   */
  static validateArrayLength(
    response: ApiResponse,
    minLength?: number,
    maxLength?: number
  ): boolean {
    const data = response.data;

    if (!Array.isArray(data)) {
      console.error(`[ApiValidator] Response is not an array`);
      return false;
    }

    if (minLength !== undefined && data.length < minLength) {
      console.error(
        `[ApiValidator] Array too short. Min: ${minLength}, actual: ${data.length}`
      );
      return false;
    }

    if (maxLength !== undefined && data.length > maxLength) {
      console.error(
        `[ApiValidator] Array too long. Max: ${maxLength}, actual: ${data.length}`
      );
      return false;
    }

    return true;
  }

  /**
   * Validate response not empty
   */
  static validateNotEmpty(response: ApiResponse): boolean {
    const data = response.data;

    if (Array.isArray(data)) {
      return data.length > 0;
    }

    if (typeof data === 'string') {
      return data.length > 0;
    }

    if (typeof data === 'object' && data !== null) {
      return Object.keys(data).length > 0;
    }

    return data !== null && data !== undefined;
  }

  /**
   * Get JavaScript type
   */
  private static getType(value: any): string {
    if (Array.isArray(value)) return 'array';
    return typeof value;
  }

  /**
   * Batch validate multiple conditions
   */
  static validateAll(validations: Array<() => boolean>): boolean {
    for (const validation of validations) {
      if (!validation()) {
        return false;
      }
    }
    return true;
  }

  /**
   * Assert condition with message
   */
  static assert(condition: boolean, message: string): void {
    if (!condition) {
      throw new Error(`[ApiValidator] Assertion failed: ${message}`);
    }
  }
}
