# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Fullstack used-goods marketplace (중고마켓) — React frontend + Spring Boot backend in a monorepo layout.

## 작업 환경 (중요)

작업 환경이 두 곳이므로 실행 전에 반드시 확인할 것.

| 환경 | 프로젝트 경로 | JAVA_HOME |
|------|-------------|-----------|
| 🏠 집 컴퓨터 | `C:\Users\jihun\Desktop\project\resellmarket` | `C:\Program Files\Java\jdk-17` |
| 🏢 외부 컴퓨터 | `C:\Users\Administrator\Desktop\정지훈\react\resellmarket` | `C:\Program Files\Eclipse Adoptium\jdk-17.0.19.10-hotspot` |

> Claude Code에게 작업 시작 시 "지금 집이야" 또는 "지금 외부야" 라고 알려줄 것.

## Commands

### Frontend (`frontend/`)
```bash
npm install      # 처음 한 번만
npm start        # Dev server on http://localhost:3000
npm run build    # Production build
```

### Backend (`backend/`)
```powershell
# 외부 컴퓨터
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.0.19.10-hotspot"
# 집 컴퓨터
$env:JAVA_HOME = "C:\Program Files\Java\jdk-17"

.\mvnw.cmd clean spring-boot:run     # 처음 또는 오류 시
.\mvnw.cmd spring-boot:run           # 이후 빠른 실행
.\mvnw.cmd package                   # Build JAR
```

> ⚠️ `./mvnw` 대신 `.\mvnw.cmd` 사용 (Windows). `mvn` 명령어 없음.
> ⚠️ 시스템 기본 Java가 25이므로 반드시 `$env:JAVA_HOME`을 JDK 17로 설정 후 실행. Lombok이 Java 25와 호환되지 않음.

## Port Configuration

| 서버 | 포트 |
|------|------|
| Frontend (React) | 3000 |
| Backend (Spring Boot) | **8081** |
| H2 Console | 8081/h2-console |

> ⚠️ 8080, 8082 포트는 다른 용도로 사용 중 — 절대 사용 금지.

## Architecture

### Frontend (`frontend/src/App.js`)

모든 UI 로직이 `App.js` 단일 파일에 존재. 라우팅 라이브러리 없음, state 기반 내비게이션.

**페이지 전환 계층:**
```
currentConv ? <ConversationPage> : showInbox ? <InboxPage> : profileUser ? <ProfilePage> : <MainPage>
```

**핵심 state:**
- `dark` — 다크모드 (기본값 `true`, localStorage 미저장)
- `user` — 로그인 유저 객체 (localStorage 영속)
- `items`, `loading` — 상품 목록
- `wishedIds` — Set, 찜한 상품 ID
- `selectedItem` — 상품 상세 모달
- `searchInput`/`searchKeyword` — 300ms debounce
- `filterCategory`, `filterTradeType`, `sortOrder` — 필터/정렬
- `recentItems` — 최근 본 상품 배열 (localStorage 영속, 최대 10개)
- `regImages`/`regPreviews`, `editImages`/`editPreviews` — 다중 이미지 업로드 상태
- `modalImgIdx` — 상세 모달 이미지 슬라이드 인덱스
- `conversations`, `currentConv`, `convMessages` — 쪽지 기능
- `unreadCount` — 읽지 않은 쪽지 수 (nav 배지)
- `toasts` — 알림 토스트 큐
- `msgEndRef` — useRef, 채팅 자동 스크롤용

**스타일링:**
- 인라인 스타일 전용. `buildCSS(dark)` 함수가 CSS 문자열 생성 → `useEffect`로 `<style>` 태그 주입.
- `MINT = '#00E676'` (형광 초록), `NAVY = '#0A1A0F'` (진한 다크 그린)
- `C` 객체: 다크/라이트 모드 컬러 맵 (`bg`, `cardBg`, `cardBdr`, `text`, `textSub`, `textMuted`, `border`, `inputBg`, `inputBdr`, `metaBg`, `navBg`, `navBdr`)
- `IC` 객체: 22개 인라인 SVG 컴포넌트. 아이콘 라이브러리 의존성 없음.

**이미지 헬퍼:**
```js
getImages(item)     // imageNames 배열 우선, fallback imageName 단일
getFirstImage(item) // 카드 썸네일용
```

### Backend (`backend/src/main/java/com/example/backend/`)

