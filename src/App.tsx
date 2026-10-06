import WeatherSummary from "./components/WeatherSummary";
import { useState, useEffect, useRef, useCallback } from "react";
import boyVideo from "../img/boy.mp4";
import girlVideo from "../img/girl.mp4";
import { AiAskCard } from "./components/AiAskCard";
import { MemoryScreen } from "./components/MemoryScreen";
import { GuideScreen } from "./components/GuideScreen";
import { NameEditModal } from "./components/NameEditModal";
import { ClayBrainIcon, ClayRetroMicIcon, ClayTulipPotIcon, PencilEditIcon } from "./components/ClayIcons";
import { CozySunlitBackdrop } from "./components/CozySunlitBackdrop";
import { BottomNavBar } from "./components/BottomNavBar";
import cozyRoomBg from "./assets/cozy_room_bg.jpg";
import { saveTrainingLog } from "./services/trainingService";

function VolumeIcon({ color = "#1A1A1A", size = 28 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path d="M8 11H4a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h4l7 6V5L8 11Z" fill={color} />
      <path d="M21 10.5a8 8 0 0 1 0 11M24.5 7.5a13 13 0 0 1 0 17" stroke={color} strokeWidth="2" strokeLinecap="round" />
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

// ══════════════════════════════════════════════════════════════════════════════
// ─── SCREEN 1: Greeting (Senior Warm & Accessible UI) ─────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

function GreetingScreen({
  onGuide,
  onGame,
  onMemory,
  childType = "boy",
  setChildType,
}: {
  onGuide: () => void;
  onGame: () => void;
  onMemory: () => void;
  childType?: "boy" | "girl";
  setChildType?: (t: "boy" | "girl") => void;
}) {
  const handleSelectChild = (type: "boy" | "girl") => {
    setIsVideoMuted(true);
    if (setChildType) {
      setChildType(type);
    }
  };
  const [isVideoMuted, setIsVideoMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  // 사용자 이름 관리 (localStorage 영구 고정 저장)
  const [userName, setUserName] = useState<string>(() => {
    try {
      return localStorage.getItem("senior_user_name") || "김영희";
    } catch {
      return "김영희";
    }
  });
  const [isNameModalOpen, setIsNameModalOpen] = useState(false);
  const [isAskModalOpen, setIsAskModalOpen] = useState(false);

  const handleSaveName = (newName: string) => {
    setUserName(newName);
    try {
      localStorage.setItem("senior_user_name", newName);
    } catch {}
  };

  // 비디오 터치 시 소리 켜기 및 다시 재생
  const handleVideoTouch = () => {
    const video = videoRef.current;
    if (!video) return;
    const nextMuted = !video.muted;
    video.muted = nextMuted;
    setIsVideoMuted(nextMuted);
    // 같은 요소를 유지해 사용자의 터치 안에서 소리를 켜고 재생합니다.
    video.play().catch(() => {
      video.muted = true;
      setIsVideoMuted(true);
    });
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "#FFFDF7", overflow: "hidden", position: "relative" }}>
      {/* ── 잔잔하고 따스한 햇살 & 방 안 풍경 배경 (Cozy Sunlit Room Backdrop) ── */}
      <CozySunlitBackdrop />

      {/* ── Scrollable Body Area ── */}
      <div style={{ flex: 1, minHeight: 0, overflowY: "auto", display: "flex", flexDirection: "column", paddingBottom: 16, gap: 16, position: "relative", zIndex: 1 }}>
        
        {/* ── 1. HEADER (날짜 & 날씨·온도 & 안녕하세요 00님) ── */}
        <header style={{ padding: "18px 20px 0", flexShrink: 0 }}>
          <WeatherSummary />

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginTop: 4 }}>
            <h1
              onClick={() => setIsNameModalOpen(true)}
              title="이름을 변경하시려면 눌러주세요"
              style={{ fontSize: 26, fontWeight: 900, color: "#252A2D", margin: 0, lineHeight: 1.3, cursor: "pointer", flex: 1 }}
            >
              안녕하세요, <span style={{ color: "#1B5E20", textDecoration: "underline", textUnderlineOffset: 4 }}>{userName}님</span> 👋
            </h1>
            <button
              onClick={() => setIsNameModalOpen(true)}
              aria-label="이름 변경하기"
              style={{
                minHeight: 48,
                padding: "10px 18px",
                borderRadius: 24,
                background: "#E8F5E9",
                border: "2.5px solid #1B5E20",
                color: "#1B5E20",
                fontSize: 16,
                fontWeight: 800,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
                flexShrink: 0,
                boxShadow: "0 3px 10px rgba(27,94,32,0.16)",
                transition: "all 0.15s ease",
              }}
            >
              <PencilEditIcon size={20} color="#1B5E20" />
              <span>이름 변경</span>
            </button>
          </div>
        </header>

        {/* ── 2. 손자 / 손녀 선택 UI (Segmented Control) ── */}
        <div style={{ padding: "0 20px", display: "flex", gap: 12, flexShrink: 0 }}>
          <button
            onClick={() => handleSelectChild("boy")}
            aria-label="손자와 함께 선택"
            style={{
              flex: 1,
              height: 52,
              borderRadius: 18,
              border: childType === "boy" ? "2.5px solid #26734D" : "2px solid #D9DEDA",
              background: childType === "boy" ? "#E7F4EC" : "#FFFFFF",
              color: childType === "boy" ? "#26734D" : "#626A6E",
              fontSize: 18,
              fontWeight: childType === "boy" ? 900 : 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              cursor: "pointer",
              boxShadow: childType === "boy" ? "0 4px 12px rgba(38,115,77,0.15)" : "none",
              transition: "all 0.15s ease",
            }}
          >
            <span style={{ fontSize: 22 }}>👦</span>
            <span>손자와 함께</span>
          </button>

          <button
            onClick={() => handleSelectChild("girl")}
            aria-label="손녀와 함께 선택"
            style={{
              flex: 1,
              height: 52,
              borderRadius: 18,
              border: childType === "girl" ? "2.5px solid #26734D" : "2px solid #D9DEDA",
              background: childType === "girl" ? "#E7F4EC" : "#FFFFFF",
              color: childType === "girl" ? "#26734D" : "#626A6E",
              fontSize: 18,
              fontWeight: childType === "girl" ? 900 : 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              cursor: "pointer",
              boxShadow: childType === "girl" ? "0 4px 12px rgba(38,115,77,0.15)" : "none",
              transition: "all 0.15s ease",
            }}
          >
            <span style={{ fontSize: 22 }}>👧</span>
            <span>손녀와 함께</span>
          </button>
        </div>

        {/* ── 3. AI 캐릭터 영상 (01.mp4 / 02.mp4) & 말풍선 (따스한 방 안 분위기) ── */}
        <div style={{ padding: "0 20px", flexShrink: 0 }}>
          <div style={{
            background: "linear-gradient(180deg, rgba(255, 253, 248, 0.95) 0%, rgba(254, 245, 230, 0.95) 100%)",
            border: "2px solid #F0DAC3",
            borderRadius: 22,
            padding: "12px 14px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            boxShadow: "0 6px 20px rgba(180,110,40,0.08)",
            position: "relative",
          }}>
            {/* 햇살 가득한 방 상단 미니 뱃지 */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 13,
              fontWeight: 800,
              color: "#92400E",
              marginBottom: 8,
              alignSelf: "flex-start",
              paddingLeft: 4,
            }}>
              <span>☀️</span>
              <span>따스한 방 안에서 함께하는 {childType === "boy" ? "손자" : "손녀"}</span>
            </div>

            {/* 캐릭터 영상 플레이 영역 */}
            <div
              onClick={handleVideoTouch}
              title="터치하시면 영상 소리를 켜거나 다시 재생합니다"
              style={{
                width: "100%",
                height: 168,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                borderRadius: 16,
                overflow: "hidden",
                background: "transparent",
                position: "relative",
              }}
            >
              <video
                ref={videoRef}
                key={childType}
                src={childType === "boy" ? boyVideo : girlVideo}
                autoPlay
                preload="auto"
                aria-label={childType === "boy" ? "손자 모드 영상" : "손녀 모드 영상"}
                playsInline
                muted={isVideoMuted}
                loop
                style={{
                  maxHeight: "100%",
                  maxWidth: "100%",
                  objectFit: "contain",
                  borderRadius: 16,
                }}
              />
              {/* 소리 상태 뱃지 */}
              <div
                style={{
                  position: "absolute",
                  bottom: 6,
                  right: 6,
                  background: "rgba(0,0,0,0.6)",
                  color: "#FFFFFF",
                  padding: "4px 8px",
                  borderRadius: 10,
                  fontSize: 12,
                  fontWeight: 800,
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <span>{isVideoMuted ? "🔇 터치하여 소리 켜기" : "🔊 소리 켜짐"}</span>
              </div>
            </div>

            {/* 어르신을 위한 친근한 말풍선 */}
            <div style={{
              width: "100%",
              background: "#FFFFFF",
              border: "1.5px solid #F2DFCC",
              borderRadius: 14,
              padding: "10px 14px",
              marginTop: 10,
              boxShadow: "0 2px 6px rgba(180,110,40,0.06)",
            }}>
              <p style={{ fontSize: 17, fontWeight: 800, color: "#252A2D", lineHeight: 1.4, margin: 0, textAlign: "center", wordBreak: "keep-all" }}>
                {childType === "boy"
                  ? `“${userName}님, 오늘도 같이 해볼까요? 5분만 두뇌 운동해요 😊”`
                  : `“${userName}님, 오늘 날씨 참 좋아요! 같이 5분 두뇌 운동해요 💖”`}
              </p>
            </div>
          </div>
        </div>

        {/* ── 4. 메뉴 버튼 3종 (목적별 컬러 코딩 & 3D 클레이 아이콘) ── */}
        <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 12, flexShrink: 0 }}>
          {/* 1) 오늘의 두뇌 운동 (포레스트 그린 #1B5E20 - 건강·활력) */}
          <button
            onClick={onGame}
            aria-label="오늘의 두뇌 운동 시작하기"
            style={{
              width: "100%",
              minHeight: 76,
              borderRadius: 22,
              background: "#1B5E20",
              border: "none",
              padding: "14px 20px",
              display: "flex",
              alignItems: "center",
              gap: 16,
              cursor: "pointer",
              boxShadow: "0 6px 18px rgba(27,94,32,0.32)",
              textAlign: "left",
            }}
          >
            <ClayBrainIcon size={48} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 21, fontWeight: 900, color: "#FFFFFF", lineHeight: 1.25 }}>
                오늘의 두뇌 운동
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#E8F5E9", marginTop: 3 }}>
                5분 · 기억력 + 손가락 운동
              </div>
            </div>
            <span style={{ fontSize: 24, color: "#FFFFFF", fontWeight: 900 }}>▶</span>
          </button>

          {/* 2) 손자/손녀에게 물어보기 (선셋 앰버/오렌지 #D97706 - 대화·교감) */}
          <button
            onClick={() => setIsAskModalOpen(true)}
            aria-label={`${childType === "boy" ? "손자" : "손녀"}에게 물어보기`}
            style={{
              width: "100%",
              minHeight: 76,
              borderRadius: 22,
              background: "#D97706",
              border: "none",
              padding: "14px 20px",
              display: "flex",
              alignItems: "center",
              gap: 16,
              cursor: "pointer",
              boxShadow: "0 6px 18px rgba(217,119,6,0.35)",
              textAlign: "left",
            }}
          >
            <ClayRetroMicIcon size={48} />
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: 21,
                fontWeight: 900,
                color: "#FFFFFF",
                lineHeight: 1.25,
                textShadow: "0 1px 2px rgba(120,53,15,0.45)",
              }}>
                {childType === "boy" ? "손자에게 물어보기" : "손녀에게 물어보기"}
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#FEF3C7", marginTop: 3 }}>
                궁금한 점을 편하게 말씀해 주세요
              </div>
            </div>
            <span style={{ fontSize: 24, color: "#FFFFFF", fontWeight: 900, textShadow: "0 1px 2px rgba(120,53,15,0.45)" }}>▶</span>
          </button>

          {/* 3) 오늘의 기억 (소프트 인디고/코발트 #2563EB - 기억·안정) */}
          <button
            onClick={onMemory}
            aria-label="오늘의 기억 화면으로 이동"
            style={{
              width: "100%",
              minHeight: 76,
              borderRadius: 22,
              background: "#2563EB",
              border: "none",
              padding: "14px 20px",
              display: "flex",
              alignItems: "center",
              gap: 16,
              cursor: "pointer",
              boxShadow: "0 6px 18px rgba(37,99,235,0.35)",
              textAlign: "left",
            }}
          >
            <ClayTulipPotIcon size={48} />
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: 21,
                fontWeight: 900,
                color: "#FFFFFF",
                lineHeight: 1.25,
                textShadow: "0 1px 2px rgba(30,58,138,0.45)",
              }}>
                오늘의 기억
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#DBEAFE", marginTop: 3 }}>
                말하거나 글로 오늘을 남겨보세요
              </div>
            </div>
            <span style={{ fontSize: 24, color: "#FFFFFF", fontWeight: 900, textShadow: "0 1px 2px rgba(30,58,138,0.45)" }}>▶</span>
          </button>
        </div>

      </div>

      {/* ── 하단 네비게이션 바 (Bottom Navigation Bar) ── */}
      <BottomNavBar
        currentScreen="home"
        onNavigateHome={() => {}}
        onNavigateGame={onGame}
        onNavigateMemory={onMemory}
        onNavigateGuide={onGuide}
      />

      {/* ── AI 손자·손녀 질문 대화 모달 (손자/손녀에게 물어보기 탭 시) ── */}
      {isAskModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.65)",
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 390,
              maxHeight: "90vh",
              overflowY: "auto",
              borderRadius: 26,
              background: "#FFFDF7",
              border: "3px solid #26734D",
              boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* 상단 닫기 헤더 */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 18px",
                background: "#FFFFFF",
                borderBottom: "2px solid #EEDBB2",
                flexShrink: 0,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 24 }}>{childType === "boy" ? "👦" : "👧"}</span>
                <span style={{ fontSize: 19, fontWeight: 900, color: "#1F5D40" }}>
                  {childType === "boy" ? "손자에게 물어보기" : "손녀에게 물어보기"}
                </span>
              </div>
              <button
                onClick={() => {
                  window.speechSynthesis?.cancel();
                  setIsAskModalOpen(false);
                }}
                aria-label="닫기"
                style={{
                  height: 40,
                  paddingInline: 12,
                  borderRadius: 12,
                  background: "#F1F5F3",
                  border: "1.5px solid #D9DEDA",
                  fontSize: 15,
                  fontWeight: 800,
                  color: "#626A6E",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <span>✕</span>
                <span>닫기</span>
              </button>
            </div>

            {/* AI 대화 카드 본문 */}
            <div style={{ padding: "16px", flex: 1 }}>
              <AiAskCard
                childType={childType}
                onOpenGuide={() => {
                  setIsAskModalOpen(false);
                  onGuide();
                }}
              />
            </div>
          </div>
        </div>
      )}


      {/* ── 9. 사용자 이름 변경 모달 ── */}
      <NameEditModal
        isOpen={isNameModalOpen}
        currentName={userName}
        onClose={() => setIsNameModalOpen(false)}
        onSave={handleSaveName}
      />
    </div>
  );
}


