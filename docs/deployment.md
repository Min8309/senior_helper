# Vercel 배포

## GitHub에서 배포하기

1. [Vercel](https://vercel.com/new)에 로그인하고 GitHub 계정을 연결합니다.
2. **Import Git Repository**에서 `Min8309/senior_helper`를 선택합니다. 보이지 않으면 GitHub 저장소 접근 권한을 허용합니다.
3. **Root Directory**는 저장소 루트(`.`), **Framework Preset**은 Vite, Node.js 버전은 **22.x**로 설정합니다.
4. 저장소의 `vercel.json`이 설치 명령 `npm ci`, 빌드 명령 `npm run build:deploy`, 출력 폴더 `dist`를 설정합니다. 기존 프로젝트에 다른 명령을 입력했다면 이 값으로 변경합니다.
5. 아래 필요한 환경변수를 설정하고 **Deploy**를 누릅니다. 홈페이지·두뇌 운동·영상·날씨·브라우저 기억 저장은 환경변수 없이도 실행됩니다.
6. 완료 후 Vercel이 발급한 `https://프로젝트명.vercel.app` 주소를 엽니다. Production Branch를 `main`으로 지정하면 이후 GitHub `main`에 올린 변경이 자동 배포됩니다. 다른 브랜치/PR은 Preview 배포로 검토합니다.

개발 서버의 8443 포트를 공개하는 방식이 아니라 `dist`의 프로덕션 정적 파일을 HTTPS로 제공합니다. 이 저장소는 분석 백엔드를 포함하지 않습니다.

## 환경변수

Vercel 프로젝트의 **Settings → Environment Variables**에서 입력합니다. 프런트엔드 환경변수는 빌드 때 포함되므로 변경 후 **Redeploy**가 필요합니다. Production과 Preview에 적용할 범위를 각각 선택합니다. `.env.example`에는 값 없이 변수 이름만 있습니다.

| 변수 | 용도 | 설정하지 않았을 때 |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | Supabase 프로젝트 HTTPS URL | 해당 브라우저에 기억 저장 |
| `VITE_SUPABASE_ANON_KEY` | 공개 anon 또는 publishable 키 | 해당 브라우저에 기억 저장 |
| `VITE_N8N_ANALYZE_WEBHOOK` | 운영 n8n 분석 웹훅의 전체 HTTPS 주소 | 촬영 가능, 사진 분석은 오류 안내 |

Supabase 두 변수는 함께 설정합니다. `VITE_` 값은 누구나 볼 수 있으므로 서비스 역할 키, `sb_secret_` 키, Gemini/Hugging Face 토큰은 입력하지 않습니다. AI 키는 분석 서버에 보관합니다. 빌드 검사에서 Supabase 부분 설정, HTTP 주소, 알려진 비밀 키 및 미디어 대신 남은 LFS 포인터를 차단합니다.

날씨는 브라우저에서 Open-Meteo를 호출하며 별도 키가 필요 없습니다. 상용 서비스에는 [이용 조건 및 요금제](https://open-meteo.com/en/terms)를 확인합니다.

## 클라우드 기억 저장 연결

Supabase에서 기존 데이터를 백업한 뒤 저장소의 `supabase_schema.sql`을 SQL Editor로 실행하고 **Authentication → Anonymous Sign-ins**를 활성화합니다. `memory-audio`는 비공개 버킷이며 사용자별 RLS 정책을 적용합니다. 인증 URL 설정에 실제 배포 주소를 등록합니다. Preview에서 검증하려면 별도 테스트 Supabase 프로젝트를 사용하는 편이 좋습니다.

익명 계정은 같은 브라우저의 세션에 연결됩니다. 다른 기기에서 기록을 공유하거나 계정 복구를 제공하려면 영구 로그인 기능이 추가로 필요합니다. 기존 `user_...` 소유자 데이터 이전은 [개발 및 보안 설정](development-and-security.md)을 참고합니다.

## 사진 분석 서버 연결

n8n 워크플로를 활성화하고 테스트 URL이 아닌 **Production Webhook URL**을 `VITE_N8N_ANALYZE_WEBHOOK`에 입력합니다. 서버는 HTTPS, `multipart/form-data` POST와 앱의 응답 형식을 지원해야 합니다. CORS 허용 Origin에 실제 Vercel 도메인과 필요한 Preview 도메인을 설정합니다. 사진은 서버에서 필요한 기간만 처리하고 AI 키는 서버에 둡니다. 비용이 발생하는 공개 웹훅은 서버에서 인증·요청 제한을 적용합니다. 응답 형식은 [개발 및 보안 설정](development-and-security.md#사진-분석대화)에 있습니다.

기본 `/webhook/analyze-appliance`는 Vercel에 자동 생성되지 않습니다. 이 저장소에 없는 백엔드가 배포되었다고 가정하지 않습니다. HTTPS 앱에서는 HTTP 분석 서버를 호출할 수 없습니다.

## 배포 후 확인

- 실제 휴대폰에서 HTTPS 주소를 열어 날짜·날씨 드롭다운, 4칸 버튼, 손자/손녀 영상 재생을 확인합니다.
- 위치, 마이크, 카메라는 버튼을 눌렀을 때 권한을 허용합니다. HTTPS가 필요하며 음성 인식은 브라우저마다 지원이 다릅니다.
- 브라우저 기억 저장·다시 열기를 확인하고, Supabase 연결 시 저장/조회/음성 재생과 사용자별 접근 제한도 실제 환경에서 확인합니다.
- 분석 서버를 연결했다면 실제 기기 사진으로 응답을 확인합니다. 미연결 상태에서는 분석 성공 결과를 표시하지 않습니다.
- 환경변수·도메인을 바꾼 뒤에는 Redeploy합니다. 이전 버전을 되돌릴 때는 Vercel Deployments에서 검증된 배포로 롤백합니다.

## 로컬 배포 빌드 확인

```bash
npm ci
npm run build:deploy
npm run preview -- --host 127.0.0.1 --port 4173
```

필수 영상과 배경 이미지는 실제 파일로 Git에 저장되어 Vercel에서 별도 Git LFS 설치 없이 빌드됩니다. 캐시된 해시 자산은 장기 캐시하고 홈페이지는 재검증해 새 배포를 받도록 설정했습니다.
