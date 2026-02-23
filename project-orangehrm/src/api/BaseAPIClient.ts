/**
 * Base API Client
 * Provides common functionality for all API clients
 */
export abstract class BaseAPIClient {
  protected baseUrl: string;
  protected headers: Record<string, string>;

  constructor(baseUrl: string, headers: Record<string, string> = {}) {
    this.baseUrl = baseUrl;
    this.headers = {
      "Content-Type": "application/json",
      ...headers,
    };
  }

  /**
   * Make GET request
   */
  protected async get<T>(endpoint: string, params?: Record<string, string | number>): Promise<T> {
    let url = `${this.baseUrl}${endpoint}`;
    if (params) {
      const queryString = new URLSearchParams(
        Object.entries(params).map(([k, v]) => [k, String(v)])
      ).toString();
      url += `?${queryString}`;
    }

    console.log(`[API] GET ${url}`);
    const response = await fetch(url, {
      method: "GET",
      headers: this.headers,
    });

    if (!response.ok) {
      throw new Error(`[API] GET ${url} failed with status ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Make POST request
   */
  protected async post<T>(endpoint: string, body?: any): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    console.log(`[API] POST ${url}`, body ? JSON.stringify(body) : "");

    const response = await fetch(url, {
      method: "POST",
      headers: this.headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      throw new Error(`[API] POST ${url} failed with status ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Make PUT request
   */
  protected async put<T>(endpoint: string, body?: any): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    console.log(`[API] PUT ${url}`, body ? JSON.stringify(body) : "");

    const response = await fetch(url, {
      method: "PUT",
      headers: this.headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      throw new Error(`[API] PUT ${url} failed with status ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Make DELETE request
   */
  protected async delete<T>(endpoint: string): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    console.log(`[API] DELETE ${url}`);

    const response = await fetch(url, {
      method: "DELETE",
      headers: this.headers,
    });

    if (!response.ok) {
      throw new Error(`[API] DELETE ${url} failed with status ${response.status}`);
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return await response.json();
    }

    return {} as T;
  }

  /**
   * Make PATCH request
   */
  protected async patch<T>(endpoint: string, body?: any): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    console.log(`[API] PATCH ${url}`, body ? JSON.stringify(body) : "");

    const response = await fetch(url, {
      method: "PATCH",
      headers: this.headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      throw new Error(`[API] PATCH ${url} failed with status ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Get response status without throwing
   */
  protected async getStatus(endpoint: string): Promise<number> {
    const url = `${this.baseUrl}${endpoint}`;
    console.log(`[API] Checking status of ${url}`);

    const response = await fetch(url, {
      method: "GET",
      headers: this.headers,
    });

    return response.status;
  }
}
