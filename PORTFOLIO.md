# 🌸 시니어 헬퍼 (Senior Helper)
> **AI 기반 시니어 정서·생활 케어 및 두뇌 인지 훈련 디지털 동반자 플랫폼**

---

## 📌 1. 프로젝트 개요 (Executive Summary)

- **프로젝트명**: 시니어 헬퍼 (Senior Helper)
- **개발 형태**: 모바일 웹 애플리케이션 (React + TypeScript + Vite)
- **타겟 사용자**: 70대 이상 고령층 어르신 및 디지털 취약계층
- **핵심 목표**: 
  단순한 유틸리티 기능을 넘어, **AI 손자·손녀가 어르신의 하루를 따뜻하게 함께하고, 전자기기 사용을 돕고, 두뇌 건강을 훈련하며, 오늘의 소중한 기억을 목소리로 보관해 주는 통합 케어 동반자** 구현

---

## 🛠️ 2. 기술 스택 & 시스템 아키텍처 (Tech Stack & Architecture)

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

| 구분 | 적용 기술 |
| :--- | :--- |
| **Frontend Framework** | React 19, TypeScript 5.7, Vite 8 |
| **Styling & Design System** | Tailwind CSS v4, 시니어 전용 HSL 웜 그린/베이지 커스텀 토큰 |
| **Voice & Audio** | Web Speech API (STT / TTS), HTML5 MediaRecorder, Web Audio API |
| **Vision AI Integration** | n8n Webhook, Google Gemini Flash Vision API |
| **State & Persistence** | 모듈형 LocalStorage 추상화 레이어 (향후 백엔드 DB/REST API 100% 호환) |
| **Version Control** | Git, Git LFS (비디오 에셋 버전 관리) |

---

## 🌟 3. 핵심 기능 상세 (Key Features)

### ① 인터랙티브 AI 손자·손녀 캐릭터 (Emotional Character Interface)
- **손자(`boy.mp4`) / 손녀(`girl.mp4`) 비디오 연동**: 부드러운 애니메이션 및 터치 시 원본 목소리/소리 토글 지원
- **사용자 이름 개인화**: 상단에 `"안녕하세요, [사용자이름]님 👋"` 고정 및 `✏️ 이름 변경` 모달을 통한 영구 저장
- **음성 낭독 (TTS)**: 상단 스피커 버튼을 통해 이름이 반영된 다정한 아침 인사 낭독

### ② 5종 10단계 두뇌 & 손가락 인지 감각 훈련 (Cognitive Training)
- **10단계 레벨 디자인**: 쉬운 터치부터 점진적 난이도 상향
- **5가지 훈련 모드**:
  1. 🔢 **숫자 순서 누르기**: 1부터 순서대로 터치하여 시각 탐색력 향상
  2. ✏️ **선 긋기 (Trace)**: 시작점에서 도착점까지 궤적 잇기
  3. 🎨 **색상 단추 맞추기**: 제시된 색상 식별 및 변별력 훈련
  4. 💡 **소리·불빛 기억하기**: 순서 기억 및 시청각 통합 훈련
  5. 🍎 **그림 짝 맞추기**: 과일 카드 짝을 찾는 단기 기억력 훈련
- **Web Audio API & 햅틱 피드백**: 터치할 때마다 청각적/촉각적 반응 제공 및 실수해도 안심할 수 있는 격려 UI

### ③ AI 손자·손녀에게 물어보기 (AI Conversational Voice Assistant)
- **대형 마이크 버튼 (80x80px)**: 텍스트 타이핑 없이 원터치로 음성 질문
- **지능형 의도 분석 및 친절한 응답**: 2~3문장의 짧고 쉬운 한국어로 즉시 답변
- **가전제품 질문 연계**: 에어컨, 세탁기, 리모컨 등 전자기기 작동 질문 감지 시 `[ 📷 사진 찍어 보여주기 ]` CTA 버튼 자동 노출

### ④ 가전제품 사진 촬영 및 AI 비전 도우미 (AI Appliance Vision Guide)
- **n8n Webhook & Gemini Vision AI 연동**: 어르신이 촬영한 리모컨/가전제품 사진 분석
- **쉬운 3단계 켜는 법 제공**: 초등학생도 알기 쉬운 명확한 1문장 단계별 안내
- **음성 오디오 파형 피드백**: 작동법을 음성으로 차분하게 읽어주는 낭독 기능

