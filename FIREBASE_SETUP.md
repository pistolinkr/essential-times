# Firebase 설정 가이드

## 1. Firebase 프로젝트 설정

### 1.1 Firebase Console에서 프로젝트 생성
1. [Firebase Console](https://console.firebase.google.com/)에 접속
2. "프로젝트 만들기" 클릭
3. 프로젝트 이름: `essential-times` (또는 원하는 이름)
4. Google Analytics 사용 설정 (선택사항)
5. 프로젝트 생성 완료

### 1.2 Authentication 설정
1. 왼쪽 메뉴에서 "Authentication" 클릭
2. "시작하기" 클릭
3. "로그인 방법" 탭에서 "이메일/비밀번호" 활성화
4. "사용자" 탭에서 다음 계정들 생성:
   - **Reporter**: `reporter@esil.com` / `abcd1234`
   - **Admin**: `admin@esil.com` / `abcd1234`

### 1.3 Firestore Database 설정
1. 왼쪽 메뉴에서 "Firestore Database" 클릭
2. "데이터베이스 만들기" 클릭
3. "테스트 모드에서 시작" 선택 (개발용)
4. 위치: `asia-east1` (서울) 선택
5. 데이터베이스 생성 완료

### 1.4 Storage 설정
1. 왼쪽 메뉴에서 "Storage" 클릭
2. "시작하기" 클릭
3. "테스트 모드에서 시작" 선택 (개발용)
4. 위치: `asia-east1` (서울) 선택
5. Storage 생성 완료

### 1.5 웹 앱 추가
1. 프로젝트 개요에서 "웹 앱 추가" 클릭
2. 앱 닉네임: `essential-times-web`
3. "Firebase Hosting 설정" 체크 해제
4. 앱 등록 완료

## 2. 환경 변수 설정

### 2.1 .env 파일 생성
```bash
# 프로젝트 루트에서
cp env.example .env
```

### 2.2 Firebase 설정값 복사
Firebase Console > 프로젝트 설정 > 일반 > 내 앱 > 웹 앱에서:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

### 2.3 .env 파일 수정
```env
# Firebase 설정
FIREBASE_API_KEY=your-api-key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your-sender-id
FIREBASE_APP_ID=your-app-id

# JWT Secret Key
JWT_SECRET_KEY=your-secret-key-change-this-in-production

# 서버 설정
PORT=5001
NODE_ENV=development
```

## 3. Firebase App Hosting 배포

### 3.1 Firebase CLI 설치
```bash
npm install -g firebase-tools
```

### 3.2 Firebase 로그인
```bash
firebase login
```

### 3.3 프로젝트 초기화
```bash
firebase init hosting
```

### 3.4 환경 변수 설정
Firebase Console > App Hosting > 백엔드 > 환경 변수에서:
- `FIREBASE_API_KEY`
- `FIREBASE_AUTH_DOMAIN`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_STORAGE_BUCKET`
- `FIREBASE_MESSAGING_SENDER_ID`
- `FIREBASE_APP_ID`
- `JWT_SECRET_KEY`

### 3.5 배포
```bash
firebase deploy
```

## 4. 보안 규칙 설정

### 4.1 Firestore 보안 규칙
`firestore.rules` 파일이 자동으로 적용됩니다.

### 4.2 Storage 보안 규칙
`storage.rules` 파일이 자동으로 적용됩니다.

## 5. 문제 해결

### 5.1 "auth/invalid-api-key" 오류
- .env 파일의 Firebase 설정값이 올바른지 확인
- Firebase Console에서 웹 앱 설정값 재확인

### 5.2 배포 실패
- `apphosting.yaml` 파일 확인
- 환경 변수가 올바르게 설정되었는지 확인
- 헬스 체크 엔드포인트 `/api/health` 동작 확인

### 5.3 권한 오류
- Firestore 및 Storage 보안 규칙 확인
- Authentication에서 사용자 계정 생성 확인 