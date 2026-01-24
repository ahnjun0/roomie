# ROOMIE API Documentation

## Base URL

```
http://localhost:8000/api/v1
```

---

## 1. 인증 (Authentication)

### 1.1 인증번호 발송

학교 이메일로 인증번호를 발송합니다.

```
POST /auth/send-code
```

**Request Body**

```json
{
  "email": "student@univ.ac.kr"
}
```

**Response (200 OK)**

```json
{
  "message": "인증번호가 발송되었습니다.",
  "expiresIn": 300
}
```

**Error Response (400 Bad Request)**

```json
{
  "error": "INVALID_EMAIL_DOMAIN",
  "message": "학교 이메일(@univ.ac.kr)만 사용 가능합니다."
}
```

---

### 1.2 인증번호 확인

```
POST /auth/verify-code
```

**Request Body**

```json
{
  "email": "student@univ.ac.kr",
  "code": "123456"
}
```

**Response (200 OK)**

```json
{
  "verified": true,
  "tempToken": "temp_abc123..."
}
```

---

### 1.3 회원가입

이메일 인증 후 회원가입을 완료합니다.

```
POST /auth/register
```

**Request Body**

```json
{
  "tempToken": "temp_abc123...",
  "email": "student@univ.ac.kr",
  "password": "password123",
  "nickname": "룸메찾는학생",
  "gender": "MALE",
  "nationality": "KOREAN",
  "age": 22,
  "studentId": 24
}
```

**Response (201 Created)**

