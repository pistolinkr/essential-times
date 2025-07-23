# Essential Times - News Posting Site

Essential Times is a news posting site where reporters and administrators can write and manage articles. It provides a clean design similar to Naver News with a user-friendly interface.

## Key Features

### 🔐 User Authentication
- **Reporter Account**: Configured via environment variables (default: `reporter@esil.com` | `abcd1234`)
- **Admin Account**: Configured via environment variables (default: `admin@esil.com` | `abcd1234`)

### 👨‍💼 Reporter Features
- Article writing (title, content, image attachment)
- Edit/delete only their own articles
- View article list

### 👨‍💻 Admin Features
- Manage all articles (edit/delete)
- Create new articles
- View complete article list

### 📰 General User Features
- Main page with Naver News style
- Browse and view article details
- Responsive design

## Tech Stack

### Backend
- **Node.js** + **Express.js**
- **SQLite** database
- **JWT** authentication
- **Multer** file upload
- **bcryptjs** password encryption

### Frontend
- **React.js** + **React Router**
- **Axios** API communication
- **CSS3** styling
- Responsive web design

## Installation & Setup

### 1. Environment Variables

```bash
# Create .env file
cp env.example .env

# Edit .env file with actual account information
# REPORTER_ACCOUNT_ID=your-reporter-email
# REPORTER_ACCOUNT_PASSWORD=your-reporter-password
# ADMIN_ACCOUNT_ID=your-admin-email
# ADMIN_ACCOUNT_PASSWORD=your-admin-password
# JWT_SECRET_KEY=your-secret-key
```

### 2. Install Dependencies

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```

### 3. Start Server

```bash
# Run server in development mode
npm run dev

# Or in production mode
npm start
```

### 4. Start Client (separate terminal)

```bash
cd client
npm start
```

### 5. Access in Browser

- **Main Site**: http://localhost:3000
- **API Server**: http://localhost:5001

## Project Structure

```
Essential Times/
├── server.js              # Express server main file
├── package.json           # Backend dependencies
├── essential_times.db     # SQLite database
├── uploads/              # Uploaded images storage
└── client/               # React frontend
    ├── public/
    ├── src/
    │   ├── components/   # Reusable components
    │   ├── pages/        # Page components
    │   ├── utils/        # Utility functions
    │   ├── App.js        # Main app component
    │   └── index.js      # React entry point
    └── package.json      # Frontend dependencies
```

## API Endpoints

### Authentication
- `POST /api/login` - User login

### Article Management
- `GET /api/articles` - Get public article list
- `GET /api/articles/:id` - Get article details
- `POST /api/articles` - Create article (authentication required)
- `PUT /api/articles/:id` - Edit article (author/admin only)
- `DELETE /api/articles/:id` - Delete article (author/admin only)
- `GET /api/my-articles` - Get my articles (authentication required)
- `GET /api/admin/articles` - Get all articles (admin only)

## Key Features

### 🔒 Security
- JWT token-based authentication
- bcrypt password encryption
- Role-based access control
- Secure account information management via environment variables
- Separation of sensitive information via .env file

### 📱 Responsive Design
- Mobile, tablet, desktop support
- Clean UI similar to Naver News

### 🖼️ Image Upload
- Image file upload support
- Automatic filename generation and storage

### 📊 Database
- Lightweight database using SQLite
- Automatic table creation and default user registration

## Usage

### 1. Login as Reporter
- Login with reporter account configured in environment variables
- Click "Reporter Page" button
- Create new articles or edit/delete existing ones

### 2. Login as Admin
- Login with admin account configured in environment variables
- Click "Admin Page" button
- Manage all articles and create new ones

### 3. General Users
- Browse articles on main page without login
- Click article title to view details

## License

MIT License

## Developer

Essential Times Development Team

---

# Essential Times - 뉴스포스트 사이트

Essential Times는 기자와 관리자가 기사를 작성하고 관리할 수 있는 뉴스포스트 사이트입니다. 네이버 뉴스 스타일의 깔끔한 디자인과 사용자 친화적인 인터페이스를 제공합니다.

## 주요 기능

### 🔐 사용자 인증
- **기자 계정**: 환경변수에서 설정 (기본값: `reporter@esil.com` | `abcd1234`)
- **관리자 계정**: 환경변수에서 설정 (기본값: `admin@esil.com` | `abcd1234`)

### 👨‍💼 기자 기능
- 기사 작성 (제목, 본문, 이미지 첨부)
- 본인이 작성한 기사만 수정/삭제 가능
- 기사 목록 조회

### 👨‍💻 관리자 기능
- 모든 기사 관리 (수정/삭제)
- 새 기사 작성
- 전체 기사 목록 조회

### 📰 일반 사용자 기능
- 네이버 뉴스 스타일의 메인 페이지
- 기사 목록 조회 및 상세 보기
- 반응형 디자인

## 기술 스택

### Backend
- **Node.js** + **Express.js**
- **SQLite** 데이터베이스
- **JWT** 인증
- **Multer** 파일 업로드
- **bcryptjs** 비밀번호 암호화

### Frontend
- **React.js** + **React Router**
- **Axios** API 통신
- **CSS3** 스타일링
- 반응형 웹 디자인

## 설치 및 실행

### 1. 환경변수 설정

```bash
# .env 파일 생성
cp env.example .env

