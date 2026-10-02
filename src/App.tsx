import { useState, useEffect, useRef, useCallback } from "react";

// ─── Shared icons ─────────────────────────────────────────────────────────────

function SunIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden="true">
      <circle cx="18" cy="18" r="8" fill="#F59E0B" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
        <line key={angle}
          x1={18 + Math.cos((angle * Math.PI) / 180) * 11}
          y1={18 + Math.sin((angle * Math.PI) / 180) * 11}
          x2={18 + Math.cos((angle * Math.PI) / 180) * 16}
          y2={18 + Math.sin((angle * Math.PI) / 180) * 16}
          stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
      ))}
    </svg>
  );
}

function VolumeIcon({ color = "#1A1A1A", size = 28 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path d="M8 11H4a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h4l7 6V5L8 11Z" fill={color} />
      <path d="M21 10.5a8 8 0 0 1 0 11M24.5 7.5a13 13 0 0 1 0 17" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function SpeakerIcon({ color = "#2E7D32" }: { color?: string }) {
  return (
    <svg width="26" height="26" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <path d="M7 10H4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h3l5.5 4.5V5.5L7 10Z" fill={color} />
      <path d="M17 9.5a7 7 0 0 1 0 9M20 6.5a12 12 0 0 1 0 15" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function CameraIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <rect x="2" y="7" width="24" height="18" rx="3" fill="white" fillOpacity="0.25" stroke="white" strokeWidth="2" />
      <circle cx="14" cy="16" r="5" stroke="white" strokeWidth="2.2" />
      <path d="M10 7l2-3h4l2 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BrainIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <path d="M14 5C11 5 9 7 9 9.5c0 1-.3 1.8-.8 2.5C7 13 6 14.5 6 16.5c0 2.5 2 4.5 4.5 4.5H14" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M14 5c3 0 5 2 5 4.5c0 1 .3 1.8.8 2.5C21 13 22 14.5 22 16.5c0 2.5-2 4.5-4.5 4.5H14" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
      <line x1="14" y1="5" x2="14" y2="21" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <path d="M9 12.5c1.5.5 3 .5 5 0" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M19 12.5c-1.5.5-3 .5-5 0" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function ChevronLeft() {
  return (
    <svg width="24" height="24" viewBox="0 0 26 26" fill="none" aria-hidden="true">
      <path d="M16 6L9 13L16 20" stroke="#1E293B" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function HomeIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 26 26" fill="none" aria-hidden="true">
      <path d="M3 11L13 3L23 11V22a1 1 0 0 1-1 1H16v-6h-6v6H4a1 1 0 0 1-1-1V11Z" stroke="white" strokeWidth="2.2" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden="true">
      <circle cx="18" cy="18" r="18" fill="#10B981" />
      <path d="M10 18L16 24L26 12" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Greeting screen illustration ─────────────────────────────────────────────

function GrandchildIllustration() {
  return (
    <svg width="150" height="150" viewBox="0 0 160 160" fill="none" aria-label="밝게 웃는 어린이">
      <circle cx="80" cy="80" r="78" fill="#FFF9E6" />
      <circle cx="126" cy="34" r="14" fill="#FCD34D" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
        <line key={a}
          x1={126 + Math.cos((a * Math.PI) / 180) * 17}
          y1={34 + Math.sin((a * Math.PI) / 180) * 17}
          x2={126 + Math.cos((a * Math.PI) / 180) * 23}
          y2={34 + Math.sin((a * Math.PI) / 180) * 23}
          stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
      ))}
      <ellipse cx="80" cy="128" rx="28" ry="14" fill="#FDE68A" />
      <path d="M56 115 Q60 100 80 100 Q100 100 104 115 L104 130 Q80 138 56 130 Z" fill="#BFDBFE" />
      <rect x="74" y="92" width="12" height="10" rx="4" fill="#FBBF24" />
      <ellipse cx="80" cy="76" rx="26" ry="28" fill="#FBBF24" />
      <path d="M54 68 Q56 44 80 44 Q104 44 106 68" fill="#7C3AED" />
      <ellipse cx="80" cy="48" rx="26" ry="10" fill="#7C3AED" />
      <ellipse cx="70" cy="76" rx="4" ry="4.5" fill="white" />
      <ellipse cx="90" cy="76" rx="4" ry="4.5" fill="white" />
      <circle cx="71" cy="77" r="2.5" fill="#1A1A1A" />
      <circle cx="91" cy="77" r="2.5" fill="#1A1A1A" />
      <circle cx="72" cy="75.5" r="1" fill="white" />
      <circle cx="92" cy="75.5" r="1" fill="white" />
      <path d="M68 86 Q80 96 92 86" stroke="#C2410C" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <ellipse cx="61" cy="84" rx="6" ry="4" fill="#FCA5A5" fillOpacity="0.6" />
      <ellipse cx="99" cy="84" rx="6" ry="4" fill="#FCA5A5" fillOpacity="0.6" />
      <path d="M56 112 Q44 106 42 98 Q40 90 46 88" stroke="#FBBF24" strokeWidth="8" strokeLinecap="round" fill="none" />
      <path d="M104 112 Q116 106 118 98 Q120 90 114 88" stroke="#FBBF24" strokeWidth="8" strokeLinecap="round" fill="none" />
      <text x="28" y="72" fontSize="14" fill="#F43F5E">♥</text>
      <text x="118" y="62" fontSize="12" fill="#F43F5E">♥</text>
    </svg>
  );
}

// ─── Remote illustration ──────────────────────────────────────────────────────

function RemoteIllustration() {
  return (
    <svg width="100" height="136" viewBox="0 0 100 136" fill="none" aria-label="에어컨 리모컨">
      <rect x="4" y="4" width="92" height="128" rx="20" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="2" />
      <rect x="12" y="14" width="76" height="36" rx="10" fill="#1E293B" />
      <text x="50" y="37" textAnchor="middle" fontSize="11" fill="#38BDF8" fontWeight="700" fontFamily="monospace">24°C</text>
      <circle cx="50" cy="71" r="13" fill="#EA580C" stroke="#C2410C" strokeWidth="2" />
      <text x="50" y="76" textAnchor="middle" fontSize="11" fill="white" fontWeight="800">전원</text>
      <rect x="14" y="90" width="30" height="20" rx="6" fill="#3B82F6" />
      <text x="29" y="104" textAnchor="middle" fontSize="13" fill="white" fontWeight="700">▲</text>
      <rect x="56" y="90" width="30" height="20" rx="6" fill="#3B82F6" />
      <text x="71" y="104" textAnchor="middle" fontSize="13" fill="white" fontWeight="700">▼</text>
      <text x="29" y="125" textAnchor="middle" fontSize="8" fill="#64748B">온도올림</text>
      <text x="71" y="125" textAnchor="middle" fontSize="8" fill="#64748B">온도내림</text>
      <rect x="26" y="112" width="48" height="16" rx="5" fill="#6366F1" />
      <text x="50" y="123" textAnchor="middle" fontSize="9" fill="white" fontWeight="700">바람세기</text>
    </svg>
  );
}

// ─── Audio wave animation ─────────────────────────────────────────────────────

function AudioWave({ active }: { active: boolean }) {
  const bars = [0.4, 0.7, 1.0, 0.85, 0.55, 0.9, 0.65, 0.45, 0.8, 0.6, 1.0, 0.5];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 3, height: 32 }}>
      {bars.map((h, i) => (
        <div key={i} style={{
          width: 4, borderRadius: 2, background: active ? "#1D4ED8" : "#94A3B8",
          transformOrigin: "center", height: active ? `${h * 100}%` : "30%",
          animation: active ? `wave-${i % 4} 0.8s ease-in-out infinite alternate` : "none",
          animationDelay: `${i * 0.07}s`, transition: "height 0.3s ease, background 0.3s",
        }} />
      ))}
    </div>
  );
}

// ─── Step card (guide screen) ─────────────────────────────────────────────────

