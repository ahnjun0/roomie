# Roomie API 문서

## 개요

Roomie 백엔드 API는 FastAPI로 구현되어 있으며, OpenAPI(Swagger) 문서를 자동 생성합니다.

- 개발 서버: `http://localhost:8000`
- API 문서: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## 인증

JWT Bearer 토큰 방식을 사용합니다.

```
Authorization: Bearer <access_token>
```

## API 엔드포인트

### 인증 (Auth)

| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/api/v1/auth/register` | 회원가입 |
| POST | `/api/v1/auth/login` | 로그인 |
| POST | `/api/v1/auth/verify-email` | 이메일 인증 |
| POST | `/api/v1/auth/refresh` | 토큰 갱신 |

### 사용자 (Users)

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/v1/users/me` | 현재 사용자 정보 |
| PUT | `/api/v1/users/me/profile` | 프로필 업데이트 |
| PUT | `/api/v1/users/me/lifestyle` | 생활 패턴 업데이트 |
| PUT | `/api/v1/users/me/preferences` | 희망 조건 업데이트 |
| PUT | `/api/v1/users/me/weights` | 가중치 설정 (5만원 게임) |
| GET | `/api/v1/users/{id}` | 특정 사용자 조회 |

### 매칭 (Matching)

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/v1/matching/recommendations` | 추천 목록 |
| POST | `/api/v1/matching/request/{id}` | 매칭 요청 |
| POST | `/api/v1/matching/accept/{id}` | 요청 수락 |
| POST | `/api/v1/matching/reject/{id}` | 요청 거절 |
| GET | `/api/v1/matching/history` | 매칭 히스토리 |

### 기숙사 (Dormitories)

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/v1/dormitories` | 기숙사 목록 |
| GET | `/api/v1/dormitories/{id}` | 기숙사 상세 |

## 데이터베이스 마이그레이션

```bash
cd apps/api

# 마이그레이션 생성
alembic revision --autogenerate -m "설명"

# 마이그레이션 적용
alembic upgrade head

# 롤백
alembic downgrade -1
```