# .env 파일을 편집하여 실제 계정 정보 입력
# REPORTER_ACCOUNT_ID=your-reporter-email
# REPORTER_ACCOUNT_PASSWORD=your-reporter-password
# ADMIN_ACCOUNT_ID=your-admin-email
# ADMIN_ACCOUNT_PASSWORD=your-admin-password
# JWT_SECRET_KEY=your-secret-key
```

### 2. 의존성 설치

```bash
# 백엔드 의존성 설치
npm install

# 프론트엔드 의존성 설치
cd client
npm install
cd ..
```

### 3. 서버 실행

```bash
# 개발 모드로 서버 실행
npm run dev

# 또는 프로덕션 모드
npm start
```

### 4. 클라이언트 실행 (별도 터미널)

```bash
cd client
npm start
```

### 5. 브라우저에서 접속

- **메인 사이트**: http://localhost:3000
- **API 서버**: http://localhost:5001

## 프로젝트 구조

```
Essential Times/
├── server.js              # Express 서버 메인 파일
├── package.json           # 백엔드 의존성
├── essential_times.db     # SQLite 데이터베이스
├── uploads/              # 업로드된 이미지 저장소
└── client/               # React 프론트엔드
    ├── public/
    ├── src/
    │   ├── components/   # 재사용 가능한 컴포넌트
    │   ├── pages/        # 페이지 컴포넌트
    │   ├── utils/        # 유틸리티 함수
    │   ├── App.js        # 메인 앱 컴포넌트
    │   └── index.js      # React 진입점
    └── package.json      # 프론트엔드 의존성
```

## API 엔드포인트

### 인증
- `POST /api/login` - 사용자 로그인

### 기사 관리
- `GET /api/articles` - 공개 기사 목록 조회
- `GET /api/articles/:id` - 기사 상세 조회
- `POST /api/articles` - 기사 작성 (인증 필요)
- `PUT /api/articles/:id` - 기사 수정 (작성자/관리자만)
- `DELETE /api/articles/:id` - 기사 삭제 (작성자/관리자만)
- `GET /api/my-articles` - 내 기사 목록 (인증 필요)
- `GET /api/admin/articles` - 전체 기사 목록 (관리자만)

## 주요 특징

### 🔒 보안
- JWT 토큰 기반 인증
- 비밀번호 bcrypt 암호화
- 권한 기반 접근 제어
- 환경변수를 통한 계정 정보 보안 관리
- .env 파일을 통한 민감한 정보 분리

### 📱 반응형 디자인
- 모바일, 태블릿, 데스크톱 지원
- 네이버 뉴스 스타일의 깔끔한 UI

### 🖼️ 이미지 업로드
- 이미지 파일 업로드 지원
- 자동 파일명 생성 및 저장

### 📊 데이터베이스
- SQLite를 사용한 경량 데이터베이스
- 자동 테이블 생성 및 기본 사용자 등록

## 사용 방법

### 1. 기자로 로그인
- 환경변수에 설정된 기자 계정으로 로그인
- "기자 페이지" 버튼 클릭
- 새 기사 작성 또는 기존 기사 수정/삭제

### 2. 관리자로 로그인
- 환경변수에 설정된 관리자 계정으로 로그인
- "관리자 페이지" 버튼 클릭
- 모든 기사 관리 및 새 기사 작성

### 3. 일반 사용자
- 로그인 없이 메인 페이지에서 기사 조회
- 기사 제목 클릭하여 상세 내용 확인

## 라이선스

MIT License

## 개발자

Essential Times Development Team 