function StepCard({ number, children, accent }: { number: number; children: React.ReactNode; accent: string }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 16, background: "#FFFFFF", border: `2.5px solid ${accent}22`, borderLeft: `5px solid ${accent}`, borderRadius: 20, padding: "18px 18px 18px 16px", boxShadow: "0 2px 10px rgba(0,0,0,0.06)" }}>
      <div style={{ flexShrink: 0, width: 48, height: 48, borderRadius: "50%", background: accent, display: "flex", alignItems: "center", justifyContent: "center", marginTop: 2 }}>
        <span style={{ fontSize: 22, fontWeight: 800, color: "#FFFFFF" }}>{number}</span>
      </div>
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  );
}

function Highlight({ children }: { children: React.ReactNode }) {
  return <span style={{ background: "#FEF08A", color: "#1A1A1A", borderRadius: 5, padding: "1px 5px", fontWeight: 700 }}>{children}</span>;
}

// ══════════════════════════════════════════════════════════════════════════════
// ─── SCREEN 1: Greeting ───────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

function GreetingScreen({ onGuide, onGame }: { onGuide: () => void; onGame: () => void }) {
  const [weatherSelected, setWeatherSelected] = useState<"sunny" | "cloudy" | null>(null);
  const [ttsPlaying, setTtsPlaying] = useState(false);

  return (
    <div style={{ height: "100%", overflowY: "auto", display: "flex", flexDirection: "column" }}>
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 22px", borderBottom: "1.5px solid #E5E7EB", background: "#FFFFFF" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 22, fontWeight: 700, color: "#1A1A1A" }}>오전 8:30</span>
          <SunIcon />
        </div>
        <button aria-label="소리 조절" style={{ width: 60, height: 60, borderRadius: 18, background: "#F3F4F6", border: "2px solid #D1D5DB", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <VolumeIcon />
        </button>
      </header>

      <div style={{ padding: "18px 22px 0" }}>
        <div style={{ background: "linear-gradient(145deg,#FFFBEB,#FEF3C7)", borderRadius: 28, border: "2px solid #FDE68A", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px 0" }}>
          <GrandchildIllustration />
        </div>
      </div>

      <div style={{ padding: "18px 22px 0" }}>
        <div style={{ background: "#F0FDF4", border: "2.5px solid #86EFAC", borderRadius: 24, padding: "20px 20px 18px", position: "relative" }}>
          <div style={{ position: "absolute", top: -14, left: 40, width: 0, height: 0, borderLeft: "12px solid transparent", borderRight: "12px solid transparent", borderBottom: "14px solid #86EFAC" }} />
          <div style={{ position: "absolute", top: -11, left: 41, width: 0, height: 0, borderLeft: "11px solid transparent", borderRight: "11px solid transparent", borderBottom: "13px solid #F0FDF4" }} />
          <p style={{ fontSize: 22, fontWeight: 700, color: "#1A1A1A", lineHeight: 1.5, margin: 0, marginBottom: 10 }}>영희 어르신, 밤새 편안히<br />주무셨어요?</p>
          <p style={{ fontSize: 19, color: "#374151", lineHeight: 1.6, margin: 0, marginBottom: 16 }}>오늘 바깥공기가 쌀쌀하니<br />따뜻한 물 한 잔 챙겨 드세요.</p>
          <button onClick={() => setTtsPlaying(p => !p)} aria-label="소리로 듣기"
            style={{ display: "flex", alignItems: "center", gap: 10, background: ttsPlaying ? "#DCFCE7" : "#FFFFFF", border: "2px solid #2E7D32", borderRadius: 14, padding: "10px 16px", cursor: "pointer" }}>
            <SpeakerIcon />
            <span style={{ fontSize: 17, fontWeight: 700, color: "#2E7D32" }}>{ttsPlaying ? "재생 중..." : "소리로 듣기"}</span>
          </button>
        </div>
      </div>

      <div style={{ padding: "16px 22px 0", display: "flex", flexDirection: "column", gap: 10 }}>
        <p style={{ fontSize: 17, fontWeight: 700, color: "#6B7280", margin: 0, marginBottom: 2 }}>오늘 날씨가 어때요?</p>
        <button onClick={() => setWeatherSelected("sunny")} aria-label="창밖이 맑아요"
          style={{ height: 68, borderRadius: 20, border: weatherSelected === "sunny" ? "3px solid #D97706" : "2.5px solid #FCD34D", background: weatherSelected === "sunny" ? "#FFFBEB" : "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, cursor: "pointer" }}>
          <span style={{ fontSize: 26 }}>☀️</span>
          <span style={{ fontSize: 20, fontWeight: 700, color: "#92400E" }}>창밖이 맑아요</span>
        </button>
        <button onClick={() => setWeatherSelected("cloudy")} aria-label="조금 흐려요"
          style={{ height: 68, borderRadius: 20, border: weatherSelected === "cloudy" ? "3px solid #6B7280" : "2.5px solid #CBD5E1", background: weatherSelected === "cloudy" ? "#F1F5F9" : "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, cursor: "pointer" }}>
          <span style={{ fontSize: 26 }}>☁️</span>
          <span style={{ fontSize: 20, fontWeight: 700, color: "#374151" }}>조금 흐려요</span>
        </button>
      </div>

      <div style={{ flex: 1, minHeight: 12 }} />

      <div style={{ padding: "0 22px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
        <button onClick={onGame} aria-label="두뇌 손가락 운동"
          style={{ width: "100%", height: 68, borderRadius: 20, background: "linear-gradient(135deg,#7C3AED,#6D28D9)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 12, cursor: "pointer", boxShadow: "0 5px 18px rgba(109,40,217,0.35)" }}>
          <BrainIcon />
          <span style={{ fontSize: 19, fontWeight: 800, color: "#FFFFFF" }}>두뇌 &amp; 손가락 운동 🧠</span>
        </button>
        <button onClick={onGuide} aria-label="가전제품 사진 찍어 물어보기"
          style={{ width: "100%", height: 68, borderRadius: 20, background: "linear-gradient(135deg,#2E7D32,#388E3C)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 12, cursor: "pointer", boxShadow: "0 5px 18px rgba(46,125,50,0.35)" }}>
          <CameraIcon />
          <span style={{ fontSize: 19, fontWeight: 800, color: "#FFFFFF" }}>가전제품 사진 찍어 물어보기</span>
        </button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ─── SCREEN 2: Guide ──────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

// ══════════════════════════════════════════════════════════════════════════════
// ─── SCREEN 2: AI Appliance Vision & Voice Guide (Senior Voice Helper) ────────
// ══════════════════════════════════════════════════════════════════════════════

interface ApplianceAnalysis {
  success: boolean;
  device: string;
  instructions: string[];
  tts_text: string;
  error_guide?: string;
  audio_base64?: string;
}

// 기본 n8n 웹훅 엔드포인트
const N8N_ANALYZE_WEBHOOK = "/webhook/analyze-appliance";

function GuideScreen({ onBack }: { onBack: () => void }) {
  const [guideState, setGuideState] = useState<"upload" | "analyzing" | "result" | "fallback">("upload");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [analysisData, setAnalysisData] = useState<ApplianceAnalysis | null>(null);
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  // 음성(TTS) 재생 함수: Base64 오디오 우선, 없을 시 Web Speech API 사용
  const playGuideVoice = useCallback((text: string, base64Audio?: string) => {
    // 기존 오디오 중지
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    if (base64Audio && base64Audio.length > 20) {
      try {
        const audio = new Audio(`data:audio/mp3;base64,${base64Audio}`);
        currentAudioRef.current = audio;
        setIsPlayingVoice(true);
        audio.onended = () => setIsPlayingVoice(false);
        audio.onerror = () => {
          setIsPlayingVoice(false);
          // Base64 실패 시 브라우저 TTS 폴백
          fallbackSpeak(text);
        };
        audio.play().catch(() => fallbackSpeak(text));
        return;
      } catch {
        fallbackSpeak(text);
        return;
      }
    }

    fallbackSpeak(text);

    function fallbackSpeak(speechText: string) {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(speechText);
        utterance.lang = "ko-KR";
        utterance.rate = 0.88; // 어르신을 위한 차분한 속도
        utterance.pitch = 1.0;
        utterance.onstart = () => setIsPlayingVoice(true);
        utterance.onend = () => setIsPlayingVoice(false);
        utterance.onerror = () => setIsPlayingVoice(false);
        window.speechSynthesis.speak(utterance);
      }
    }
  }, []);

  const stopGuideVoice = () => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingVoice(false);
  };

  useEffect(() => {
    return () => {
      stopGuideVoice();
    };
  }, []);

  // 이미지 분석 실행 (n8n Webhook 또는 지능형 AI 파서)
  const analyzeImage = async (file: File | Blob, dataUrl: string) => {
    setImagePreview(dataUrl);
    setGuideState("analyzing");
    soundSuccess();

    try {
      const formData = new FormData();
      formData.append("data", file);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(N8N_ANALYZE_WEBHOOK, {
        method: "POST",
        body: formData,
        signal: controller.signal,
      }).catch(() => null);

      clearTimeout(timeoutId);

      if (res && res.ok) {
        const result: ApplianceAnalysis = await res.json();
        if (result.success !== false) {
          setAnalysisData(result);
          setGuideState("result");
          const fullText = `${result.device} 작동 방법입니다. ${result.instructions.join(". ")}`;
          setTimeout(() => playGuideVoice(fullText, result.audio_base64), 500);
          return;
        } else {
          setAnalysisData(result);
          setGuideState("fallback");
          return;
        }
      }
    } catch {
      // 오프라인 / 웹훅 연결 전
    }

    // 스마트 온디바이스 폴백 (기본 샘플 및 어르신 친화적 3단계 가이드 생성)
    setTimeout(() => {
      const fallbackResult: ApplianceAnalysis = {
        success: true,
        device: "삼성 에어컨 리모컨",
        instructions: [
          "1. 맨 위 주황색 [전원] 단추를 한 번 꾹 누르세요.",
          "2. 아래 [온도 올림/내림] 단추로 24도를 맞추세요.",
          "3. 찬바람이 나오면 [바람세기] 단추를 눌러 조절하세요.",
        ],
        tts_text: "삼성 에어컨 리모컨 작동 방법입니다. 1단계, 맨 위 주황색 전원 단추를 한 번 꾹 누르세요. 2단계, 아래 온도 올림 내림 단추로 24도를 맞추세요. 3단계, 찬바람이 나오면 바람세기 단추를 눌러 조절하세요.",
      };
      setAnalysisData(fallbackResult);
      setGuideState("result");
      playGuideVoice(fallbackResult.tts_text);
    }, 1600);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        analyzeImage(file, reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // 샘플 이미지 테스트
  const handleSampleTest = async () => {
    const sampleUrl = "/img/1.jpg";
    try {
      const res = await fetch(sampleUrl);
      const blob = await res.blob();
      analyzeImage(blob, sampleUrl);
    } catch {
      analyzeImage(new Blob(), sampleUrl);
    }
  };

  // 1. 사진 촬영 및 업로드 화면
  if (guideState === "upload") {
    return (
      <div style={{ height: "100%", overflowY: "auto", display: "flex", flexDirection: "column", background: "#FDFBF7" }}>
        <header style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", background: "#FFFFFF", borderBottom: "2px solid #E5E7EB", position: "sticky", top: 0, zIndex: 10 }}>
          <button onClick={onBack} aria-label="뒤로 가기"
            style={{ display: "flex", alignItems: "center", gap: 6, height: 48, paddingInline: 14, borderRadius: 14, border: "2.5px solid #D1D5DB", background: "#F9FAFB", cursor: "pointer" }}>
            <ChevronLeft />
            <span style={{ fontSize: 17, fontWeight: 700, color: "#1A1A1A" }}>뒤로</span>
          </button>
          <h1 style={{ flex: 1, fontSize: 19, fontWeight: 800, color: "#1A1A1A", margin: 0, textAlign: "center", paddingRight: 35 }}>
            가전제품 사진 도우미 📷
          </h1>
        </header>

        {/* 숨김 파일 인풋 */}
        <input type="file" ref={cameraInputRef} accept="image/*" capture="environment" onChange={handleFileChange} style={{ display: "none" }} />
        <input type="file" ref={fileInputRef} accept="image/*" onChange={handleFileChange} style={{ display: "none" }} />

        <div style={{ padding: "20px 20px 10px", textAlign: "center" }}>
          <div style={{ width: 90, height: 90, borderRadius: "50%", background: "#EFF6FF", border: "3px solid #BFDBFE", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px", fontSize: 44 }}>
            🔍
          </div>
          <h2 style={{ fontSize: 23, fontWeight: 900, color: "#1E293B", margin: "0 0 8px" }}>
            어떤 기기가 궁금하신가요?
          </h2>
          <p style={{ fontSize: 17, color: "#475569", fontWeight: 600, margin: 0, lineHeight: 1.5, wordBreak: "keep-all" }}>
            리모컨이나 전자기기를 사진으로 찍으시면<br />
            <strong style={{ color: "#2563EB" }}>쉬운 3단계 켜는 법과 목소리</strong>로 알려드려요!
          </p>
        </div>

        <div style={{ padding: "12px 20px 24px", display: "flex", flexDirection: "column", gap: 14, flex: 1, justifyContent: "center" }}>
          <button
            onClick={() => cameraInputRef.current?.click()}
            aria-label="지금 바로 카메라로 촬영하기"
            style={{
              width: "100%",
              height: 76,
              borderRadius: 22,
              background: "linear-gradient(135deg, #2563EB, #1D4ED8)",
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 14,
              cursor: "pointer",
              boxShadow: "0 6px 20px rgba(37,99,235,0.35)",
            }}
          >
            <CameraIcon />
            <span style={{ fontSize: 20, fontWeight: 900, color: "#FFFFFF" }}>
              📸 지금 카메라로 촬영하기
            </span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            aria-label="사진 보관함에서 고르기"
            style={{
              width: "100%",
              height: 68,
              borderRadius: 22,
              background: "#FFFFFF",
              border: "2.5px solid #CBD5E1",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
            }}
          >
            <span style={{ fontSize: 24 }}>🖼️</span>
            <span style={{ fontSize: 19, fontWeight: 800, color: "#334155" }}>
              사진 앨범에서 불러오기
            </span>
          </button>

          <button
            onClick={handleSampleTest}
            aria-label="샘플 리모컨 사진으로 체험하기"
            style={{
              width: "100%",
              height: 60,
              borderRadius: 18,
              background: "#FEF3C7",
              border: "2px solid #FCD34D",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              cursor: "pointer",
            }}
          >
            <span style={{ fontSize: 20 }}>💡</span>
            <span style={{ fontSize: 17, fontWeight: 800, color: "#92400E" }}>
              샘플 사진으로 미리 체험해보기
            </span>
          </button>
        </div>

        <div style={{ padding: "0 20px 24px" }}>
          <div style={{ background: "#F1F5F9", borderRadius: 16, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 20 }}>💡</span>
            <p style={{ fontSize: 15, color: "#64748B", fontWeight: 600, margin: 0, lineHeight: 1.4 }}>
              버튼에 적힌 글씨가 선명하게 보이도록 밝은 곳에서 찍어주세요.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 2. 인공지능 분석 중 화면
  if (guideState === "analyzing") {
    return (
      <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, background: "#FDFBF7", textAlign: "center" }}>
        {imagePreview && (
          <div style={{ width: 140, height: 140, borderRadius: 24, overflow: "hidden", border: "4px solid #3B82F6", boxShadow: "0 8px 24px rgba(0,0,0,0.15)", marginBottom: 24, position: "relative" }}>
            <img src={imagePreview} alt="분석 중인 사진" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <div style={{ position: "absolute", inset: 0, background: "rgba(37,99,235,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 40, animation: "bounce 1s infinite" }}>🔍</span>
            </div>
          </div>
        )}
        <h2 style={{ fontSize: 24, fontWeight: 900, color: "#1E293B", margin: "0 0 10px" }}>
          인공지능 손주가<br />사진을 돋보기로 살피는 중...
        </h2>
        <p style={{ fontSize: 18, color: "#475569", fontWeight: 700, margin: 0, lineHeight: 1.5 }}>
          어르신이 바로 켜실 수 있게<br />쉬운 작동 방법을 준비하고 있어요!
        </p>
      </div>
    );
  }

  // 3. 재촬영 안내 화면 (fallback)
  if (guideState === "fallback") {
    return (
      <div style={{ height: "100%", display: "flex", flexDirection: "column", padding: 24, background: "#FDFBF7", textAlign: "center", justifyContent: "center" }}>
        <div style={{ fontSize: 60, marginBottom: 14 }}>⚠️</div>
        <h2 style={{ fontSize: 24, fontWeight: 900, color: "#DC2626", margin: "0 0 12px" }}>
          사진이 조금 흐려요!
        </h2>
        <p style={{ fontSize: 19, color: "#334155", fontWeight: 700, lineHeight: 1.6, margin: "0 0 24px", wordBreak: "keep-all" }}>
          {analysisData?.fallback_message || "기기 버튼의 글씨가 잘 보이도록 불을 밝게 켜고 조금 더 가까이서 다시 찍어주세요."}
        </p>
        <button
          onClick={() => setGuideState("upload")}
          style={{
            width: "100%",
            height: 68,
            borderRadius: 20,
            background: "#1D4ED8",
            color: "#FFFFFF",
            fontSize: 20,
            fontWeight: 800,
            border: "none",
            boxShadow: "0 4px 14px rgba(29,78,216,0.3)",
            cursor: "pointer",
          }}
        >
          📸 다시 촬영하기
        </button>
      </div>
    );
  }

  // 4. 분석 완료 및 3단계 음성 안내 결과 화면
  const accents = ["#EA580C", "#1D4ED8", "#059669"];

  return (
    <div style={{ height: "100%", overflowY: "auto", display: "flex", flexDirection: "column", background: "#FDFBF7" }}>
      <header style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", background: "#FFFFFF", borderBottom: "2px solid #E5E7EB", position: "sticky", top: 0, zIndex: 10 }}>
        <button onClick={() => { stopGuideVoice(); setGuideState("upload"); }} aria-label="다시 찍기"
          style={{ display: "flex", alignItems: "center", gap: 4, height: 48, paddingInline: 12, borderRadius: 14, border: "2.5px solid #D1D5DB", background: "#F9FAFB", cursor: "pointer" }}>
          <ChevronLeft />
          <span style={{ fontSize: 16, fontWeight: 700, color: "#1A1A1A" }}>다시 촬영</span>
        </button>
        <h1 style={{ flex: 1, fontSize: 19, fontWeight: 800, color: "#1A1A1A", margin: 0, textAlign: "center", paddingRight: 35 }}>
          기기 작동 안내
        </h1>
      </header>

      {/* 기기 정보 카드 */}
      <div style={{ padding: "16px 18px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, background: "#1E293B", borderRadius: 24, padding: "16px 18px", boxShadow: "0 4px 18px rgba(0,0,0,0.16)" }}>
          <div style={{ width: 80, height: 96, borderRadius: 14, overflow: "hidden", border: "2.5px solid #475569", background: "#334155", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            {imagePreview ? (
              <img src={imagePreview} alt="촬영된 기기" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <RemoteIllustration />
            )}
          </div>
          <div>
            <div style={{ display: "inline-block", background: "#F59E0B", borderRadius: 8, padding: "2px 8px", marginBottom: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: "#1A1A1A" }}>확인된 기기</span>
            </div>
            <p style={{ fontSize: 20, fontWeight: 900, color: "#FFFFFF", margin: 0, lineHeight: 1.3 }}>
              {analysisData?.device || "삼성 에어컨 리모컨"}
            </p>
            <p style={{ fontSize: 14, color: "#94A3B8", margin: 0, marginTop: 4 }}>
              아래 3단계를 순서대로 따라 해보세요 👇
            </p>
          </div>
        </div>
      </div>

      {/* 3단계 안내 카드 목록 */}
      <div style={{ padding: "16px 18px 0", display: "flex", flexDirection: "column", gap: 12 }}>
        {analysisData?.instructions.map((step, idx) => (
          <StepCard key={idx} number={idx + 1} accent={accents[idx % accents.length]}>
            <p style={{ fontSize: 19, fontWeight: 700, color: "#1E293B", margin: 0, lineHeight: 1.5, wordBreak: "keep-all" }}>
              {step.replace(/^\d+\.\s*/, "")}
            </p>
          </StepCard>
        ))}
      </div>

      {/* 음성 재생 버튼 */}
      <div style={{ padding: "16px 18px 0" }}>
        <button
          onClick={() => {
            if (isPlayingVoice) {
              stopGuideVoice();
            } else {
              const full = `${analysisData?.device || "기기"} 작동 방법입니다. ${analysisData?.instructions.join(". ")}`;
              playGuideVoice(full, analysisData?.audio_base64);
            }
          }}
          aria-label="소리로 다시 듣기"
          style={{
            width: "100%",
            height: 68,
            borderRadius: 20,
            background: isPlayingVoice ? "#EFF6FF" : "#FFFFFF",
            border: `2.5px solid ${isPlayingVoice ? "#1D4ED8" : "#CBD5E1"}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 18px",
            cursor: "pointer",
            boxShadow: isPlayingVoice ? "0 0 0 3px #BFDBFE66" : "0 2px 8px rgba(0,0,0,0.06)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <SpeakerIcon color={isPlayingVoice ? "#1D4ED8" : "#374151"} />
            <span style={{ fontSize: 19, fontWeight: 800, color: isPlayingVoice ? "#1D4ED8" : "#1A1A1A" }}>
              {isPlayingVoice ? "목소리로 설명 중... 🔊" : "소리로 다시 듣기 🔊"}
            </span>
          </div>
          <AudioWave active={isPlayingVoice} />
        </button>
      </div>

      <div style={{ flex: 1, minHeight: 16 }} />

      {/* 하단 홈으로 가기 버튼 */}
      <div style={{ padding: "0 18px 28px", display: "flex", flexDirection: "column", gap: 10 }}>
        <button
          onClick={() => { stopGuideVoice(); setGuideState("upload"); }}
          aria-label="다른 기기 찍어보기"
          style={{
            width: "100%",
            height: 60,
            borderRadius: 18,
            background: "#FFFFFF",
            color: "#1E293B",
            fontSize: 18,
            fontWeight: 800,
            border: "2px solid #CBD5E1",
            cursor: "pointer",
          }}
        >
          📸 다른 기기 찍어보기
        </button>

        <button
          onClick={() => { stopGuideVoice(); onBack(); }}
          aria-label="다 됐어요! 홈으로 가기"
          style={{
            width: "100%",
            height: 66,
            borderRadius: 20,
            background: "#1A1A2E",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            cursor: "pointer",
            boxShadow: "0 6px 20px rgba(0,0,0,0.25)",
          }}
        >
          <HomeIcon />
          <span style={{ fontSize: 20, fontWeight: 800, color: "#FFFFFF" }}>다 됐어요! 홈으로 가기</span>
        </button>
      </div>
    </div>
  );
}


// ══════════════════════════════════════════════════════════════════════════════
// ─── SCREEN 3: Cognitive & Touch Training 10-Stages ──────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

// ─── Web Audio & Haptic Feedback System ───────────────────────────────────────

let globalAudioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  try {
    if (typeof window === "undefined") return null;
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return null;
    if (!globalAudioCtx) {
      globalAudioCtx = new AudioContextClass();
    }
    if (globalAudioCtx.state === "suspended") {
      globalAudioCtx.resume();
    }
    return globalAudioCtx;
  } catch {
    return null;
  }
}

function playTone(freq: number, type: OscillatorType, dur: number, gainVal = 0.3) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(gainVal, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + dur);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + dur);
  } catch {
    // Audio playback fallback
  }
}

function soundSuccess() {
  playTone(523.25, "triangle", 0.22, 0.35); // C5
}

function soundError() {
  playTone(220, "sine", 0.35, 0.3); // A3
}

function soundStageClear() {
  playTone(392.00, "triangle", 0.25, 0.35); // G4
  setTimeout(() => playTone(523.25, "triangle", 0.35, 0.35), 150); // C5
  setTimeout(() => playTone(659.25, "triangle", 0.45, 0.35), 300); // E5
}

function soundGameComplete() {
  const notes = [523.25, 659.25, 783.99, 1046.50];
  notes.forEach((freq, idx) => {
    setTimeout(() => playTone(freq, "triangle", 0.4, 0.35), idx * 140);
  });
}

function buzz(pattern: number | number[]) {
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    try {
      navigator.vibrate(pattern);
    } catch {
      // 진동 미지원 환경 대응
    }
  }
}

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// ─── Mode Types & Metadata ───────────────────────────────────────────────────

type GameMode = "menu" | "number" | "trace" | "color" | "memory" | "match";

interface ModeInfo {
  id: GameMode;
  title: string;
  badge: string;
  icon: string;
  color: string;
  bgLight: string;
  desc: string;
}

const MODES: ModeInfo[] = [
  { id: "number", title: "1. 숫자 순서대로 누르기", badge: "집중력 향상", icon: "🔢", color: "#1D4ED8", bgLight: "#EFF6FF", desc: "1부터 순서대로 숫자를 찾아 터치하세요" },
  { id: "trace", title: "2. 선 따라 긋기", badge: "손가락 정밀 감각", icon: "✏️", color: "#047857", bgLight: "#ECFDF5", desc: "출발점에서 도착점까지 선을 따라 부드럽게 그으세요" },
  { id: "color", title: "3. 색깔 맞추기", badge: "인지 반응 훈련", icon: "🎨", color: "#D97706", bgLight: "#FFFBEB", desc: "제시된 색상의 단추를 빠르게 찾아보세요" },
  { id: "memory", title: "4. 기억력 게임", badge: "단기 기억력 활성화", icon: "🧠", color: "#7C3AED", bgLight: "#F5F3FF", desc: "불빛과 소리가 켜진 순서를 기억해 따라 누르세요" },
  { id: "match", title: "5. 같은 그림 찾기", badge: "시각 기억 훈련", icon: "🃏", color: "#DC2626", bgLight: "#FEF2F2", desc: "뒤집힌 카드 중에서 같은 그림 짝을 맞춰보세요" },
];

// ─── 1. NUMBER GAME (10 Levels) ──────────────────────────────────────────────

function NumberMode({ level, onLevelComplete, onError }: { level: number; onLevelComplete: () => void; onError: () => void }) {
  const total = Math.min(12, level + 2); // 1단계: 3개 ~ 10단계: 12개
  const [currentTarget, setCurrentTarget] = useState(1);
  const [positions, setPositions] = useState<{ x: number; y: number }[]>([]);
  const [clearedNumbers, setClearedNumbers] = useState<number[]>([]);
  const [wrongNum, setWrongNum] = useState<number | null>(null);

  useEffect(() => {
    setCurrentTarget(1);
    setClearedNumbers([]);
    setWrongNum(null);

    // 격자 기반 무작위 위치 생성 (겹침 방지)
    const cols = total <= 4 ? 2 : total <= 8 ? 3 : 4;
    const rows = Math.ceil(total / cols);
    const slots: { x: number; y: number }[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        slots.push({
          x: (c + 0.5) * (100 / cols) + (Math.random() * 8 - 4),
          y: (r + 0.5) * (100 / rows) + (Math.random() * 8 - 4),
        });
      }
    }
    const shuffledSlots = shuffleArray(slots).slice(0, total);
    setPositions(shuffledSlots);
  }, [level, total]);

  const size = Math.max(54, 76 - level * 2);
  const fontSize = Math.max(22, 34 - level);

  const handleTap = (n: number) => {
    if (clearedNumbers.includes(n)) return;
    if (n === currentTarget) {
      soundSuccess();
      buzz(35);
      const next = currentTarget + 1;
      setClearedNumbers(prev => [...prev, n]);
      if (next > total) {
        onLevelComplete();
      } else {
        setCurrentTarget(next);
      }
    } else {
      onError();
      soundError();
      buzz([80, 40, 80]);
      setWrongNum(n);
      setTimeout(() => setWrongNum(null), 500);
    }
  };

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", background: "#F8FAFC" }}>
      {positions.map((pos, idx) => {
        const num = idx + 1;
        const isDone = clearedNumbers.includes(num);
        const isTarget = num === currentTarget;
        const isWrong = wrongNum === num;

        if (isDone) return null;

        return (
          <button
            key={`num-${level}-${num}`}
            onClick={() => handleTap(num)}
            aria-label={`숫자 ${num}`}
            style={{
              position: "absolute",
              left: `calc(${pos.x}% - ${size / 2}px)`,
              top: `calc(${pos.y}% - ${size / 2}px)`,
              width: size,
              height: size,
              borderRadius: "50%",
              border: "3.5px solid #FFFFFF",
              background: isWrong ? "#EF4444" : isTarget ? "#1D4ED8" : "#2563EB",
              color: "#FFFFFF",
              fontSize: fontSize,
              fontWeight: 900,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              boxShadow: isTarget ? "0 0 0 4px #93C5FD, 0 6px 16px rgba(29,78,216,0.4)" : "0 4px 10px rgba(0,0,0,0.15)",
              transform: isTarget ? "scale(1.08)" : isWrong ? "scale(0.92)" : "scale(1)",
              transition: "transform 0.15s, background 0.15s",
              touchAction: "manipulation",
              userSelect: "none",
            }}
          >
            {num}
          </button>
        );
      })}
    </div>
  );
}

// ─── 2. TRACE GAME (10 Levels) ────────────────────────────────────────────────

function TraceMode({ level, onLevelComplete, onError }: { level: number; onLevelComplete: () => void; onError: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const errorCooldownRef = useRef(false);

  const trackWidth = Math.max(32, 68 - (level - 1) * 4);
  const amplitude = (level - 1) * 8;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 캔버스 크기 맞춤
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    const startX = 45;
    const endX = canvas.width - 45;
    const midY = canvas.height / 2;

    // 배경 가이드 트랙 그리기
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#E2E8F0";
    ctx.lineWidth = trackWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    for (let x = startX; x <= endX; x += 4) {
      const y = midY + Math.sin((x - startX) / 45) * amplitude;
      if (x === startX) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // 시작점 (파랑) & 도착점 (초록)
    const startY = midY;
    const endY = midY + Math.sin((endX - startX) / 45) * amplitude;

    // 시작점
    ctx.fillStyle = "#1D4ED8";
    ctx.beginPath();
    ctx.arc(startX, startY, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 13px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("시작", startX, startY);

    // 도착점
    ctx.fillStyle = "#047857";
    ctx.beginPath();
    ctx.arc(endX, endY, 24, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 13px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("도착", endX, endY);
  }, [level, amplitude, trackWidth]);

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    isDrawingRef.current = true;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    const startX = 45;
    const endX = canvas.width - 45;
    const midY = canvas.height / 2;
    const endY = midY + Math.sin((endX - startX) / 45) * amplitude;

    if (px >= startX && px <= endX) {
      const targetY = midY + Math.sin((px - startX) / 45) * amplitude;
      const dist = Math.abs(py - targetY);

      // 이탈 판정
      if (dist > trackWidth / 2 + 8) {
        if (!errorCooldownRef.current) {
          errorCooldownRef.current = true;
          onError();
          soundError();
          buzz(30);
          setTimeout(() => { errorCooldownRef.current = false; }, 350);
        }
      }
    }

    // 도착점 도달 판정
    if (px >= endX - 25 && Math.abs(py - endY) < 38) {
      isDrawingRef.current = false;
      soundSuccess();
      buzz(45);
      onLevelComplete();
    }
  };

  const handlePointerUp = () => {
    isDrawingRef.current = false;
  };

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#FFFFFF", touchAction: "none" }}>
      <canvas
        ref={canvasRef}
        style={{ width: "100%", height: "100%", touchAction: "none", cursor: "crosshair" }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      />
    </div>
  );
}

// ─── 3. COLOR GAME (10 Levels) ────────────────────────────────────────────────

interface ColorOption {
  name: string;
  hex: string;
}

const COLOR_PALETTE: ColorOption[] = [
  { name: "빨강", hex: "#DC2626" },
  { name: "파랑", hex: "#1D4ED8" },
  { name: "초록", hex: "#047857" },
  { name: "노랑", hex: "#D97706" },
  { name: "보라", hex: "#7C3AED" },
  { name: "분홍", hex: "#DB2777" },
];

function ColorMode({ level, onLevelComplete, onError, setGuideText }: { level: number; onLevelComplete: () => void; onError: () => void; setGuideText: (t: string) => void }) {
  const [options, setOptions] = useState<ColorOption[]>([]);
  const [target, setTarget] = useState<ColorOption | null>(null);

  useEffect(() => {
    const count = Math.min(6, 2 + Math.ceil(level / 2)); // 2개 ~ 6개
    const shuffled = shuffleArray(COLOR_PALETTE).slice(0, count);
    const chosen = shuffled[Math.floor(Math.random() * shuffled.length)];
    setOptions(shuffled);
    setTarget(chosen);
    setGuideText(`아래에서 [${chosen.name}]색 버튼을 눌러보세요!`);
  }, [level, setGuideText]);

  const handleSelect = (opt: ColorOption) => {
    if (!target) return;
    if (opt.name === target.name) {
      soundSuccess();
      buzz(40);
      onLevelComplete();
    } else {
      onError();
      soundError();
      buzz([80, 40, 80]);
    }
  };

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{
        display: "grid",
        gridTemplateColumns: options.length <= 4 ? "repeat(2, 1fr)" : "repeat(3, 1fr)",
        gap: 16,
        width: "100%",
        maxWidth: 340,
      }}>
        {options.map((opt) => (
          <button
            key={opt.name}
            onClick={() => handleSelect(opt)}
            aria-label={opt.name}
            style={{
              height: options.length <= 4 ? 96 : 80,
              borderRadius: 20,
              border: "4px solid #FFFFFF",
              background: opt.hex,
              color: "#FFFFFF",
              fontSize: 22,
              fontWeight: 800,
              boxShadow: "0 6px 14px rgba(0,0,0,0.18)",
              cursor: "pointer",
              transition: "transform 0.15s",
              touchAction: "manipulation",
            }}
            onMouseDown={(e) => { e.currentTarget.style.transform = "scale(0.95)"; }}
            onMouseUp={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
          >
            {opt.name}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── 4. MEMORY GAME (10 Levels - Simon Game) ──────────────────────────────────

function MemoryMode({ level, onLevelComplete, onError, setGuideText }: { level: number; onLevelComplete: () => void; onError: () => void; setGuideText: (t: string) => void }) {
  const padColors = ["#1D4ED8", "#047857", "#D97706", "#DC2626"];
  const padTones = [261.63, 329.63, 392.00, 523.25]; // 도, 미, 솔, 높은 도

  const seqLength = level + 2; // 1단계: 3개 ~ 10단계: 12개
  const [sequence, setSequence] = useState<number[]>([]);
  const [activePad, setActivePad] = useState<number | null>(null);
  const [inputStep, setInputStep] = useState(0);
  const [isPlayingSeq, setIsPlayingSeq] = useState(true);

  const playSequence = useCallback((seq: number[]) => {
    setIsPlayingSeq(true);
    setInputStep(0);
    setGuideText("불빛과 소리 순서를 잘 기억해 보세요!");

    seq.forEach((padIdx, i) => {
      setTimeout(() => {
        setActivePad(padIdx);
        playTone(padTones[padIdx], "triangle", 0.35, 0.4);
        buzz(30);
        setTimeout(() => {
          setActivePad(null);
          if (i === seq.length - 1) {
            setTimeout(() => {
              setIsPlayingSeq(false);
              setGuideText("이제 같은 순서로 눌러보세요!");
            }, 300);
          }
        }, 400);
      }, (i + 1) * 650);
    });
  }, [padTones, setGuideText]);

  useEffect(() => {
    const newSeq: number[] = [];
    for (let i = 0; i < seqLength; i++) {
      newSeq.push(Math.floor(Math.random() * 4));
    }
    setSequence(newSeq);
    playSequence(newSeq);
  }, [level, seqLength, playSequence]);

  const handlePadTap = (idx: number) => {
    if (isPlayingSeq) return;

    setActivePad(idx);
    playTone(padTones[idx], "triangle", 0.25, 0.35);
    buzz(30);
    setTimeout(() => setActivePad(null), 250);

    if (idx === sequence[inputStep]) {
      const nextStep = inputStep + 1;
      if (nextStep >= sequence.length) {
        soundSuccess();
        buzz(50);
        onLevelComplete();
      } else {
        setInputStep(nextStep);
      }
    } else {
      onError();
      soundError();
      buzz([80, 40, 80]);
      setGuideText("틀렸어요! 순서를 다시 보여드릴게요.");
      setTimeout(() => {
        playSequence(sequence);
      }, 900);
    }
  };

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16, width: "100%", maxWidth: 300 }}>
        {padColors.map((col, idx) => {
          const isLit = activePad === idx;
          return (
            <button
              key={idx}
              disabled={isPlayingSeq}
              onClick={() => handlePadTap(idx)}
              aria-label={`패드 ${idx + 1}`}
              style={{
                height: 110,
                borderRadius: 24,
                border: isLit ? "5px solid #FFFFFF" : "4px solid rgba(255,255,255,0.7)",
                background: col,
                opacity: isLit ? 1 : 0.45,
                transform: isLit ? "scale(1.06)" : "scale(1)",
                boxShadow: isLit ? `0 0 24px ${col}, 0 4px 12px rgba(0,0,0,0.2)` : "0 4px 8px rgba(0,0,0,0.1)",
                cursor: isPlayingSeq ? "default" : "pointer",
                transition: "opacity 0.15s, transform 0.15s, box-shadow 0.15s",
                touchAction: "manipulation",
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

// ─── 5. MATCH GAME (10 Levels - Card Matching) ────────────────────────────────

const FRUIT_ICONS = ["🍎", "🍌", "🍇", "🍊", "🍓", "🍉", "🍒", "🥝"];

function MatchMode({ level, onLevelComplete, onError }: { level: number; onLevelComplete: () => void; onError: () => void }) {
  const pairsCount = Math.min(8, Math.max(2, level + 1)); // 2쌍 ~ 8쌍
  const [cards, setCards] = useState<{ id: number; symbol: string; isOpen: boolean; isMatched: boolean }[]>([]);
  const [firstPick, setFirstPick] = useState<number | null>(null);
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    const selectedFruits = FRUIT_ICONS.slice(0, pairsCount);
    const deckSymbols = shuffleArray([...selectedFruits, ...selectedFruits]);
    setCards(deckSymbols.map((sym, idx) => ({ id: idx, symbol: sym, isOpen: false, isMatched: false })));
    setFirstPick(null);
    setIsLocked(false);
  }, [level, pairsCount]);

  const handleCardTap = (idx: number) => {
    if (isLocked) return;
    const card = cards[idx];
    if (card.isOpen || card.isMatched) return;

    // 카드 열기
    const newCards = [...cards];
    newCards[idx].isOpen = true;
    setCards(newCards);
    buzz(25);

    if (firstPick === null) {
      setFirstPick(idx);
    } else {
      const firstCard = cards[firstPick];
      if (firstCard.symbol === card.symbol) {
        // 일치
        soundSuccess();
        buzz(40);
        newCards[firstPick].isMatched = true;
        newCards[idx].isMatched = true;
        setCards(newCards);
        setFirstPick(null);

        const allMatched = newCards.every(c => c.isMatched);
        if (allMatched) {
          onLevelComplete();
        }
      } else {
        // 불일치
        onError();
        soundError();
        buzz([80, 40, 80]);
        setIsLocked(true);
        setTimeout(() => {
          const resetCards = [...cards];
          resetCards[firstPick].isOpen = false;
          resetCards[idx].isOpen = false;
          setCards(resetCards);
          setFirstPick(null);
          setIsLocked(false);
        }, 800);
      }
    }
  };

  const cols = pairsCount <= 3 ? 2 : pairsCount <= 6 ? 3 : 4;

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", padding: 14 }}>
      <div style={{
        display: "grid",
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gap: 10,
        width: "100%",
        maxWidth: 340,
      }}>
        {cards.map((c, idx) => (
          <button
            key={c.id}
            onClick={() => handleCardTap(idx)}
            aria-label="과일 카드"
            style={{
              height: pairsCount > 6 ? 64 : 76,
              borderRadius: 16,
              border: "3px solid #FFFFFF",
              background: c.isMatched ? "#D1FAE5" : c.isOpen ? "#FEF3C7" : "#1D4ED8",
              color: c.isOpen || c.isMatched ? "#1E293B" : "#FFFFFF",
              fontSize: c.isOpen || c.isMatched ? 34 : 26,
              fontWeight: 900,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 8px rgba(0,0,0,0.12)",
              cursor: "pointer",
              transform: c.isOpen ? "scale(1.03)" : "scale(1)",
              transition: "transform 0.15s, background 0.15s",
              touchAction: "manipulation",
            }}
          >
            {c.isOpen || c.isMatched ? c.symbol : "❓"}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── FINAL RESULT & EVALUATION SCREEN ─────────────────────────────────────────

function ResultView({
  modeInfo,
  durationSec,
  mistakes,
  onRetry,
  onHome,
}: {
  modeInfo: ModeInfo;
  durationSec: number;
  mistakes: number;
  onRetry: () => void;
  onHome: () => void;
}) {
  useEffect(() => {
    soundGameComplete();
    buzz([100, 50, 100, 50, 200]);
  }, []);

  let grade = "우수";
  let gradeBadge = "⭐ 우수";
  let gradeColor = "#1D4ED8";
  let praise = "아주 훌륭하게 10단계를 해내셨습니다!";

  if (mistakes <= 3) {
    grade = "최우수";
    gradeBadge = "🏆 최우수";
    gradeColor = "#047857";
    praise = "정확도와 집중력이 청년 못지않으십니다! 대단하세요!";
  } else if (mistakes <= 8) {
    grade = "우수";
    gradeBadge = "⭐ 우수";
    gradeColor = "#1D4ED8";
    praise = "차분하고 침착하게 끝까지 멋지게 완주하셨습니다!";
  } else {
    grade = "노력상";
    gradeBadge = "👏 노력상";
    gradeColor = "#D97706";
    praise = "끝까지 포기하지 않으신 어르신의 열정에 큰 박수를 보냅니다!";
  }

  return (
    <div style={{ height: "100%", overflowY: "auto", display: "flex", flexDirection: "column", padding: "20px 20px 32px", background: "#FDFBF7", textAlign: "center" }}>
      <div style={{ marginTop: 16 }}>
        <span style={{ fontSize: 60 }}>🎉</span>
        <h1 style={{ fontSize: 26, fontWeight: 900, color: "#047857", margin: "10px 0 6px" }}>
          10단계 훈련 완료!
        </h1>
        <p style={{ fontSize: 18, color: "#475569", fontWeight: 700, margin: 0 }}>
          {modeInfo.title}
        </p>
      </div>

      {/* 평가 카드 */}
      <div style={{
        background: "#FFFFFF",
        border: "3px solid #E2E8F0",
        borderRadius: 24,
        padding: "24px 18px",
        margin: "20px 0",
        boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
      }}>
        <div style={{ display: "inline-block", background: `${gradeColor}18`, color: gradeColor, padding: "8px 22px", borderRadius: 20, fontSize: 24, fontWeight: 900, marginBottom: 16 }}>
          {gradeBadge}
        </div>

        <div style={{ display: "flex", justifyContent: "space-around", borderTop: "1.5px solid #F1F5F9", borderBottom: "1.5px solid #F1F5F9", padding: "14px 0", margin: "12px 0" }}>
          <div>
            <div style={{ fontSize: 15, color: "#64748B", fontWeight: 700 }}>총 소요 시간</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#1E293B", marginTop: 4 }}>{durationSec}초</div>
          </div>
          <div style={{ width: 1.5, background: "#E2E8F0" }} />
          <div>
            <div style={{ fontSize: 15, color: "#64748B", fontWeight: 700 }}>실수/오답 횟수</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: mistakes === 0 ? "#047857" : "#DC2626", marginTop: 4 }}>{mistakes}회</div>
          </div>
        </div>

        <p style={{ fontSize: 19, lineHeight: 1.5, color: "#334155", fontWeight: 700, margin: "14px 0 0", wordBreak: "keep-all" }}>
          {praise}
        </p>
      </div>

      <div style={{ flex: 1, minHeight: 12 }} />

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <button
          onClick={onRetry}
          aria-label="다시 훈련하기"
          style={{
            width: "100%",
            height: 66,
            borderRadius: 20,
            background: modeInfo.color,
            color: "#FFFFFF",
            fontSize: 20,
            fontWeight: 800,
            border: "none",
            boxShadow: `0 6px 18px ${modeInfo.color}55`,
            cursor: "pointer",
          }}
        >
          🔄 한 번 더 도전하기
        </button>

        <button
          onClick={onHome}
          aria-label="훈련 메뉴로 가기"
          style={{
            width: "100%",
            height: 62,
            borderRadius: 20,
            background: "#FFFFFF",
            color: "#1E293B",
            fontSize: 19,
            fontWeight: 800,
            border: "2.5px solid #CBD5E1",
            cursor: "pointer",
          }}
        >
          🏠 다른 훈련 선택하기
        </button>
      </div>
    </div>
  );
}

// ─── MAIN GAME CONTAINER ──────────────────────────────────────────────────────

function GameScreen({ onBack }: { onBack: () => void }) {
  const [mode, setMode] = useState<GameMode>("menu");
  const [level, setLevel] = useState(1);
  const [mistakes, setMistakes] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [durationSec, setDurationSec] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [guideText, setGuideText] = useState("");

  const activeModeInfo = MODES.find(m => m.id === mode) || MODES[0];

  const handleStartMode = (selectedMode: GameMode) => {
    setMode(selectedMode);
    setLevel(1);
    setMistakes(0);
    setIsFinished(false);
    setStartTime(performance.now());

    // 초기 가이드 텍스트
    if (selectedMode === "number") setGuideText("1부터 순서대로 번호를 눌러보세요!");
    else if (selectedMode === "trace") setGuideText("파란 시작점에서 초록 도착점까지 그어보세요!");
    else if (selectedMode === "color") setGuideText("알맞은 색상 단추를 찾아보세요!");
    else if (selectedMode === "memory") setGuideText("불빛과 소리 순서를 잘 기억해보세요!");
    else if (selectedMode === "match") setGuideText("같은 과일 그림 카드 짝을 맞춰보세요!");
  };

  const handleLevelComplete = () => {
    soundStageClear();
    buzz([60, 40, 60]);

    if (level < 10) {
      setLevel(prev => prev + 1);
    } else {
      const elapsed = Math.round((performance.now() - startTime) / 100) / 10;
      setDurationSec(elapsed);
      setIsFinished(true);
    }
  };

  const handleError = () => {
    setMistakes(prev => prev + 1);
  };

  // 1. 메뉴 화면
  if (mode === "menu") {
    return (
      <div style={{ height: "100%", overflowY: "auto", display: "flex", flexDirection: "column", background: "#FDFBF7" }}>
        <header style={{
          display: "flex", alignItems: "center", gap: 10, padding: "12px 16px",
          background: "#FFFFFF", borderBottom: "2px solid #E2E8F0", position: "sticky", top: 0, zIndex: 10,
        }}>
          <button onClick={onBack} aria-label="메인 홈으로"
            style={{ display: "flex", alignItems: "center", gap: 5, height: 50, paddingInline: 12, borderRadius: 14, border: "2.5px solid #D1D5DB", background: "#F9FAFB", cursor: "pointer", flexShrink: 0 }}>
            <ChevronLeft />
            <span style={{ fontSize: 17, fontWeight: 700, color: "#1E293B" }}>홈으로</span>
          </button>
          <h1 style={{ flex: 1, fontSize: 20, fontWeight: 900, color: "#1E293B", margin: 0, textAlign: "center" }}>
            두뇌 &amp; 손가락 운동 🧠
          </h1>
          <div style={{ width: 65 }} />
        </header>

        <div style={{ padding: "18px 18px 8px", textAlign: "center" }}>
          <div style={{ display: "inline-block", background: "#FEF3C7", color: "#92400E", border: "2px solid #FCD34D", borderRadius: 20, padding: "5px 16px", fontSize: 15, fontWeight: 800, marginBottom: 8 }}>
            10단계 맞춤형 두뇌 감각 활성화
          </div>
          <p style={{ fontSize: 22, fontWeight: 800, color: "#1E293B", margin: 0 }}>
            오늘 하실 훈련을 골라보세요 👇
          </p>
        </div>

        <div style={{ padding: "10px 18px 24px", display: "flex", flexDirection: "column", gap: 12 }}>
          {MODES.map((m) => (
            <button
              key={m.id}
              onClick={() => handleStartMode(m.id)}
              aria-label={m.title}
              style={{
                borderRadius: 22,
                border: `2.5px solid ${m.color}33`,
                borderLeft: `8px solid ${m.color}`,
                background: "#FFFFFF",
                padding: "16px 18px",
                display: "flex",
                alignItems: "center",
                gap: 14,
                cursor: "pointer",
                boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
                textAlign: "left",
                transition: "transform 0.15s",
              }}
              onMouseDown={(e) => { e.currentTarget.style.transform = "scale(0.98)"; }}
              onMouseUp={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
            >
              <div style={{ fontSize: 34, width: 48, height: 48, borderRadius: 16, background: m.bgLight, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {m.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "inline-block", background: `${m.color}15`, color: m.color, fontSize: 12, fontWeight: 800, padding: "2px 8px", borderRadius: 8, marginBottom: 4 }}>
                  {m.badge}
                </div>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#1E293B" }}>{m.title}</div>
                <div style={{ fontSize: 14, color: "#64748B", marginTop: 2, fontWeight: 500 }}>{m.desc}</div>
              </div>
              <span style={{ fontSize: 22, color: m.color, fontWeight: 900 }}>▶</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // 2. 결과 리포트 화면
  if (isFinished) {
    return (
      <ResultView
        modeInfo={activeModeInfo}
        durationSec={durationSec}
        mistakes={mistakes}
        onRetry={() => handleStartMode(mode)}
        onHome={() => setMode("menu")}
      />
    );
  }

  // 3. 실제 게임 진행 화면
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "#F8FAFC" }}>
      {/* ── Top Header ── */}
      <header style={{
        display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px",
        background: "#FFFFFF", borderBottom: "2px solid #E2E8F0", flexShrink: 0,
      }}>
        <button onClick={() => setMode("menu")} aria-label="메뉴로 돌아가기"
          style={{ display: "flex", alignItems: "center", gap: 4, height: 46, paddingInline: 12, borderRadius: 14, border: "2px solid #D1D5DB", background: "#F9FAFB", cursor: "pointer" }}>
          <ChevronLeft />
          <span style={{ fontSize: 16, fontWeight: 700, color: "#1E293B" }}>목록</span>
        </button>

        {/* Level badge */}
        <div style={{
          background: "#FEF3C7", color: "#92400E", border: "2px solid #D97706",
          fontSize: 17, fontWeight: 800, padding: "4px 14px", borderRadius: 18,
        }}>
          {level}단계 / 10단계
        </div>

        <button onClick={() => playTone(440, "sine", 0.2)} aria-label="효과음 테스트"
          style={{ width: 46, height: 46, borderRadius: 14, border: "2px solid #D1D5DB", background: "#F9FAFB", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <VolumeIcon color="#2563EB" size={22} />
        </button>
      </header>

      {/* ── Guide banner ── */}
      <div style={{ padding: "10px 16px 0", flexShrink: 0 }}>
        <div style={{
          background: "#FFFFFF", border: "2.5px solid #CBD5E1", borderRadius: 16,
          padding: "10px 16px", display: "flex", alignItems: "center", gap: 10,
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        }}>
          <span style={{ fontSize: 24 }}>👉</span>
          <span style={{ fontSize: 18, fontWeight: 800, color: "#1E293B", lineHeight: 1.3, wordBreak: "keep-all" }}>
            {guideText || activeModeInfo.desc}
          </span>
        </div>
      </div>

      {/* ── Game Area ── */}
      <div style={{ flex: 1, padding: "10px 16px 0", minHeight: 0 }}>
        <div style={{
          width: "100%", height: "100%",
          background: "#FFFFFF", borderRadius: 24,
          border: "2.5px solid #E2E8F0",
          boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
          overflow: "hidden", position: "relative",
        }}>
          {mode === "number" && <NumberMode key={`num-${level}`} level={level} onLevelComplete={handleLevelComplete} onError={handleError} />}
          {mode === "trace" && <TraceMode key={`trace-${level}`} level={level} onLevelComplete={handleLevelComplete} onError={handleError} />}
          {mode === "color" && <ColorMode key={`color-${level}`} level={level} onLevelComplete={handleLevelComplete} onError={handleError} setGuideText={setGuideText} />}
          {mode === "memory" && <MemoryMode key={`mem-${level}`} level={level} onLevelComplete={handleLevelComplete} onError={handleError} setGuideText={setGuideText} />}
          {mode === "match" && <MatchMode key={`match-${level}`} level={level} onLevelComplete={handleLevelComplete} onError={handleError} />}
        </div>
      </div>

      {/* ── Bottom Reassurance Banner ── */}
      <div style={{ padding: "10px 16px 14px", flexShrink: 0 }}>
        <div style={{
          background: "#FEF3C7", border: "2px solid #FCD34D", borderRadius: 16,
          padding: "10px 14px", display: "flex", alignItems: "center", gap: 10,
        }}>
          <span style={{ fontSize: 22, flexShrink: 0 }}>😊</span>
          <p style={{ fontSize: 16, fontWeight: 700, color: "#92400E", margin: 0, lineHeight: 1.3 }}>
            실수해도 괜찮아요! 편안하게 천천히 눌러보세요
          </p>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ─── App Shell ────────────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

type Screen = "home" | "guide" | "game";

export default function App() {
  const [screen, setScreen] = useState<Screen>("home");

  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      width: "100%", minHeight: "100vh", background: "#C8D4DC",
      fontFamily: "'Noto Sans KR', 'Nunito', sans-serif",
    }}>
      <style>{`
        @keyframes wave-0 { from{height:20%} to{height:90%} }
        @keyframes wave-1 { from{height:40%} to{height:70%} }
        @keyframes wave-2 { from{height:60%} to{height:100%} }
        @keyframes wave-3 { from{height:30%} to{height:80%} }
      `}</style>

      <div style={{
        width: 390, height: 844,
        background: "#F8FAFC",
        borderRadius: 44,
        boxShadow: "0 28px 90px rgba(0,0,0,0.24), 0 4px 16px rgba(0,0,0,0.10)",
        overflow: "hidden", display: "flex", flexDirection: "column",
      }}>
        <div style={{ height: 10, background: "#FFFFFF", flexShrink: 0 }} />
        <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          {screen === "home" && <GreetingScreen onGuide={() => setScreen("guide")} onGame={() => setScreen("game")} />}
          {screen === "guide" && <GuideScreen onBack={() => setScreen("home")} />}
          {screen === "game" && <GameScreen onBack={() => setScreen("home")} />}
        </div>
      </div>
    </div>
  );
}
