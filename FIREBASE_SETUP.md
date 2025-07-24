# Firebase 설정 가이드

## 1. Firebase 프로젝트 생성

1. [Firebase Console](https://console.firebase.google.com/)에 접속
2. "프로젝트 추가" 클릭
3. 프로젝트 이름: `essential-times` (또는 원하는 이름)
4. Google Analytics 설정 (선택사항)
5. 프로젝트 생성 완료

## 2. Authentication 설정

1. **Authentication** → **시작하기** 클릭
2. **로그인 방법** 탭에서 **이메일/비밀번호** 활성화
3. **사용자** 탭에서 다음 사용자 추가:
   - **기자 계정**: `reporter@esil.com` / `abcd1234`
   - **관리자 계정**: `admin@esil.com` / `abcd1234`

## 3. Firestore Database 설정

1. **Firestore Database** → **데이터베이스 만들기** 클릭
2. **테스트 모드에서 시작** 선택 (개발용)
3. 위치 선택 (가까운 지역)

## 4. Storage 설정

1. **Storage** → **시작하기** 클릭
2. **테스트 모드에서 시작** 선택
3. 위치 선택 (Firestore와 동일하게)

## 5. 웹 앱 등록

1. **프로젝트 개요** → **웹 앱 추가** 클릭
2. 앱 닉네임: `essential-times-web`
3. **앱 등록** 클릭
4. 설정 정보 복사 (firebaseConfig 객체)

## 6. 환경 변수 설정

`.env` 파일에 Firebase 설정 정보 입력:

```env
# Firebase 설정
FIREBASE_API_KEY=your-api-key-here
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your-sender-id
FIREBASE_APP_ID=your-app-id

# JWT Secret Key
JWT_SECRET_KEY=essential-times-secret-key-2024

# 서버 설정
PORT=5001
NODE_ENV=development
```

## 7. Firestore 보안 규칙

**Firestore Database** → **규칙** 탭에서 다음 규칙 설정:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 카테고리는 모든 사용자가 읽기 가능
    match /categories/{document} {
      allow read: if true;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // 기사는 모든 사용자가 읽기 가능, 작성자는 수정/삭제 가능
    match /articles/{document} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
        (resource.data.author_id == request.auth.uid || 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
    }
    
    // 사용자 정보는 본인과 관리자만 접근 가능
    match /users/{document} {
      allow read, write: if request.auth != null && 
        (request.auth.uid == document || 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
    }
  }
}
```

## 8. Storage 보안 규칙

**Storage** → **규칙** 탭에서 다음 규칙 설정:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## 9. 서버 실행

```bash
npm run dev
```

## 10. 테스트

1. 브라우저에서 `http://localhost:5001` 접속
2. 로그인 페이지에서 기자/관리자 계정으로 로그인 테스트
3. 기사 작성 및 관리 기능 테스트

## 문제 해결

### 인증 오류
- Firebase Authentication에서 사용자가 제대로 생성되었는지 확인
- 이메일/비밀번호 로그인이 활성화되었는지 확인

### 데이터베이스 오류
- Firestore 보안 규칙이 올바르게 설정되었는지 확인
- 컬렉션과 문서 구조가 올바른지 확인

### 파일 업로드 오류
- Storage 보안 규칙이 올바르게 설정되었는지 확인
- Storage 버킷이 생성되었는지 확인 