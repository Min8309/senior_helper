# 🌸 시니어 헬퍼 (Senior Helper)

https://senior-helper-seven.vercel.app/
> **AI 기반 시니어 정서·생활 케어 및 두뇌 인지 훈련 디지털 동반자 플랫폼**

[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8-purple.svg)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38bdf8.svg)](https://tailwindcss.com/)

---

## 📌 1. 프로젝트 소개 (About Project)

**시니어 헬퍼(Senior Helper)**는 70대 이상 고령층 어르신을 위한 **AI 맞춤형 정서 케어 & 생활 보조 & 두뇌 훈련 플랫폼**입니다.
단순한 기능성 앱을 넘어, **AI 손자·손녀가 어르신의 하루를 따뜻하게 함께하고, 전자기기 작동을 돕고, 두뇌 건강을 훈련하며, 오늘의 소중한 기억을 목소리로 보관해 주는 통합 케어 동반자**입니다.

---

## 🌟 2. 핵심 기능 (Key Features)

### ① 👦/👧 인터랙티브 AI 손자·손녀 캐릭터
- **손자(`boy.mp4`) / 손녀(`girl.mp4`) 비디오 연동**: 터치 시 소리 토글 지원
- **사용자 이름 개인화**: 상단에 `"안녕하세요, [사용자이름]님 👋"` 고정 및 `✏️ 이름 변경` 설정 모달
- **상단 날씨**: 날짜 옆에 기온과 날씨 상태를 표시하고, 누르면 상세 정보 펼침

### ② 🧠 5종 10단계 두뇌 & 손가락 인지 감각 훈련
- **숫자 순서 누르기**, **선 긋기 (Trace)**, **색상 단추 맞추기**, **소리·불빛 기억하기**, **그림 짝 맞추기**
- Web Audio API 사운드 피드백 및 안심 격려 UI

### ③ 🎤 AI 손자·손녀에게 물어보기
- **80x80px 대형 마이크 버튼** 기반의 직관적인 음성 대화
- 2~3문장의 쉬운 한국어 답변 & 가전제품 질문 감지 시 사진 촬영 연계

### ④ 📷 가전제품 사진 촬영 & AI 비전 도우미
- n8n Webhook 및 Google Gemini Flash Vision AI 연동
- 리모컨/가전제품 사진 촬영 시 **쉬운 3단계 켜는 법** 및 음성 가이드 제공

### ⑤ 🌷 오늘의 기억 & 📖 나의 기억 저장소
- 하루 1개 따뜻한 질문 기반 `🎤 말로 이야기하기` & `✏️ 글로 기록하기`
- **사용자 실제 녹음 목소리 다시 듣기** 및 TTS 낭독 지원
- 날짜별 필터, 상세 보기, 수정 및 2차 확인 모달 기반의 안전한 삭제

---

## 🛠️ 3. 기술 스택 (Tech Stack)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           Client (React 19 + TypeScript)                │
├─────────────────┬─────────────────┬──────────────────┬──────────────────┤
│ 🏠 홈 & 캐릭터  │ 🧠 두뇌 훈련 10단계 │ 🌷 나의 기억 저장소│ 📷 가전 비전 AI │
│ (동영상+개인화) │ (Web Audio/터치)│ (음성녹음+STT)   │ (n8n Webhook 연동)│
├─────────────────┴─────────────────┴──────────────────┴──────────────────┤
│           Layered Service Architecture (Storage, Audio, AI Services)     │
├──────────────────────────────────────┬──────────────────────────────────┤
│ • memoryStorage (LocalStorage/API)   │ • voiceRecordService (MediaRec)  │
│ • aiGrandchild (Intent Analysis)     │ • Web Speech API (STT / TTS)     │
└──────────────────────────────────────┴──────────────────────────────────┘
```

- **Frontend**: React 19, TypeScript 5.7, Vite 8, Tailwind CSS v4
- **Voice & Audio**: Web Speech API (STT / TTS), HTML5 MediaRecorder, Web Audio API
- **AI Integration**: n8n Webhook, Google Gemini Flash Vision AI
- **Architecture**: 레이어드 서비스 아키텍처 (`memoryStorage.ts`, `voiceRecordService.ts`, `aiGrandchild.ts`)

---

## 🎨 4. 시니어 친화적 UI/UX 원칙

1. **Large Touch Target**: 모든 주요 버튼 56px ~ 80px 확보
2. **High Readability**: 본문 18~21px, 제목 24~28px 고대비 볼드 폰트
3. **Warm Color Palette**: 포레스트 그린(`#26734D`) 및 웜베이지(`#FFFDF7`, `#EEDBB2`)
4. **Reassurance Feedback**: "실수해도 괜찮아요", "천천히 말씀해 주세요" 안심 문구
5. **Simple 4-Tab Nav**: `[ 🏠 홈 | 🧠 두뇌 운동 | 🌷 나의 기억 | 📷 생활 도움 ]`

---

## 🚀 5. 실행 방법 (Getting Started)

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build
```

## 개발 검증 및 클라우드 보안 설정

`npm run typecheck`와 `npm test`로 타입·브라우저·접근 정책 검사를 실행합니다. Supabase 인증, 비공개 음성 저장, 기존 데이터 이전 및 사진 분석 서버 연결은 [개발 및 보안 설정](docs/development-and-security.md)을 참고하세요. 일반 대화는 미리 준비된 응답을 사용하며, 날씨는 Open-Meteo의 현재 기온·체감온도·습도 자료를 표시하고 답변합니다.

## Vercel 배포

[Vercel 배포 안내](docs/deployment.md)에 GitHub 연결, 환경변수, Supabase 및 사진 분석 서버 설정을 정리했습니다. `npm run build:deploy`로 배포 전 검증과 프로덕션 빌드를 실행합니다.
