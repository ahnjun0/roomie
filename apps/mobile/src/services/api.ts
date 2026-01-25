import {API_BASE_URL, API_TIMEOUT} from '../constants/api';

interface RequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: object;
  headers?: Record<string, string>;
}

// [개발용] 백엔드 연결 없이 UI 테스트를 위한 Mock 모드
// true로 설정하면 모든 API 요청에 대해 가짜 데이터를 반환합니다.
const USE_MOCK_API = true;

class ApiService {
  private baseUrl: string;
  private accessToken: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  setAccessToken(token: string | null) {
    this.accessToken = token;
  }

  // Mock 데이터 처리 로직
  private async mockRequest<T>(endpoint: string, config: RequestConfig): Promise<T> {
    console.log(`[MOCK API] ${config.method || 'GET'} ${endpoint}`, config.body ? JSON.stringify(config.body) : '');
    
    // 네트워크 딜레이 시뮬레이션 (0.5초)
    await new Promise(resolve => setTimeout(resolve, 500));

    // 1. Auth & Registration
    if (endpoint.includes('/auth/send-code')) {
      return { message: '인증번호가 발송되었습니다.', expiresIn: 300 } as any;
    }
    if (endpoint.includes('/auth/verify-code')) {
      return { verified: true, tempToken: 'mock-temp-token-12345' } as any;
    }
    if (endpoint.includes('/auth/register') || endpoint.includes('/auth/login')) {
      return {
        id: 1,
        email: (config.body as any)?.email || 'test@univ.ac.kr',
        nickname: 'RoomieUser',
        accessToken: 'mock_access_token_' + Date.now(),
        refreshToken: 'mock_refresh_token_' + Date.now(),
        isProfileComplete: false,
        isEmailVerified: true,
      } as any;
    }

    // 2. User Profile (Me)
    if (endpoint === '/users/me' && (!config.method || config.method === 'GET')) {
      return {
        id: 1,
        email: 'test@univ.ac.kr',
        name: 'RoomieUser',
        nickname: 'RoomieUser',
        gender: 'MALE',
        nationality: 'KOREAN',
        studentId: 24,
        birthYear: 2000,
        persona: null,
        isEmailVerified: true,
        isProfileComplete: false, // 온보딩 테스트를 위해 미완성 상태로 설정 (완료 상태 테스트 시 true로 변경)
      } as any;
    }

    // 3. User Updates (Basic Info, Lifestyle, Preferences)
    if (
        (config.method === 'PATCH' || config.method === 'PUT') &&
        (endpoint.includes('/users/me') || endpoint.includes('/lifestyle') || endpoint.includes('/preference'))
    ) {
        return { ...config.body, id: 1, userId: 1 } as any;
    }

    // 4. Dormitories
    if (endpoint.includes('/dormitories')) {
      return [
        { id: 1, name: '성실관', gender: 'MALE' },
        { id: 2, name: '봉사관', gender: 'MALE' },
        { id: 3, name: '진리관', gender: 'FEMALE' },
        { id: 4, name: '화원관', gender: 'FEMALE' },
      ] as any;
    }
    
    // 5. Matching Recommendations
    if (endpoint.includes('/matching')) {
        return [
            {
                id: 2,
                user: {
                    id: 2,
                    nickname: "룸메찾아요",
                    gender: "MALE",
                    studentId: 23,
                    nationality: "KOREAN",
                    age: 21,
                },
                matchScore: 95,
                tags: ["조용함", "일찍잠"],
            },
            {
                id: 3,
                user: {
                    id: 3,
                    nickname: "깔끔이",
                    gender: "MALE",
                    studentId: 20,
                    nationality: "KOREAN",
                    age: 24,
                },
                matchScore: 88,
                tags: ["청소매일", "비흡연"],
            }
        ] as any;
    }

    // Default: 빈 객체 반환 (에러 방지)
    console.warn(`[MOCK API] Unhandled endpoint: ${endpoint} - returning empty object.`);
    return {} as any;
  }

  private async request<T>(
    endpoint: string,
    config: RequestConfig = {},
  ): Promise<T> {
    // Mock 모드가 활성화되어 있으면 실제 요청 대신 가짜 응답 반환
    if (USE_MOCK_API) {
      return this.mockRequest<T>(endpoint, config);
    }

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