### ⑤ 오늘의 기억 & 나의 기억 저장소 (Daily Memory & Voice Archive)
- **1일 1질문 대화**: *"오늘 가장 좋았던 일은 뭐였어요?"*, *"오늘 누구와 이야기했어요?"*
- **음성 및 글 2-Way 기록**:
  - `🎤 말로 이야기하기`: 실시간 음성 녹음 + STT 텍스트 변환
  - `✏️ 글로 기록하기`: 180px 이상의 시원한 대형 텍스트 에디터
- **확인 후 저장**: 음성 인식 결과를 사용자가 확인/수정 후 저장
- **원 목소리 다시 듣기**: 사용자가 녹음한 실제 목소리 재생 및 TTS 낭독
- **기억 관리**: 날짜별 최신순 정렬, 내용 수정, 2차 확인 모달을 통한 안전한 삭제

---

## 🎨 4. 시니어 친화적 UI/UX 설계 원칙 (Senior-Centered UX)

```
[ 시니어 접근성 5대 원칙 ]
1. Large Touch Target   : 모든 주요 버튼 높이 56px ~ 80px 확보
2. High Readability     : 본문 18~21px, 제목 24~28px 고대비 볼드 폰트
3. Warm Color Palette   : 차가운 병원 느낌 배제 (#26734D 포레스트 그린, #FFFDF7 웜베이지)
4. Reassurance Feedback : "실수해도 괜찮아요", "천천히 말씀해 주세요" 안심 문구
5. Simple 4-Tab Nav     : [ 🏠 홈 | 🧠 두뇌 운동 | 🌷 나의 기억 | 📷 생활 도움 ]
```

---

## 📂 5. 프로젝트 디렉토리 구조 (Project Structure)

```
c:\Senior Citizens Emotional Support App (2)\
├── img/
│   ├── boy.mp4                 # 손자 모드 비디오 에셋
│   └── girl.mp4                 # 손녀 모드 비디오 에셋
├── src/
│   ├── components/
│   │   ├── AiAskCard.tsx          # AI 손자·손녀에게 물어보기 대화 컴포넌트
│   │   ├── GuideScreen.tsx        # 사진 촬영 및 분석 안내 화면
│   │   ├── MemoryScreen.tsx       # 나의 기억 저장소 목록 & 상세 페이지
│   │   ├── MemoryRecordModal.tsx  # 음성/글 기억 남기기 모달
│   │   └── NameEditModal.tsx      # 사용자 이름 설정/수정 모달
│   ├── services/
│   │   ├── aiGrandchild.ts        # AI 응답 및 전자기기 의도 분석 엔진
│   │   ├── memoryStorage.ts       # 기억 CRUD 로컬스토리지/API 레이어
│   │   └── voiceRecordService.ts  # MediaRecorder & STT 음성 서비스
│   ├── types/
│   │   └── memory.ts              # 기억 데이터 타입 인터페이스
│   ├── App.tsx                    # 메인 셸 & 라우팅 & 홈/가이드/게임 화면
│   ├── main.tsx                   # React 진입점
│   └── index.css                  # Tailwind CSS v4 & 전역 스타일
├── package.json
└── vite.config.ts
```

---

## 🏆 6. 기술적 성과 및 의의 (Key Achievements)

1. **디지털 소외 계층을 위한 음성 중심 인터랙션 구현**: 복잡한 텍스트 입력 없이 음성 녹음, AI 비전 촬영, 터치 게임만으로 모든 기능을 직관적으로 조작 가능.
2. **반응형 모바일 뷰포트 최적화**: 390px 스마트폰 세로 화면 기준 겹침 없이 시원한 터치 영역과 쾌적한 폰트 크기 유지.
3. **확장성 높은 모듈형 아키텍처**: 데이터 스토리지, 음성 녹음/STT, AI 의도 분석 로직을 독립 서비스로 분리하여 향후 n8n 워크플로우나 클라우드 백엔드 DB 교체에 유연하게 대응.
4. **Git LFS & Vite 빌드 최적화**: 비디오 에셋을 효율적으로 번들링하여 빠른 로딩 속도와 안정적인 실행 환경 보장.
