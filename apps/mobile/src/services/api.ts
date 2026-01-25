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
        let message = error.detail || 'Request failed';

        if (Array.isArray(message)) {
          message = message
            .map((item: any) => (item.msg ? item.msg : JSON.stringify(item)))
            .join('\n');
        } else if (typeof message === 'object') {
          message = JSON.stringify(message);
        }

        throw new ApiError(response.status, message);
      }

      return response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof ApiError) {
        throw error;
      }
      // 상세 오류 로깅 (개발 환경)
      if (__DEV__) {
        console.error('API Error:', error);
        console.error('URL:', `${this.baseUrl}${endpoint}`);
      }
      // AbortError는 타임아웃
      if (error instanceof Error && error.name === 'AbortError') {
        throw new ApiError(0, '요청 시간이 초과되었습니다.');
      }
      throw new ApiError(0, '네트워크 오류가 발생했습니다. 서버 연결을 확인해주세요.');
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
