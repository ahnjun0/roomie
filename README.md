# 🏠 Roomie: 최고의 룸메이트를 찾아서!

**Roomie**는 룸메이트를 의미하는 영어 slang으로, 학기 중 삶의 질을 결정짓는 룸메이트 배정을 돕기 위해 개발된 서비스입니다. 나와 잘 맞는 친구를 찾고, 공동생활 수칙을 정하며, 풍요로운 기숙사 라이프를 즐길 수 있는 기능을 제공합니다.

---

## 👥 Our Team

| 이름 | 소속 | 역할 | 이메일 |
| :--- | :--- | :--- | :--- |
| **정재원** | KAIST 전기및전자공학부 | Backend Developer | jjhana@kaist.ac.kr |
| **안준영** | 부산대학교 정보컴퓨터공학부 | Frontend Developer | ahnjun@pusan.ac.kr |

---

## ✨ Key Features

* **정교한 매칭 시스템**: 단순한 MBTI를 넘어 수면 패턴, 소음 민감도 등을 분석하여 최적의 파트너를 추천합니다.
* **6만원 배분 게임**: '5만원으로 직장 동료 구하기' 밈에서 착안하여, 사용자가 중요하게 생각하는 생활 조건에 가상 화폐를 베팅해 가중치를 설정합니다.
* **룸메이트 계약서**: 말로 꺼내기 애매한 생활 수칙을 계약서 체결 컨셉으로 자연스럽게 정하고, PDF로 저장할 수 있습니다.
* **기숙사 밀착 커뮤니티**: 배달 파트너 모집, 벌레 잡기 요청, 시설 고장 신고 등 기숙사 생활에 꼭 필요한 게시판을 운영합니다.
* **실시간 채팅 및 알림**: WebSocket을 이용한 실시간 소통과 채팅 알림 기능을 제공합니다.
* **상호 리뷰 시스템**: 학기가 끝난 후 익명으로 솔직한 후기를 남길 수 있으며, 본인은 자신의 후기를 볼 수 없어 객관성을 유지합니다.

---

## 🛠 Tech Stack

### Frontend (Mobile App)
* **Framework**: React Native (Cross-Platform)
* **Language**: TypeScript
* **Navigation**: React Navigation (Stack & Tab)
* **Networking**: Fetch API (REST API 통신)
* **Local Storage**: AsyncStorage

### Backend (API Server)
* **Language**: Python 3.11+
* **Web Framework**: FastAPI
* **Server**: Uvicorn
* **Database & ORM**: PostgreSQL 15 & Prisma Client Python
* **Security**: Python-JOSE (JWT), Passlib (Bcrypt)
* **Testing**: Pytest, HTTPX

### Infrastructure & DevOps
* **Containerization**: Docker, Docker Compose
* **CI/CD**: GitHub Actions (자동화 빌드 및 테스트)

---

## 🧮 Matching Algorithm

Roomie는 과학적인 통계 모델을 통해 상호 만족도를 계산합니다.

### 1. 상호 만족도 정의 (Mutual Satisfaction)
일방적인 만족을 방지하기 위해 기하평균을 사용합니다.

$$S_{mutual}=\sqrt{S_{A\rightarrow B}\times S_{B\rightarrow A}}$$

### 2. 항목별 유사도 산출
* **척도형 (소음, 청결도 등)**: 1~5점 사이의 거리를 계산합니다.

    $$s_{scale}(a,b)=1-\frac{|a-b|}{4}$$
  
* **시간형 (수면 시간)**: 두 유저 간 겹치는 수면 구간 비율을 산출합니다.

    $$s_{time}=\frac{min(t_{e}^{A},t_{e}^{B})-max(t_{s}^{A},t_{s}^{B})}{max(t_{e}^{A}-t_{s}^{A},t_{e}^{B}-t_{s}^{B})}$$
  
* **태그형 (잠버릇)**: 상대의 잠버릇($P_{total}$)이 나의 소음 민감도($\mu$)에 따라 주는 불쾌감을 계산합니다.

    $$\begin{cases} s_{\text{habit}} = \max(0, 1 - P_{\text{total}} \cdot \mu) \\\mu = 1.0 + (n_{\text{my}} - 3) \times 0.2 \end{cases}$$

### 3. 희소성 보너스 (TF-IDF)
남들과 다른 특별한 생활 패턴을 공유하는 유저들에게 가산점을 부여합니다.

$$IDF(v)=\frac{log(\frac{N}{count(v)})}{log(N)}$$

### 4. 최종 점수 계산
가중 평균된 기본 점수에 선호도 및 희소성 보너스를 합산하여 100점 만점으로 클램핑합니다.

$$S_{A\rightarrow B}=min(100,\frac{\sum_{i=1}^{6}s_{i}\cdot w_{i}}{\sum_{i=1}^{6}w_{i}}\times100+B_{pref}+B_{rarity})$$
