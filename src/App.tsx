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

function GuideScreen({ onBack }: { onBack: () => void }) {
  const [audioActive, setAudioActive] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toggle = () => {
    setAudioActive(prev => {
      if (!prev) { timerRef.current = setTimeout(() => setAudioActive(false), 6000); return true; }
      if (timerRef.current) clearTimeout(timerRef.current);
      return false;
    });
  };
  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  return (
    <div style={{ height: "100%", overflowY: "auto", display: "flex", flexDirection: "column" }}>
      <header style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 18px", background: "#FFFFFF", borderBottom: "2px solid #E5E7EB", position: "sticky", top: 0, zIndex: 10 }}>
        <button onClick={onBack} aria-label="뒤로 가기" style={{ display: "flex", alignItems: "center", gap: 6, height: 52, paddingInline: 14, borderRadius: 16, border: "2.5px solid #D1D5DB", background: "#F9FAFB", cursor: "pointer" }}>
          <ChevronLeft />
          <span style={{ fontSize: 18, fontWeight: 700, color: "#1A1A1A" }}>뒤로 가기</span>
        </button>
        <h1 style={{ flex: 1, fontSize: 20, fontWeight: 800, color: "#1A1A1A", margin: 0, textAlign: "center", paddingRight: 8 }}>리모컨 켜는 법</h1>
      </header>

      <div style={{ padding: "20px 20px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20, background: "#1E293B", borderRadius: 24, padding: "18px 20px", boxShadow: "0 4px 18px rgba(0,0,0,0.18)" }}>
          <div style={{ width: 88, height: 120, borderRadius: 16, border: "3px solid #334155", background: "#334155", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <RemoteIllustration />
          </div>
          <div>
            <div style={{ display: "inline-block", background: "#F59E0B", borderRadius: 8, padding: "3px 10px", marginBottom: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#1A1A1A" }}>삼성 에어컨</span>
            </div>
            <p style={{ fontSize: 22, fontWeight: 800, color: "#FFFFFF", margin: 0, lineHeight: 1.3 }}>에어컨<br />리모컨</p>
            <p style={{ fontSize: 15, color: "#94A3B8", margin: 0, marginTop: 6 }}>방금 촬영한 기기</p>
          </div>
        </div>
      </div>

      <div style={{ padding: "20px 20px 0", display: "flex", flexDirection: "column", gap: 14 }}>
        <p style={{ fontSize: 17, fontWeight: 700, color: "#6B7280", margin: 0, marginBottom: 2 }}>순서대로 따라 해 보세요 👇</p>
        <StepCard number={1} accent="#EA580C">
          <p style={{ fontSize: 20, fontWeight: 500, color: "#1A1A1A", margin: 0, lineHeight: 1.6 }}>맨 위 주황색 <Highlight>[전원]</Highlight> 단추를 한 번 꾹 누르세요.</p>
        </StepCard>
        <StepCard number={2} accent="#1D4ED8">
          <p style={{ fontSize: 20, fontWeight: 500, color: "#1A1A1A", margin: 0, lineHeight: 1.6 }}>아래 <Highlight>[온도 올림/내림]</Highlight> 단추로 <strong>24도</strong>를 맞추세요.</p>
        </StepCard>
        <StepCard number={3} accent="#059669">
          <p style={{ fontSize: 20, fontWeight: 500, color: "#1A1A1A", margin: 0, lineHeight: 1.6 }}>찬바람이 나오면 <Highlight>[바람세기]</Highlight> 단추를 누르세요.</p>
        </StepCard>
      </div>

      <div style={{ padding: "20px 20px 0" }}>
        <button onClick={toggle} aria-label="소리로 다시 듣기"
          style={{ width: "100%", height: 68, borderRadius: 20, background: audioActive ? "#EFF6FF" : "#FFFFFF", border: `2.5px solid ${audioActive ? "#1D4ED8" : "#CBD5E1"}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", cursor: "pointer", transition: "all 0.2s", boxShadow: audioActive ? "0 0 0 3px #BFDBFE66" : "0 2px 8px rgba(0,0,0,0.06)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <SpeakerIcon color={audioActive ? "#1D4ED8" : "#374151"} />
            <span style={{ fontSize: 20, fontWeight: 700, color: audioActive ? "#1D4ED8" : "#1A1A1A" }}>소리로 다시 듣기 🔊</span>
          </div>
          <AudioWave active={audioActive} />
        </button>
      </div>

      <div style={{ flex: 1, minHeight: 16 }} />

      <div style={{ padding: "0 20px 36px" }}>
        <button onClick={onBack} aria-label="다 됐어요! 홈으로 가기"
          style={{ width: "100%", height: 72, borderRadius: 22, background: "#1A1A2E", border: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 12, cursor: "pointer", boxShadow: "0 6px 24px rgba(0,0,0,0.30)" }}
          onMouseDown={e => { e.currentTarget.style.transform = "scale(0.97)"; }}
          onMouseUp={e => { e.currentTarget.style.transform = "scale(1)"; }}>
          <HomeIcon />
          <span style={{ fontSize: 21, fontWeight: 800, color: "#FFFFFF" }}>다 됐어요! 홈으로 가기</span>
        </button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ─── SCREEN 3: Cognitive / Fine-motor Training ────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

// Scattered positions for number circles (% of container)
const NUMBER_POSITIONS = [
  { x: 18, y: 12 },
  { x: 60, y: 28 },
  { x: 22, y: 54 },
  { x: 68, y: 60 },
  { x: 42, y: 80 },
];

// Trace path points (% of container width/height)
const TRACE_POINTS = [
  { x: 15, y: 20 },
  { x: 35, y: 55 },
  { x: 60, y: 30 },
  { x: 75, y: 65 },
  { x: 88, y: 85 },
];

type GameMode = "number" | "trace";

function NumberGame({ onComplete }: { onComplete: () => void }) {
  const [nextTarget, setNextTarget] = useState(1);
  const [tapped, setTapped] = useState<number[]>([]);
  const [flash, setFlash] = useState<number | null>(null);
  const [wrong, setWrong] = useState<number | null>(null);
  const done = tapped.length === 5;

  useEffect(() => {
    if (done) { const t = setTimeout(onComplete, 1800); return () => clearTimeout(t); }
  }, [done, onComplete]);

  const handleTap = (n: number) => {
    if (tapped.includes(n)) return;
    if (n === nextTarget) {
      setFlash(n);
      setTapped(prev => [...prev, n]);
      setNextTarget(prev => prev + 1);
      setTimeout(() => setFlash(null), 500);
    } else {
      setWrong(n);
      setTimeout(() => setWrong(null), 600);
    }
  };

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      {/* connecting line ghost */}
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
        {tapped.slice(0, -1).map((n, i) => {
          const a = NUMBER_POSITIONS[n - 1];
          const b = NUMBER_POSITIONS[tapped[i + 1] - 1];
          if (!b) return null;
          return (
            <line key={i}
              x1={`${a.x + 9.6}%`} y1={`${a.y + 9.6}%`}
              x2={`${b.x + 9.6}%`} y2={`${b.y + 9.6}%`}
              stroke="#10B981" strokeWidth="3" strokeDasharray="6 4" strokeLinecap="round" />
          );
        })}
      </svg>

      {NUMBER_POSITIONS.map((pos, idx) => {
        const n = idx + 1;
        const isDone = tapped.includes(n);
        const isFlash = flash === n;
        const isWrong = wrong === n;
        const isNext = n === nextTarget && !done;
        return (
          <button
            key={n}
            onClick={() => handleTap(n)}
            aria-label={`숫자 ${n}`}
            style={{
              position: "absolute",
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              width: 76,
              height: 76,
              borderRadius: "50%",
              border: "none",
              background: isDone ? "#10B981" : isWrong ? "#EF4444" : "#2563EB",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transform: isFlash ? "scale(1.18)" : isWrong ? "scale(0.92)" : isNext ? "scale(1.06)" : "scale(1)",
              transition: "transform 0.18s, background 0.18s",
              boxShadow: isDone
                ? "0 4px 16px rgba(16,185,129,0.45)"
                : isNext
                  ? "0 0 0 5px #BFDBFE, 0 4px 16px rgba(37,99,235,0.40)"
                  : "0 4px 14px rgba(37,99,235,0.30)",
              zIndex: 2,
            }}
          >
            {isDone
              ? <CheckIcon />
              : <span style={{ fontSize: 32, fontWeight: 800, color: "#FFFFFF", lineHeight: 1 }}>{n}</span>}
          </button>
        );
      })}

      {done && (
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "rgba(240,253,244,0.92)", borderRadius: 20, zIndex: 10 }}>
          <div style={{ fontSize: 56, marginBottom: 8 }}>🎉</div>
          <p style={{ fontSize: 24, fontWeight: 800, color: "#065F46", textAlign: "center", margin: 0 }}>잘 하셨어요!</p>
          <p style={{ fontSize: 18, color: "#047857", margin: "8px 0 0", textAlign: "center" }}>모든 숫자를 눌렀어요!</p>
        </div>
      )}
    </div>
  );
}

function TraceGame({ onComplete }: { onComplete: () => void }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [path, setPath] = useState<{ x: number; y: number }[]>([]);
  const [drawing, setDrawing] = useState(false);
  const [done, setDone] = useState(false);
  const [progress, setProgress] = useState(0);

  const getPoint = (e: React.PointerEvent<SVGSVGElement>) => {
    const rect = svgRef.current!.getBoundingClientRect();
    return { x: ((e.clientX - rect.left) / rect.width) * 100, y: ((e.clientY - rect.top) / rect.height) * 100 };
  };

  const onPointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (done) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setDrawing(true);
    setPath([getPoint(e)]);
  };

  const onPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!drawing || done) return;
    const pt = getPoint(e);
    setPath(prev => {
      const next = [...prev, pt];
      // estimate how much of guide path is covered
      let covered = 0;
      TRACE_POINTS.forEach(tp => {
        if (next.some(p => Math.hypot(p.x - tp.x, p.y - tp.y) < 12)) covered++;
      });
      const pct = Math.round((covered / TRACE_POINTS.length) * 100);
      setProgress(pct);
      if (pct === 100) { setDone(true); setTimeout(onComplete, 1800); }
      return next;
    });
  };

  const onPointerUp = () => setDrawing(false);

  const polyline = path.map(p => `${p.x},${p.y}`).join(" ");

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <svg ref={svgRef} viewBox="0 0 100 100" preserveAspectRatio="none"
        style={{ width: "100%", height: "100%", touchAction: "none", cursor: "crosshair" }}
        onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp}>

        {/* Guide path */}
        <polyline points={TRACE_POINTS.map(p => `${p.x},${p.y}`).join(" ")}
          fill="none" stroke="#CBD5E1" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="3 3" />

        {/* Guide dots */}
        {TRACE_POINTS.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="4.5" fill={done ? "#10B981" : "#94A3B8"} />
            {i === 0 && !done && (
              <text x={p.x} y={p.y - 6} textAnchor="middle" fontSize="4" fill="#475569" fontWeight="700">시작</text>
            )}
          </g>
        ))}

        {/* User's drawn path */}
        {path.length > 1 && (
          <polyline points={polyline} fill="none" stroke="#3B82F6" strokeWidth="4"
            strokeLinecap="round" strokeLinejoin="round" opacity="0.85" />
        )}
      </svg>

      {/* Progress bar */}
      <div style={{ position: "absolute", bottom: 10, left: 10, right: 10, height: 10, background: "#E2E8F0", borderRadius: 10, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${progress}%`, background: progress === 100 ? "#10B981" : "#3B82F6", borderRadius: 10, transition: "width 0.3s" }} />
      </div>

      {done && (
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "rgba(240,253,244,0.92)", borderRadius: 20, zIndex: 10 }}>
          <div style={{ fontSize: 56, marginBottom: 8 }}>✨</div>
          <p style={{ fontSize: 24, fontWeight: 800, color: "#065F46", margin: 0 }}>완벽해요!</p>
          <p style={{ fontSize: 18, color: "#047857", margin: "8px 0 0" }}>선을 따라 잘 그으셨어요!</p>
        </div>
      )}
    </div>
  );
}

function GameScreen({ onBack }: { onBack: () => void }) {
  const [mode, setMode] = useState<GameMode>("number");
  const [round, setRound] = useState(0);
  const [ttsActive, setTtsActive] = useState(false);

  const resetGame = useCallback(() => setRound(r => r + 1), []);

  const instructions: Record<GameMode, string> = {
    number: "1부터 5까지 순서대로 눌러보세요!",
    trace: "손가락으로 선을 따라 그어보세요!",
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "#F8FAFC" }}>

      {/* ── Header ── */}
      <header style={{
        display: "flex", alignItems: "center", gap: 10, padding: "12px 16px",
        background: "#FFFFFF", borderBottom: "2px solid #E2E8F0", flexShrink: 0,
      }}>
        <button onClick={onBack} aria-label="뒤로 가기"
          style={{ display: "flex", alignItems: "center", gap: 5, height: 52, paddingInline: 12, borderRadius: 14, border: "2.5px solid #D1D5DB", background: "#F9FAFB", cursor: "pointer", flexShrink: 0 }}>
          <ChevronLeft />
          <span style={{ fontSize: 17, fontWeight: 700, color: "#1E293B" }}>뒤로</span>
        </button>

        <h1 style={{ flex: 1, fontSize: 22, fontWeight: 800, color: "#1E293B", margin: 0, textAlign: "center" }}>
          두뇌 &amp; 손가락 운동 🧠
        </h1>

        <button onClick={() => setTtsActive(p => !p)} aria-label="소리 안내"
          style={{ width: 52, height: 52, borderRadius: 14, border: `2.5px solid ${ttsActive ? "#3B82F6" : "#D1D5DB"}`, background: ttsActive ? "#EFF6FF" : "#F9FAFB", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
          <VolumeIcon color={ttsActive ? "#2563EB" : "#475569"} size={24} />
        </button>
      </header>

      {/* ── Mode selector ── */}
      <div style={{ padding: "14px 16px 0", display: "flex", flexDirection: "column", gap: 10, flexShrink: 0 }}>
        <button onClick={() => { setMode("number"); resetGame(); }} aria-label="숫자 순서대로 누르기"
          style={{
            height: 66, borderRadius: 16, border: "none", cursor: "pointer",
            background: mode === "number" ? "#2563EB" : "#EFF6FF",
            display: "flex", alignItems: "center", paddingInline: 20, gap: 14,
            boxShadow: mode === "number" ? "0 4px 16px rgba(37,99,235,0.38)" : "0 2px 8px rgba(0,0,0,0.06)",
            transition: "all 0.18s",
          }}>
          <span style={{ fontSize: 28 }}>🔢</span>
          <span style={{ fontSize: 19, fontWeight: 700, color: mode === "number" ? "#FFFFFF" : "#1E40AF" }}>
            1. 숫자 순서대로 누르기 (1 to 5)
          </span>
          {mode === "number" && <span style={{ marginLeft: "auto", fontSize: 18, color: "white" }}>▶</span>}
        </button>

        <button onClick={() => { setMode("trace"); resetGame(); }} aria-label="선 따라 긋기"
          style={{
            height: 66, borderRadius: 16, border: "none", cursor: "pointer",
            background: mode === "trace" ? "#059669" : "#ECFDF5",
            display: "flex", alignItems: "center", paddingInline: 20, gap: 14,
            boxShadow: mode === "trace" ? "0 4px 16px rgba(5,150,105,0.38)" : "0 2px 8px rgba(0,0,0,0.06)",
            transition: "all 0.18s",
          }}>
          <span style={{ fontSize: 28 }}>✏️</span>
          <span style={{ fontSize: 19, fontWeight: 700, color: mode === "trace" ? "#FFFFFF" : "#065F46" }}>
            2. 선 따라 긋기 (Trace the Line)
          </span>
          {mode === "trace" && <span style={{ marginLeft: "auto", fontSize: 18, color: "white" }}>▶</span>}
        </button>
      </div>

      {/* ── Instruction banner ── */}
      <div style={{ padding: "12px 16px 0", flexShrink: 0 }}>
        <div style={{
          background: "#F1F5F9", border: "2px solid #CBD5E1", borderRadius: 14,
          padding: "12px 16px", display: "flex", alignItems: "center", gap: 10,
        }}>
          <span style={{ fontSize: 22 }}>👉</span>
          <span style={{ fontSize: 19, fontWeight: 700, color: "#475569" }}>{instructions[mode]}</span>
        </div>
      </div>

      {/* ── Game canvas ── */}
      <div style={{ flex: 1, padding: "12px 16px 0", minHeight: 0 }}>
        <div style={{
          width: "100%", height: "100%",
          background: "#FFFFFF", borderRadius: 24,
          border: "2px solid #E2E8F0",
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
          overflow: "hidden", position: "relative",
        }}>
          {mode === "number"
            ? <NumberGame key={`num-${round}`} onComplete={resetGame} />
            : <TraceGame key={`trace-${round}`} onComplete={resetGame} />
          }
        </div>
      </div>

      {/* ── Reassurance bar ── */}
      <div style={{ padding: "12px 16px 16px", flexShrink: 0 }}>
        <div style={{
          background: "#FEF3C7", border: "2px solid #FCD34D", borderRadius: 18,
          padding: "14px 18px", display: "flex", alignItems: "center", gap: 12,
        }}>
          <span style={{ fontSize: 26, flexShrink: 0 }}>😊</span>
          <p style={{ fontSize: 18, fontWeight: 600, color: "#92400E", margin: 0, lineHeight: 1.4 }}>
            실수해도 괜찮아요! 천천히 눌러보세요
          </p>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ─── App shell ────────────────────────────────────────────────────────────────
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