```json
{
  "id": 1,
  "email": "student@univ.ac.kr",
  "nickname": "룸메찾는학생",
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

---

### 1.4 로그인

```
POST /auth/login
```

**Request Body**

```json
{
  "email": "student@univ.ac.kr",
  "password": "password123"
}
```

**Response (200 OK)**

```json
{
  "id": 1,
  "email": "student@univ.ac.kr",
  "nickname": "룸메찾는학생",
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

---

### 1.5 토큰 갱신

```
POST /auth/refresh
```

**Request Body**

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response (200 OK)**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

---

## 2. 사용자 프로필 (User Profile)

> 모든 요청에 `Authorization: Bearer {accessToken}` 헤더 필요

### 2.1 내 프로필 조회

```
GET /users/me
```

**Response (200 OK)**

```json
{
  "id": 1,
  "email": "student@univ.ac.kr",
  "nickname": "룸메찾는학생",
  "gender": "MALE",
  "nationality": "KOREAN",
  "age": 22,
  "studentId": 24,
  "lifestyle": { ... },
  "preference": { ... },
  "createdAt": "2024-01-15T10:30:00Z"
}
```

---

### 2.2 프로필 수정

```
PATCH /users/me
```

**Request Body**

```json
{
  "nickname": "새로운닉네임",
  "age": 23
}
```

**Response (200 OK)**

```json
{
  "id": 1,
  "nickname": "새로운닉네임",
  "age": 23,
  ...
}
```

---

## 3. 생활 패턴 (Lifestyle)

### 3.1 생활 패턴 등록/수정

기숙사 선택, 흡연 여부, 수면 습관 등을 저장합니다. (Screen 3, 4, 5)

```
PUT /users/me/lifestyle
```

**Request Body**

```json
{
  "dormName": "성실관",
  "isSmoker": false,
  "sleepStart": 24,
  "sleepEnd": 8,
  "sensitivity": 3,
  "sleepHabits": "SNORING,GRINDING",
  "cleaningHabit": "WEEKLY"
}
```

| 필드 | 타입 | 설명 |
|------|------|------|
| `dormName` | string | 기숙사 이름 (성실관, 진리관, 봉사관 등) |
| `isSmoker` | boolean | 흡연 여부 |
| `sleepStart` | int | 취침 시간 (0-30, 24=자정, 26=새벽2시) |
| `sleepEnd` | int | 기상 시간 |
| `sensitivity` | int | 잠귀 민감도 (1: 둔함 ~ 5: 예민) |
| `sleepHabits` | string | 잠버릇 태그 (콤마 구분: SNORING, GRINDING, TALKING, TOSSING, NONE) |
| `cleaningHabit` | string | 청소 습관 (DAILY, WEEKLY, WHEN_DIRTY, NEVER) |

**Response (200 OK)**

```json
{
  "id": 1,
  "userId": 1,
  "dormName": "성실관",
  "isSmoker": false,
  "sleepStart": 24,
  "sleepEnd": 8,
  "sensitivity": 3,
  "sleepHabits": "SNORING,GRINDING",
  "cleaningHabit": "WEEKLY"
}
```

---

### 3.2 생활 패턴 조회

```
GET /users/me/lifestyle
```

**Response (200 OK)**

```json
{
  "id": 1,
  "userId": 1,
  "dormName": "성실관",
  "isSmoker": false,
  "sleepStart": 24,
  "sleepEnd": 8,
  "sensitivity": 3,
  "sleepHabits": "SNORING,GRINDING",
  "cleaningHabit": "WEEKLY"
}
```

---

## 4. 선호 조건 & 가중치 (Preference)

### 4.1 선호 조건 등록/수정

룸메이트 선호 조건과 5만원 게임 가중치를 저장합니다. (Screen 6, 7, 8)

```
PUT /users/me/preference
```

**Request Body**

```json
{
  "prefNationality": "KOREAN",
  "prefStudentId": "SAME",
  "weightCleanliness": 2.0,
  "weightNoise": 1.5,
  "weightSmoking": 3.0,
  "weightSleep": 1.0
}
```

| 필드 | 타입 | 설명 |
|------|------|------|
| `prefNationality` | string? | 선호 국적 (KOREAN, FOREIGNER, null=무관) |
| `prefStudentId` | string? | 학번 선호 (SAME, SENIOR, JUNIOR, ANY) |
| `weightCleanliness` | float | 청결도 가중치 (0.0 ~ 3.0) |
| `weightNoise` | float | 소음 가중치 (0.0 ~ 3.0) |
| `weightSmoking` | float | 흡연 가중치 (0.0 ~ 3.0) |
| `weightSleep` | float | 수면 패턴 가중치 (0.0 ~ 3.0) |

**5만원 게임 가중치 계산:**
- 총 50,000원 → 가중치 합계 5.0으로 환산
- 10,000원 = 1.0 가중치
- 예: 흡연에 30,000원 → `weightSmoking: 3.0`

**Response (200 OK)**

```json
{
  "id": 1,
  "userId": 1,
  "prefNationality": "KOREAN",
  "prefStudentId": "SAME",
  "weightCleanliness": 2.0,
  "weightNoise": 1.5,
  "weightSmoking": 3.0,
  "weightSleep": 1.0
}
```

---

### 4.2 선호 조건 조회

```
GET /users/me/preference
```

---

## 5. 매칭 (Matching)

### 5.1 매칭 리스트 조회

필터 조건에 맞는 룸메이트 후보 목록을 반환합니다. (Screen 9)

```
GET /matching
```

**Query Parameters**

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| `dormName` | string | O | 기숙사 필터 |
| `page` | int | X | 페이지 번호 (기본값: 1) |
| `limit` | int | X | 페이지당 결과 수 (기본값: 20) |
| `sortBy` | string | X | 정렬 기준 (matchRate, createdAt) |

**Request Example**

```
GET /matching?dormName=성실관&page=1&limit=20&sortBy=matchRate
```

**Response (200 OK)**

```json
{
  "total": 45,
  "page": 1,
  "limit": 20,
  "data": [
    {
      "id": 2,
      "nickname": "조용한룸메",
      "studentId": 24,
      "nationality": "KOREAN",
      "matchRate": 98,
      "keywords": ["비흡연", "12시취침", "주1회청소"],
      "isSmoker": false,
      "sleepStart": 24
    },
    {
      "id": 3,
      "nickname": "아침형인간",
      "studentId": 23,
      "nationality": "KOREAN",
      "matchRate": 87,
      "keywords": ["비흡연", "11시취침", "매일청소"],
      "isSmoker": false,
      "sleepStart": 23
    }
  ]
}
```

**매칭률(matchRate) 계산 로직:**
```
matchRate = (기본 일치도) × (5만원 게임 가중치)

기본 일치도 항목:
- 흡연 여부 일치
- 수면 시간대 유사도
- 청소 습관 일치
- 잠귀 민감도 유사도
- 국적/학번 선호 충족 여부
```

---

### 5.2 매칭 상세 조회

특정 사용자와의 매칭 상세 정보를 조회합니다. (Screen 10)

```
GET /matching/:userId
```

**Response (200 OK)**

```json
{
  "user": {
    "id": 2,
    "nickname": "조용한룸메",
    "gender": "MALE",
    "nationality": "KOREAN",
    "studentId": 24,
    "age": 22
  },
  "lifestyle": {
    "dormName": "성실관",
    "isSmoker": false,
    "sleepStart": 24,
    "sleepEnd": 8,
    "sensitivity": 2,
    "sleepHabits": "NONE",
    "cleaningHabit": "WEEKLY"
  },
  "matchRate": 98,
  "comparison": {
    "smoking": { "me": false, "target": false, "match": true },
    "sleepTime": { "me": 24, "target": 24, "match": true },
    "sensitivity": { "me": 3, "target": 2, "match": false },
    "cleaning": { "me": "WEEKLY", "target": "WEEKLY", "match": true }
  },
  "radarChart": {
    "me": {
      "cleanliness": 4,
      "noise": 3,
      "sleep": 4,
      "smoking": 5,
      "temperature": 3
    },
    "target": {
      "cleanliness": 4,
      "noise": 4,
      "sleep": 5,
      "smoking": 5,
      "temperature": 3
    }
  },
  "reviews": [
    {
      "id": 1,
      "content": "청소 약속을 정말 잘 지켜요!",
      "score": 5,
      "createdAt": "2024-01-10T15:30:00Z"
    },
    {
      "id": 2,
      "content": "알람을 잘 못 들어요.",
      "score": 2,
      "createdAt": "2024-01-05T09:00:00Z"
    }
  ],
  "averageReviewScore": 4.2
}
```

---

## 6. 리뷰 (Review)

### 6.1 리뷰 작성

전 룸메이트에 대한 리뷰를 작성합니다.

```
POST /reviews
```

**Request Body**

```json
{
  "targetId": 2,
  "content": "청소를 잘하고 배려심이 깊어요!",
  "score": 5
}
```

| 필드 | 타입 | 설명 |
|------|------|------|
| `targetId` | int | 리뷰 대상 사용자 ID |
| `content` | string | 리뷰 내용 |
| `score` | int | 평점 (1 ~ 5) |

**Response (201 Created)**

```json
{
  "id": 1,
  "reviewerId": 1,
  "targetId": 2,
  "content": "청소를 잘하고 배려심이 깊어요!",
  "score": 5,
  "createdAt": "2024-01-15T10:30:00Z"
}
```

---

### 6.2 특정 사용자의 리뷰 조회

```
GET /users/:userId/reviews
```

**Query Parameters**

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| `page` | int | X | 페이지 번호 |
| `limit` | int | X | 페이지당 결과 수 |

**Response (200 OK)**

```json
{
  "total": 5,
  "averageScore": 4.2,
  "data": [
    {
      "id": 1,
      "content": "청소 약속을 정말 잘 지켜요!",
      "score": 5,
      "createdAt": "2024-01-10T15:30:00Z"
    },
    {
      "id": 2,
      "content": "알람을 잘 못 들어요.",
      "score": 2,
      "createdAt": "2024-01-05T09:00:00Z"
    }
  ]
}
```

---

### 6.3 내가 작성한 리뷰 조회

```
GET /users/me/reviews/written
```

---

### 6.4 내가 받은 리뷰 조회

```
GET /users/me/reviews/received
```

---

## 7. 채팅 (Chat)

### 7.1 채팅방 생성

매칭 상대와 1:1 채팅방을 생성합니다. (Screen 11)

```
POST /chats
```

**Request Body**

```json
{
  "targetUserId": 2
}
```

**Response (201 Created)**

```json
{
  "chatRoomId": "room_abc123",
  "participants": [1, 2],
  "createdAt": "2024-01-15T10:30:00Z"
}
```

---

### 7.2 채팅방 목록 조회

```
GET /chats
```

**Response (200 OK)**

```json
{
  "data": [
    {
      "chatRoomId": "room_abc123",
      "participant": {
        "id": 2,
        "nickname": "조용한룸메"
      },
      "lastMessage": {
        "content": "안녕하세요! 룸메이트 구하시나요?",
        "createdAt": "2024-01-15T11:00:00Z"
      },
      "unreadCount": 2
    }
  ]
}
```

---

### 7.3 채팅 메시지 조회

```
GET /chats/:chatRoomId/messages
```

**Query Parameters**

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| `before` | string | X | 이 시간 이전 메시지 (커서 페이지네이션) |
| `limit` | int | X | 메시지 수 (기본값: 50) |

**Response (200 OK)**

```json
{
  "data": [
    {
      "id": "msg_001",
      "senderId": 2,
      "content": "안녕하세요! 룸메이트 구하시나요?",
      "createdAt": "2024-01-15T11:00:00Z"
    },
    {
      "id": "msg_002",
      "senderId": 1,
      "content": "네! 성실관 지원하셨나요?",
      "createdAt": "2024-01-15T11:01:00Z"
    }
  ]
}
```

---

### 7.4 메시지 전송

```
POST /chats/:chatRoomId/messages
```

**Request Body**

```json
{
  "content": "안녕하세요!"
}
```

**Response (201 Created)**

```json
{
  "id": "msg_003",
  "senderId": 1,
  "content": "안녕하세요!",
  "createdAt": "2024-01-15T11:05:00Z"
}
```

---

### 7.5 WebSocket 연결 (실시간 채팅)

```
WS /ws/chat?token={accessToken}
```

**수신 메시지 형식**

```json
{
  "type": "MESSAGE",
  "data": {
    "chatRoomId": "room_abc123",
    "id": "msg_004",
    "senderId": 2,
    "content": "반갑습니다!",
    "createdAt": "2024-01-15T11:10:00Z"
  }
}
```

**송신 메시지 형식**

```json
{
  "type": "SEND_MESSAGE",
  "chatRoomId": "room_abc123",
  "content": "저도 반가워요!"
}
```

---

## 8. 기숙사 정보 (Dormitory)

### 8.1 기숙사 목록 조회

성별에 따라 입사 가능한 기숙사 목록을 반환합니다.

```
GET /dormitories
```

**Query Parameters**

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| `gender` | string | O | 성별 필터 (MALE, FEMALE) |

**Response (200 OK)**

```json
{
  "data": [
    {
      "id": 1,
      "name": "성실관",
      "gender": "MALE",
      "capacity": 200
    },
    {
      "id": 2,
      "name": "진리관",
      "gender": "MALE",
      "capacity": 150
    }
  ]
}
```

---

## Error Codes

| 코드 | HTTP Status | 설명 |
|------|-------------|------|
| `INVALID_EMAIL_DOMAIN` | 400 | 학교 이메일이 아님 |
| `INVALID_CODE` | 400 | 인증번호 불일치 |
| `CODE_EXPIRED` | 400 | 인증번호 만료 |
| `USER_NOT_FOUND` | 404 | 사용자를 찾을 수 없음 |
| `DUPLICATE_EMAIL` | 409 | 이미 가입된 이메일 |
| `UNAUTHORIZED` | 401 | 인증 필요 |
| `TOKEN_EXPIRED` | 401 | 토큰 만료 |
| `FORBIDDEN` | 403 | 권한 없음 |
| `VALIDATION_ERROR` | 422 | 입력값 유효성 오류 |

**Error Response 형식**

```json
{
  "error": "ERROR_CODE",
  "message": "사람이 읽을 수 있는 에러 메시지",
  "details": { }
}
```