// ══════════════════════════════════════════════════════════════════════════════
// ─── SCREEN 2: Guide ──────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

// ══════════════════════════════════════════════════════════════════════════════
// ─── SCREEN 2: AI Appliance Vision & Voice Guide (Senior Voice Helper) ────────
// ══════════════════════════════════════════════════════════════════════════════

// GuideScreen은 src/components/GuideScreen.tsx 파일로 모듈화되어 관리됩니다 (Part B: Hugging Face VLM + 3단계 음성 안내).


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
  const previousPoint = useRef<{ x: number; y: number } | null>(null);
  const progress = useRef(0);

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
    const canvas = e.currentTarget;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    if (Math.hypot(x - 45, y - canvas.height / 2) > 24) return;
    canvas.setPointerCapture(e.pointerId);
    isDrawingRef.current = true;
    previousPoint.current = { x: 45, y: canvas.height / 2 };
    progress.current = 45;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const previous = previousPoint.current;
    if (!isDrawingRef.current || !canvas || !previous) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const endX = canvas.width - 45;
    const midY = canvas.height / 2;
    const steps = Math.max(1, Math.ceil(Math.hypot(x - previous.x, y - previous.y) / 4));
    for (let i = 1; i <= steps; i++) {
      const px = previous.x + (x - previous.x) * i / steps;
      const py = previous.y + (y - previous.y) * i / steps;
      const targetY = midY + Math.sin((Math.min(endX, Math.max(45, px)) - 45) / 45) * amplitude;
      if (px < 21 || px > endX + 24 || Math.abs(py - targetY) > trackWidth / 2 || px < progress.current - 24) {
        isDrawingRef.current = false;
        onError(); soundError(); buzz(30);
        return;
      }
      progress.current = Math.max(progress.current, px);
    }
    previousPoint.current = { x, y };
    const endY = midY + Math.sin((endX - 45) / 45) * amplitude;
    if (progress.current >= endX - 8 && Math.hypot(x - endX, y - endY) < 24) {
      isDrawingRef.current = false;
      soundSuccess(); buzz(45); onLevelComplete();
    }
  };

  const handlePointerUp = () => {
    isDrawingRef.current = false;
    previousPoint.current = null;
  };

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#FFFFFF", touchAction: "none" }}>
      <canvas
        ref={canvasRef}
        style={{ width: "100%", height: "100%", touchAction: "none", cursor: "crosshair" }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onLostPointerCapture={handlePointerUp}
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

const MEMORY_PAD_COLORS = ["#1D4ED8", "#047857", "#D97706", "#DC2626"];
const MEMORY_PAD_TONES = [261.63, 329.63, 392.00, 523.25];

function MemoryMode({ level, onLevelComplete, onError, setGuideText }: { level: number; onLevelComplete: () => void; onError: () => void; setGuideText: (t: string) => void }) {
  const padColors = MEMORY_PAD_COLORS;
  const padTones = MEMORY_PAD_TONES;

  const seqLength = level + 2; // 1단계: 3개 ~ 10단계: 12개
  const [sequence, setSequence] = useState<number[]>([]);
  const [activePad, setActivePad] = useState<number | null>(null);
  const [isPlayingSeq, setIsPlayingSeq] = useState(true);

  const timers = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());
  const inputLocked = useRef(true);
  const stepRef = useRef(0);
  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current.clear();
  }, []);
  const schedule = useCallback((action: () => void, delay: number) => {
    const id = setTimeout(() => { timers.current.delete(id); action(); }, delay);
    timers.current.add(id);
  }, []);

  const playSequence = useCallback((seq: number[]) => {
    clearTimers();
    inputLocked.current = true;
    stepRef.current = 0;
    setIsPlayingSeq(true);
    setGuideText("불빛과 소리 순서를 잘 기억해 보세요!");

    seq.forEach((padIdx, i) => {
      schedule(() => {
        setActivePad(padIdx);
        playTone(padTones[padIdx], "triangle", 0.35, 0.4);
        buzz(30);
        schedule(() => {
          setActivePad(null);
          if (i === seq.length - 1) {
            schedule(() => {
              inputLocked.current = false;
              setIsPlayingSeq(false);
              setGuideText("이제 같은 순서로 눌러보세요!");
            }, 300);
          }
        }, 400);
      }, (i + 1) * 650);
    });
  }, [padTones, setGuideText, clearTimers, schedule]);

  useEffect(() => {
    const newSeq: number[] = [];
    for (let i = 0; i < seqLength; i++) {
      newSeq.push(Math.floor(Math.random() * 4));
    }
    setSequence(newSeq);
    playSequence(newSeq);
    return clearTimers;
  }, [level, seqLength, playSequence, clearTimers]);

  const handlePadTap = (idx: number) => {
    if (inputLocked.current) return;

    setActivePad(idx);
    playTone(padTones[idx], "triangle", 0.25, 0.35);
    buzz(30);
    schedule(() => setActivePad(null), 250);

    if (idx === sequence[stepRef.current]) {
      const nextStep = stepRef.current + 1;
      stepRef.current = nextStep;
      if (nextStep >= sequence.length) {
        soundSuccess();
        buzz(50);
        inputLocked.current = true;
        clearTimers();
        onLevelComplete();
      }
    } else {
      inputLocked.current = true;
      setIsPlayingSeq(true);
      onError();
      soundError();
      buzz([80, 40, 80]);
      setGuideText("틀렸어요! 순서를 다시 보여드릴게요.");
      schedule(() => {
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

  let gradeBadge = "⭐ 우수";
  let gradeColor = "#1D4ED8";
  let praise = "아주 훌륭하게 10단계를 해내셨습니다!";

  if (mistakes <= 3) {
    gradeBadge = "🏆 최우수";
    gradeColor = "#047857";
    praise = "정확도와 집중력이 청년 못지않으십니다! 대단하세요!";
  } else if (mistakes <= 8) {
    gradeBadge = "⭐ 우수";
    gradeColor = "#1D4ED8";
    praise = "차분하고 침착하게 끝까지 멋지게 완주하셨습니다!";
  } else {
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

      // Requirement 7: 두뇌운동을 완료했을 때만 brain_training_logs에 기록 저장
      saveTrainingLog({
        training_type: mode,
        level: 10,
        duration_seconds: Math.round(elapsed),
        completed: true,
        score: Math.max(50, 100 - mistakes * 5),
      }).catch((err) => console.warn("두뇌운동 로그 저장 예외:", err));
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

type Screen = "home" | "guide" | "game" | "memory";

export default function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const [characterMode, setCharacterMode] = useState<"boy" | "girl">(() => {
    try {
      return (localStorage.getItem("senior_character_mode") as "boy" | "girl") || "boy";
    } catch {
      return "boy";
    }
  });

  const handleSelectCharacter = (mode: "boy" | "girl") => {
    setCharacterMode(mode);
    try {
      localStorage.setItem("senior_character_mode", mode);
    } catch {}
  };

  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      width: "100%", minHeight: "100vh",
      backgroundImage: `url(${cozyRoomBg})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundColor: "#F3EDE2",
      position: "relative",
      padding: "24px 16px",
      fontFamily: "'Noto Sans KR', 'Nunito', sans-serif",
    }}>
      {/* ── 아늑한 거실 채광 & 따뜻한 앰비언트 햇살 오버레이 ── */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: "radial-gradient(ellipse at 35% 20%, rgba(255, 248, 225, 0.45) 0%, rgba(245, 218, 175, 0.28) 45%, rgba(65, 38, 18, 0.45) 100%)",
        pointerEvents: "none",
      }} />

      <style>{`
        @keyframes wave-0 { from{height:20%} to{height:90%} }
        @keyframes wave-1 { from{height:40%} to{height:70%} }
        @keyframes wave-2 { from{height:60%} to{height:100%} }
        @keyframes wave-3 { from{height:30%} to{height:80%} }
        @keyframes pulse { 0%{transform:scale(1)} 50%{transform:scale(1.08)} 100%{transform:scale(1)} }
        @keyframes bounce { 0%, 100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
      `}</style>

      <div style={{
        position: "relative",
        zIndex: 1,
        width: 390, height: 844,
        maxWidth: "100%", maxHeight: "100vh",
        background: "#FFFDF7",
        borderRadius: 40,
        boxShadow: "0 28px 75px rgba(50, 25, 8, 0.45), 0 8px 24px rgba(0, 0, 0, 0.22)",
        overflow: "hidden", display: "flex", flexDirection: "column",
        border: "4px solid rgba(255, 255, 255, 0.9)",
      }}>
        <div style={{ height: 6, background: "#FFFFFF", flexShrink: 0 }} />
        <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          {screen === "home" && (
            <GreetingScreen
              onGuide={() => setScreen("guide")}
              onGame={() => setScreen("game")}
              onMemory={() => setScreen("memory")}
              childType={characterMode}
              setChildType={handleSelectCharacter}
            />
          )}
          {screen === "guide" && (
            <GuideScreen
              onBack={() => setScreen("home")}
              onNavigateHome={() => setScreen("home")}
              onNavigateGame={() => setScreen("game")}
              onNavigateMemory={() => setScreen("memory")}
              characterMode={characterMode}
            />
          )}
          {screen === "game" && <GameScreen onBack={() => setScreen("home")} />}
          {screen === "memory" && (
            <MemoryScreen
              onBack={() => setScreen("home")}
              onNavigateHome={() => setScreen("home")}
              onNavigateGame={() => setScreen("game")}
              onNavigateGuide={() => setScreen("guide")}
              characterMode={characterMode}
            />
          )}
        </div>
      </div>
    </div>
  );
}

