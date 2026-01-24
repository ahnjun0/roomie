import {API_BASE_URL, API_TIMEOUT} from '../constants/api';

interface RequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: object;
  headers?: Record<string, string>;
}

class ApiService {
  private baseUrl: string;
  private accessToken: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  setAccessToken(token: string | null) {
    this.accessToken = token;
  }

  private async request<T>(
    endpoint: string,
    config: RequestConfig = {},
  ): Promise<T> {
    const {method = 'GET', body, headers = {}} = config;

    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers,
    };

    if (this.accessToken) {
      requestHeaders['Authorization'] = `Bearer ${this.accessToken}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method,
        headers: requestHeaders,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new ApiError(response.status, error.detail || 'Request failed');
      }

      return response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(0, 'Network error');
    }
  }

  get<T>(endpoint: string) {
    return this.request<T>(endpoint, {method: 'GET'});
  }

  post<T>(endpoint: string, body?: object) {
    return this.request<T>(endpoint, {method: 'POST', body});
  }

  put<T>(endpoint: string, body?: object) {
    return this.request<T>(endpoint, {method: 'PUT', body});
  }

  patch<T>(endpoint: string, body?: object) {
    return this.request<T>(endpoint, {method: 'PATCH', body});
  }

  delete<T>(endpoint: string) {
    return this.request<T>(endpoint, {method: 'DELETE'});
  }
}

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

export const api = new ApiService(API_BASE_URL);