Spring Boot 3.2.5 / Java 17, H2 in-memory DB (`ddl-auto=update`). 재시작 시 데이터 초기화.

**Entities:**
- `User` — id, username, password, role (`USER`/`ADMIN`), createdAt
- `Product` — id, name, price, seller, address, imageName, imageNames(`@ElementCollection EAGER`), description(`@Lob`), category(`Category` enum), status(`ProductStatus` enum), tradeType(`TradeType` enum), wishCount, viewCount, createdAt(`@PrePersist`), lastBumpedAt
- `Wish` — id, userId, productId
- `Message` — id, senderId, receiverId, productId, content(`@Lob`), createdAt(`@PrePersist`), isRead
- `Report` — id, productId, reporterId, reason, createdAt(`@PrePersist`)
- Enums: `Category` (ELECTRONICS/FURNITURE/CLOTHING/OTHER), `ProductStatus` (SELLING/SOLD), `TradeType` (DIRECT/DELIVERY/BOTH)

**File uploads:** 이미지는 `resellmarket/uploads/`에 저장. `ProductController`와 `WebConfig` 모두 `Paths.get(user.dir).getParent().resolve("uploads")`로 backend 상위 폴더를 가리킴. 샘플 이미지(`bike.jpg`, `ipad.jpg`, `chair.jpg`, `shoes.jpg`, `keyboard.jpg`, `desk.jpg`)는 `uploads/`에 미리 존재.

**Auth:** DB 직접 조회 방식 (JWT/세션/해싱 없음).

**Error handling:** `GlobalExceptionHandler` — `RuntimeException` → HTTP 400 `{ "message": "..." }`.

### Key API Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/items?keyword=&category=&tradeType=&sort=` | 상품 목록 (stream 필터링) |
| POST | `/api/items` | 상품 등록 (multipart/form-data, `images[]` 최대 5장) |
| PUT | `/api/items/{id}` | 상품 수정 (multipart/form-data) |
| DELETE | `/api/items/{id}` | 상품 삭제 |
| PUT | `/api/items/{id}/view` | 조회수 +1 |
| PUT | `/api/items/{id}/bump` | 끌어올리기 (1시간 쿨다운) |
| POST | `/api/auth/register` | 회원가입 |
| POST | `/api/auth/login` | 로그인 |
| POST | `/api/auth/setup` | 데모 데이터 시드 (전체 초기화 후 재생성) |
| POST | `/api/wishes/{productId}` | 찜 토글 (body: `{ userId }`) |
| GET | `/api/wishes/user/{userId}` | 찜한 상품 ID 목록 |
| GET | `/api/users/{username}/profile` | 유저 프로필 + 등록 상품 목록 |
| POST | `/api/reports` | 신고 등록 |
| GET | `/api/reports?adminId=` | 신고 목록 조회 (ADMIN만) |
| POST | `/api/messages` | 쪽지 전송 |
| GET | `/api/messages/inbox?userId=` | 쪽지함 (대화 목록) |
| GET | `/api/messages/conversation?userId=&partnerId=&productId=` | 대화 내용 (읽음 처리 포함) |
| GET | `/api/messages/unread-count?userId=` | 읽지 않은 쪽지 수 |
| GET | `/images/**` | 업로드 이미지 서빙 |

**TradeType 필터 동작:** BOTH 상품은 DIRECT 또는 DELIVERY 검색 시 모두 노출.

### Demo Accounts (via `POST /api/auth/setup`)
| ID | PW | Role |
|----|-----|------|
| admin | 1234 | ADMIN |
| user1 | 1234 | USER |
| user2 | 1234 | USER |

## Known Constraints
- H2 인메모리 DB — 백엔드 재시작 시 모든 데이터 초기화. `POST /api/auth/setup`으로 재시드.
- 검색/필터/정렬은 `findAll()` 후 Java stream 처리 — DB 쿼리 아님.
- CORS는 각 컨트롤러에 `@CrossOrigin(origins = "http://localhost:3000")` 개별 선언 (글로벌 설정 아님).
- `spring.jackson.serialization.write-dates-as-timestamps=false` — LocalDateTime을 ISO 문자열로 직렬화.
- Passwords are stored as plain text.

## Troubleshooting

### 포트 충돌 시
```powershell
netstat -ano | findstr :8081
taskkill /PID <PID번호> /F
```

### 프론트엔드 오류 시
```powershell
cd frontend && npm install && npm start
```
