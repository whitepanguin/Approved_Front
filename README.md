# Approved_Front
서울시 토지이용, 커뮤니티, 지도, 회원 관리 등 다양한 기능을 제공하는 Next.js 기반 비즈니스 Insight 도출 서비스입니다.
## 🔍 프로젝트 개요
Approved_Front는 서울시의 다양한 공간 및 커뮤니티 데이터를 효과적으로 시각화하고, 사용자와 관리자가 인사이트를 얻을 수 있도록 설계된 프론트엔드 서비스입니다. 지도 기반 정보 제공, 커뮤니티 피드백 분석, 관리자 통계 등 다양한 비즈니스 의사결정을 지원합니다.
## 🎯 주요 기능
* 지도 기반 토지이용 정보 시각화
* 커뮤니티 게시글 및 피드백 관리
* 관리자 통계(카테고리/제공자별 차트)
* 회원가입/로그인/마이페이지 등 사용자 관리
* 통합 검색 및 데이터 필터링
## 🛠 기술 스택
* **Frontend:** Next.js, React.js, TypeScript, Tailwind CSS
* **패키지 매니저:** PNPM
* **지도/데이터:** GeoJSON, Excel
## 📌 적용 대상
Approved_Front는 다음과 같은 기업/기관에 적합합니다:
* ✅ 공간 데이터 기반 의사결정이 필요한 기관
* ✅ 커뮤니티 피드백을 빠르게 분석하고 싶은 기업
* ✅ 관리자 통계 및 트렌드 분석이 필요한 조직
## 📂 프로젝트 구조
```
Approved_Front
│── app # 주요 페이지 및 라우트
│   ├── AdminPage # 관리자 통계/차트
│   ├── community # 커뮤니티 게시글/상세
│   ├── login, signup, mypage, searchpage, map # 기능별 페이지
│── components # UI 및 레이아웃 컴포넌트
│   ├── ui, layout, postCard, postModal 등
│── hooks # 커스텀 훅
│── lib # 유틸리티 함수
│── modules # 데이터 관리 모듈
│── public # 이미지, 엑셀, GeoJSON 등 정적 파일
│   └── images # 각종 이미지 리소스
│── styles # 글로벌 CSS
│── test # 테스트 리소스
```
## 🚀 실행 방법
### 저장소 클론
```powershell
git clone https://github.com/whitepanguin/Approved_Front.git
```
### 프로젝트 폴더 이동
```powershell
cd Approved_Front
```
### 패키지 설치
```powershell
pnpm install
```
### 개발 서버 실행
```powershell
pnpm dev
```
### 브라우저 접속
`http://localhost:3000`
## 💡 트러블슈팅 & 해결 방법
* 지도 데이터 렌더링 오류 → GeoJSON 및 데이터 포맷 확인
* 커뮤니티 컴포넌트 분리 → 재사용 가능한 구조로 리팩토링
* Tailwind 설정 문제 → config 파일 및 경로 확인
## 👭 팀 & 기여자
Approved_Front 팀
* 팀장 : 이재용
* 팀원 : 김동원, 김우주, 손단하, 엄동렬, 이훤
---
문의 및 기여는 [whitepanguin](https://github.com/whitepanguin) 또는 이슈 게시판을 통해 연락 바랍니다.
