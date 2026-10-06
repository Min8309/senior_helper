import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  analyzeApplianceImage,
  buildApplianceTtsScript,
  saveApplianceHelpLog,
  VlmAnalysisResult,
} from "../services/applianceService";
import { BottomNavBar } from "./BottomNavBar";
import { CharacterMode } from "../types/memory";

interface GuideScreenProps {
  onBack: () => void;
  onNavigateHome: () => void;
  onNavigateGame: () => void;
  onNavigateMemory: () => void;
  characterMode?: CharacterMode;
}

// ─── Simple Audio Wave Component ─────────────────────────────────────────────
function AudioWave({ active }: { active: boolean }) {
  const bars = [0.4, 0.7, 1.0, 0.85, 0.55, 0.9, 0.65, 0.45, 0.8, 0.6, 1.0, 0.5];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 3, height: 32 }}>
      {bars.map((h, i) => (
        <div
          key={i}
          style={{
            width: 4,
            borderRadius: 2,
            background: active ? "#26734D" : "#94A3B8",
            height: active ? `${h * 100}%` : "30%",
            transition: "height 0.3s ease, background 0.3s",
          }}
        />
      ))}
    </div>
  );
}

// ─── 3단계 가이드 카드 컴포넌트 ────────────────────────────────────────────────
function StepCard({
  number,
  children,
  accent,
}: {
  number: number;
  children: React.ReactNode;
  accent: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 16,
        background: "#FFFFFF",
        border: `2px solid ${accent}33`,
        borderLeft: `6px solid ${accent}`,
        borderRadius: 22,
        padding: "18px 16px",
        boxShadow: "0 3px 12px rgba(0, 0, 0, 0.05)",
      }}
    >
      <div
        style={{
          flexShrink: 0,
          width: 44,
          height: 44,
          borderRadius: "50%",
          background: accent,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginTop: 2,
          boxShadow: `0 3px 8px ${accent}44`,
        }}
      >
        <span style={{ fontSize: 22, fontWeight: 900, color: "#FFFFFF" }}>{number}</span>
      </div>
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  );
}

// ─── 기기 기본 일러스트 ────────────────────────────────────────────────────────
function RemoteIllustration() {
  return (
    <svg width="70" height="96" viewBox="0 0 100 136" fill="none" aria-label="리모컨">
      <rect x="4" y="4" width="92" height="128" rx="20" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="2" />
      <rect x="12" y="14" width="76" height="36" rx="10" fill="#1E293B" />
      <text x="50" y="37" textAnchor="middle" fontSize="11" fill="#38BDF8" fontWeight="700" fontFamily="monospace">
        24°C
      </text>
      <circle cx="50" cy="71" r="13" fill="#EA580C" stroke="#C2410C" strokeWidth="2" />
      <text x="50" y="76" textAnchor="middle" fontSize="11" fill="white" fontWeight="800">
        전원
      </text>
      <rect x="14" y="90" width="30" height="20" rx="6" fill="#3B82F6" />
      <text x="29" y="104" textAnchor="middle" fontSize="13" fill="white" fontWeight="700">
        ▲
      </text>
      <rect x="56" y="90" width="30" height="20" rx="6" fill="#3B82F6" />
      <text x="71" y="104" textAnchor="middle" fontSize="13" fill="white" fontWeight="700">
        ▼
      </text>
      <rect x="26" y="112" width="48" height="16" rx="5" fill="#26734D" />
      <text x="50" y="123" textAnchor="middle" fontSize="9" fill="white" fontWeight="700">
        바람세기
      </text>
    </svg>
  );
}

/**
 * ══════════════════════════════════════════════════════════════════════════════
 * 📷 생활 도움 화면 (Part B: Hugging Face VLM + 시니어 3단계 안내)
 * ══════════════════════════════════════════════════════════════════════════════
 */
export function GuideScreen({
  onBack,
  onNavigateHome,
  onNavigateGame,
  onNavigateMemory,
  characterMode = "girl",
}: GuideScreenProps) {
  // Step state: "upload" -> "confirm" -> "analyzing" -> "result" | "error"
  const [guideState, setGuideState] = useState<"upload" | "confirm" | "analyzing" | "result" | "error">("upload");
  const [selectedFile, setSelectedFile] = useState<File | Blob | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<VlmAnalysisResult | null>(null);
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isPhotoUnclear, setIsPhotoUnclear] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const voiceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  const isGirl = characterMode === "girl" || characterMode === "granddaughter";

  // TTS 음성 재생 (Base64 audio 우선, 없으면 Web Speech API)
  const playGuideVoice = useCallback(
    (text: string, base64Audio?: string) => {
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
          utterance.rate = 0.88;
          utterance.pitch = isGirl ? 1.25 : 1.05;
          utterance.onstart = () => setIsPlayingVoice(true);
          utterance.onend = () => setIsPlayingVoice(false);
          utterance.onerror = () => setIsPlayingVoice(false);
          window.speechSynthesis.speak(utterance);
        }
      }
    },
    [isGirl]
  );

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
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (voiceTimerRef.current) clearTimeout(voiceTimerRef.current);
      stopGuideVoice();
    };
  }, []);

  // 1. 촬영/선택 완료 시: 즉시 분석하지 않고 미리보기(confirm) 단계로 진입 (Requirement 11)
  const handlePhotoCaptured = (file: File | Blob, dataUrl: string) => {
    setSelectedFile(file);
    setImagePreview(dataUrl);
    setGuideState("confirm");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        handlePhotoCaptured(file, reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // 2. [AI에게 물어보기] 클릭 시: Hugging Face VLM 분석 호출 (Requirement 12, 13, 14, 15)
  const handleConfirmAndAnalyze = async () => {
    if (!selectedFile) return;
    setGuideState("analyzing");

    try {
      const result = await analyzeApplianceImage(selectedFile, isGirl ? "granddaughter" : "grandson");

      if (!mountedRef.current) return;

      // 사진 불분명 또는 실패 (Requirement 15, 21)
      if (!result.success || result.needs_new_photo || result.instructions.length === 0) {
        setIsPhotoUnclear(result.needs_new_photo);
        setErrorMessage(
          result.error_guide || "버튼이 잘 보이도록 조금 더 가까이에서 다시 찍어주세요."
        );
        setGuideState("error");
        return;
      }

      setAnalysisResult(result);
      setGuideState("result");

      // Requirement 19: 생활 도움 결과 Supabase appliance_help_logs 저장 (사진 원본은 보관 안 함)
      saveApplianceHelpLog({
        deviceName: result.device_name,
        instructions: result.instructions,
        success: true,
      }).catch((err) => console.warn("생활 도움 기록 Supabase 저장 오류:", err));

      // Requirement 17: TTS 연결
      const ttsScript = buildApplianceTtsScript(
        result.device_name,
        result.instructions,
        isGirl ? "granddaughter" : "grandson"
      );
      voiceTimerRef.current = setTimeout(() => {
        if (!mountedRef.current) return;
        playGuideVoice(ttsScript, result.audio_base64);
      }, 500);
    } catch (err) {
      console.warn("기기 분석 오류:", err);
      setIsPhotoUnclear(false);
      setErrorMessage("잠시 문제가 생겼어요. 조금 뒤에 다시 해주세요.");
      setGuideState("error");
    }
  };

  // 재촬영 처리
  const handleRetryPhoto = () => {
    if (voiceTimerRef.current) clearTimeout(voiceTimerRef.current);
    stopGuideVoice();
    setSelectedFile(null);
    setImagePreview(null);
    setAnalysisResult(null);
    setGuideState("upload");
  };

  const accents = ["#26734D", "#D97706", "#2563EB"];

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "#FFFDF7",
        overflow: "hidden",
      }}
    >
      {/* ── 1. 사진 촬영 초기 화면 (Requirement 10) ───────────────────────── */}
      {guideState === "upload" && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflowY: "auto" }}>
          <header
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 16px",
              background: "#FFFFFF",
              borderBottom: "1.5px solid #EFEAE0",
              position: "sticky",
              top: 0,
              zIndex: 10,
            }}
          >
            <button
              onClick={onBack}
              aria-label="홈으로 가기"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                height: 48,
                paddingInline: 14,
                borderRadius: 14,
                border: "2px solid #D9DEDA",
                background: "#F9FAFB",
                cursor: "pointer",
              }}
            >
              <span style={{ fontSize: 18, color: "#252A2D" }}>‹</span>
              <span style={{ fontSize: 16, fontWeight: 800, color: "#252A2D" }}>홈으로</span>
            </button>
            <h1 style={{ fontSize: 20, fontWeight: 900, color: "#252A2D", margin: 0 }}>
              생활 도움 📷
            </h1>
            <div style={{ width: 68 }} />
          </header>

          <input
            type="file"
            ref={cameraInputRef}
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />

          <div style={{ padding: "24px 20px 12px", textAlign: "center" }}>
            <div
              style={{
                width: 90,
                height: 90,
                borderRadius: "50%",
                background: "#E7F4EC",
                border: "3px solid #26734D33",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
                fontSize: 44,
              }}
            >
              📷
            </div>
            {/* Requirement 10 문구 */}
            <h2 style={{ fontSize: 24, fontWeight: 900, color: "#252A2D", margin: "0 0 10px" }}>
              어떤 기기가 어려우세요?
            </h2>
            <p
              style={{
                fontSize: 17,
                color: "#626A6E",
                fontWeight: 700,
                margin: 0,
                lineHeight: 1.55,
                wordBreak: "keep-all",
              }}
            >
              사진을 찍어주시면 AI 손주가<br />
              <strong style={{ color: "#26734D" }}>쉬운 3단계 켜는 법</strong>을 목소리로 알려드려요.
            </p>
          </div>

          <div
            style={{
              padding: "16px 20px",
              display: "flex",
              flexDirection: "column",
              gap: 14,
              flex: 1,
              justifyContent: "center",
            }}
          >
            {/* Requirement 10: 큰 버튼 [📷 기기 사진 찍기] 및 보조 문구 */}
            <button
              onClick={() => cameraInputRef.current?.click()}
              aria-label="기기 사진 찍기"
              style={{
                width: "100%",
                minHeight: 88,
                borderRadius: 24,
                background: "linear-gradient(135deg, #26734D 0%, #1E5E3E 100%)",
                border: "none",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "14px 20px",
                cursor: "pointer",
                boxShadow: "0 6px 22px rgba(38, 115, 77, 0.35)",
                transition: "transform 0.1s ease",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 28 }}>📷</span>
                <span style={{ fontSize: 22, fontWeight: 900, color: "#FFFFFF" }}>
                  기기 사진 찍기
                </span>
              </div>
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: "#E7F4EC",
                  marginTop: 6,
                  wordBreak: "keep-all",
                }}
              >
                리모컨 · 세탁기 · 전자레인지 등을 찍어주세요
              </span>
            </button>

            {/* 앨범 선택 버튼 */}
            <button
              onClick={() => fileInputRef.current?.click()}
              aria-label="사진 앨범에서 선택하기"
              style={{
                width: "100%",
                minHeight: 64,
                borderRadius: 20,
                background: "#FFFFFF",
                border: "2px solid #D9DEDA",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                cursor: "pointer",
                boxShadow: "0 3px 10px rgba(0,0,0,0.04)",
              }}
            >
              <span style={{ fontSize: 22 }}>🖼️</span>
              <span style={{ fontSize: 18, fontWeight: 800, color: "#252A2D" }}>
                사진 앨범에서 고르기
              </span>
            </button>


          </div>

          <div style={{ padding: "0 20px 20px" }}>
            <div
              style={{
                background: "#F1F5F3",
                borderRadius: 16,
                padding: "12px 16px",
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <span style={{ fontSize: 22 }}>✨</span>
              <p
                style={{
                  fontSize: 14,
                  color: "#626A6E",
                  fontWeight: 700,
                  margin: 0,
                  lineHeight: 1.45,
                }}
              >
                버튼과 글씨가 또렷하게 보이도록 불이 밝은 곳에서 찍어주시면 더 정확해요.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── 2. 촬영 사진 확인 화면 (Requirement 11) ─────────────────────────── */}
      {guideState === "confirm" && imagePreview && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflowY: "auto" }}>
          <header
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 16px",
              background: "#FFFFFF",
              borderBottom: "1.5px solid #EFEAE0",
            }}
          >
            <button
              onClick={handleRetryPhoto}
              aria-label="다시 찍기"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                height: 48,
                paddingInline: 14,
                borderRadius: 14,
                border: "2px solid #D9DEDA",
                background: "#F9FAFB",
                cursor: "pointer",
              }}
            >
              <span style={{ fontSize: 18, color: "#252A2D" }}>‹</span>
              <span style={{ fontSize: 16, fontWeight: 800, color: "#252A2D" }}>다시 찍기</span>
            </button>
            <h1 style={{ fontSize: 20, fontWeight: 900, color: "#252A2D", margin: 0 }}>
              사진 확인 📸
            </h1>
            <div style={{ width: 68 }} />
          </header>

          <div
            style={{
              padding: "20px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              flex: 1,
              justifyContent: "center",
            }}
          >
            {/* 촬영된 사진 미리보기 */}
            <div
              style={{
                width: 240,
                height: 240,
                borderRadius: 24,
                overflow: "hidden",
                border: "4px solid #26734D",
                boxShadow: "0 8px 24px rgba(38,115,77,0.2)",
                marginBottom: 20,
              }}
            >
              <img
                src={imagePreview}
                alt="촬영된 기기 사진"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>

            {/* Requirement 11 문구 */}
            <h2
              style={{
                fontSize: 24,
                fontWeight: 900,
                color: "#252A2D",
                margin: "0 0 8px",
                textAlign: "center",
              }}
            >
              이 사진으로 알아볼까요?
            </h2>
            <p
              style={{
                fontSize: 16,
                color: "#626A6E",
                fontWeight: 700,
                margin: "0 0 24px",
                textAlign: "center",
                lineHeight: 1.5,
              }}
            >
              버튼과 글씨가 잘 보이시는지 확인해 주세요.
            </p>

            {/* Requirement 11: [다시 찍기] & [AI에게 물어보기] 버튼 */}
            <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 12 }}>
              <button
                onClick={handleConfirmAndAnalyze}
                aria-label="AI에게 물어보기"
                style={{
                  width: "100%",
                  minHeight: 68,
                  borderRadius: 22,
                  background: "#26734D",
                  border: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  cursor: "pointer",
                  boxShadow: "0 6px 18px rgba(38,115,77,0.35)",
                }}
              >
                <span style={{ fontSize: 24 }}>✨</span>
                <span style={{ fontSize: 21, fontWeight: 900, color: "#FFFFFF" }}>
                  AI에게 물어보기
                </span>
              </button>

              <button
                onClick={handleRetryPhoto}
                aria-label="다시 찍기"
                style={{
                  width: "100%",
                  minHeight: 56,
                  borderRadius: 18,
                  background: "#FFFFFF",
                  border: "2px solid #D9DEDA",
                  color: "#626A6E",
                  fontSize: 18,
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                📷 다시 찍기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 3. 분석 중 로딩 화면 (Requirement 20) ─────────────────────────── */}
      {guideState === "analyzing" && (
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
            textAlign: "center",
          }}
        >
          {/* 캐릭터 아바타 및 펄스 효과 */}
          <div
            style={{
              width: 130,
              height: 130,
              borderRadius: "50%",
              background: "#E7F4EC",
              border: "4px solid #26734D",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 64,
              marginBottom: 24,
              boxShadow: "0 8px 30px rgba(38,115,77,0.25)",
              animation: "pulse 1.8s infinite ease-in-out",
            }}
          >
            {isGirl ? "👧" : "👦"}
          </div>

          {/* Requirement 20: 시니어 친화적 안내 문구 (기술적 용어 배제) */}
          <h2 style={{ fontSize: 24, fontWeight: 900, color: "#252A2D", margin: "0 0 10px" }}>
            사진을 살펴보고 있어요.
          </h2>
          <p
            style={{
              fontSize: 18,
              color: "#26734D",
              fontWeight: 800,
              margin: "0 0 16px",
              lineHeight: 1.5,
            }}
          >
            잠시만 기다려 주세요 😊
          </p>
          <p
            style={{
              fontSize: 15,
              color: "#626A6E",
              fontWeight: 700,
              margin: 0,
              lineHeight: 1.5,
              maxWidth: 280,
            }}
          >
            어르신이 바로 사용하실 수 있게<br />
            쉬운 3단계 켜는 법을 준비하고 있어요.
          </p>
        </div>
      )}

      {/* ── 4. 오류 및 재촬영 안내 화면 (Requirement 21) ────────────────────── */}
      {guideState === "error" && (
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: 28,
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: 90,
              height: 90,
              borderRadius: "50%",
              background: "#FFF4E5",
              border: "3px solid #F2A23A",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 44,
              marginBottom: 20,
            }}
          >
            ⚠️
          </div>

          <h2 style={{ fontSize: 24, fontWeight: 900, color: "#252A2D", margin: "0 0 12px" }}>
            {isPhotoUnclear ? "사진을 알아보기 어려워요." : "잠시 문제가 생겼어요."}
          </h2>

          <p
            style={{
              fontSize: 18,
              color: "#626A6E",
              fontWeight: 700,
              lineHeight: 1.6,
              margin: "0 0 32px",
              wordBreak: "keep-all",
            }}
          >
            {errorMessage || "버튼이 잘 보이도록 조금 더 가까이에서 다시 찍어주세요."}
          </p>

          <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 12 }}>
            <button
              onClick={handleRetryPhoto}
              style={{
                width: "100%",
                minHeight: 64,
                borderRadius: 20,
                background: "#26734D",
                color: "#FFFFFF",
                fontSize: 20,
                fontWeight: 900,
                border: "none",
                boxShadow: "0 4px 16px rgba(38,115,77,0.3)",
                cursor: "pointer",
              }}
            >
              📷 다시 찍기
            </button>

            {!isPhotoUnclear && (
              <button
                onClick={handleConfirmAndAnalyze}
                style={{
                  width: "100%",
                  minHeight: 56,
                  borderRadius: 18,
                  background: "#FFFFFF",
                  color: "#252A2D",
                  fontSize: 18,
                  fontWeight: 800,
                  border: "2px solid #D9DEDA",
                  cursor: "pointer",
                }}
              >
                🔄 다시 시도
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── 5. 분석 결과 화면 (Requirement 16, 17) ─────────────────────────── */}
      {guideState === "result" && analysisResult && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflowY: "auto" }}>
          <header
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 16px",
              background: "#FFFFFF",
              borderBottom: "1.5px solid #EFEAE0",
              position: "sticky",
              top: 0,
              zIndex: 10,
            }}
          >
            <button
              onClick={handleRetryPhoto}
              aria-label="다시 찍기"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                height: 48,
                paddingInline: 14,
                borderRadius: 14,
                border: "2px solid #D9DEDA",
                background: "#F9FAFB",
                cursor: "pointer",
              }}
            >
              <span style={{ fontSize: 18, color: "#252A2D" }}>‹</span>
              <span style={{ fontSize: 16, fontWeight: 800, color: "#252A2D" }}>다시 촬영</span>
            </button>
            <h1 style={{ fontSize: 20, fontWeight: 900, color: "#252A2D", margin: 0 }}>
              기기 작동 안내
            </h1>
            <div style={{ width: 68 }} />
          </header>

          <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 14 }}>
            {/* 상단 확인된 기기 카드 (Requirement 16) */}
            <div
              style={{
                background: "#252A2D",
                borderRadius: 24,
                padding: "16px 18px",
                display: "flex",
                alignItems: "center",
                gap: 16,
                boxShadow: "0 6px 20px rgba(37,42,45,0.18)",
              }}
            >
              <div
                style={{
                  width: 76,
                  height: 92,
                  borderRadius: 16,
                  overflow: "hidden",
                  border: "2px solid rgba(255,255,255,0.2)",
                  background: "#374151",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="촬영된 기기"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <RemoteIllustration />
                )}
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    display: "inline-block",
                    background: "#F2A23A",
                    color: "#FFFFFF",
                    borderRadius: 8,
                    padding: "2px 8px",
                    fontSize: 12,
                    fontWeight: 900,
                    marginBottom: 6,
                  }}
                >
                  확인된 기기
                </div>
                <h2
                  style={{
                    fontSize: 22,
                    fontWeight: 900,
                    color: "#FFFFFF",
                    margin: 0,
                    lineHeight: 1.3,
                  }}
                >
                  {analysisResult.device_name}이에요.
                </h2>
                <p style={{ fontSize: 14, color: "#D1D5DB", margin: "4px 0 0", fontWeight: 600 }}>
                  아래 3단계를 순서대로 따라 해보세요 👇
                </p>
              </div>
            </div>

            {/* 3단계 작동법 카드 (Requirement 14, 16) */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {analysisResult.instructions.map((step, idx) => (
                <StepCard key={idx} number={idx + 1} accent={accents[idx % accents.length]}>
                  <p
                    style={{
                      fontSize: 18,
                      fontWeight: 800,
                      color: "#252A2D",
                      margin: 0,
                      lineHeight: 1.5,
                      wordBreak: "keep-all",
                    }}
                  >
                    {step.replace(/^\d+[\.\)]\s*/, "")}
                  </p>
                </StepCard>
              ))}
            </div>

            {/* Requirement 16, 17: [ 🔊 음성으로 듣기 ] 버튼 */}
            <button
              onClick={() => {
                if (isPlayingVoice) {
                  stopGuideVoice();
                } else {
                  const ttsScript = buildApplianceTtsScript(
                    analysisResult.device_name,
                    analysisResult.instructions,
                    isGirl ? "granddaughter" : "grandson"
                  );
                  playGuideVoice(ttsScript, analysisResult.audio_base64);
                }
              }}
              aria-label="음성으로 듣기"
              style={{
                width: "100%",
                minHeight: 64,
                borderRadius: 20,
                background: isPlayingVoice ? "#E7F4EC" : "#FFFFFF",
                border: `2.5px solid ${isPlayingVoice ? "#26734D" : "#D9DEDA"}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 18px",
                cursor: "pointer",
                boxShadow: isPlayingVoice ? "0 0 0 3px rgba(38,115,77,0.2)" : "0 3px 10px rgba(0,0,0,0.05)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 24 }}>{isPlayingVoice ? "⏹️" : "🔊"}</span>
                <span
                  style={{
                    fontSize: 19,
                    fontWeight: 900,
                    color: isPlayingVoice ? "#26734D" : "#252A2D",
                  }}
                >
                  {isPlayingVoice ? "목소리로 설명 중..." : "음성으로 듣기"}
                </span>
              </div>
              <AudioWave active={isPlayingVoice} />
            </button>

            {/* 재촬영 버튼 & 홈으로 가기 버튼 */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 4 }}>
              <button
                onClick={handleRetryPhoto}
                aria-label="다시 사진 찍기"
                style={{
                  width: "100%",
                  minHeight: 56,
                  borderRadius: 18,
                  background: "#FFFFFF",
                  border: "2px solid #D9DEDA",
                  color: "#252A2D",
                  fontSize: 18,
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                📷 다시 사진 찍기
              </button>

              <button
                onClick={() => {
                  stopGuideVoice();
                  onBack();
                }}
                aria-label="다 됐어요! 홈으로 가기"
                style={{
                  width: "100%",
                  minHeight: 60,
                  borderRadius: 18,
                  background: "#26734D",
                  border: "none",
                  color: "#FFFFFF",
                  fontSize: 19,
                  fontWeight: 900,
                  cursor: "pointer",
                  boxShadow: "0 4px 14px rgba(38,115,77,0.3)",
                }}
              >
                ✓ 다 됐어요! 홈으로 가기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 하단 공통 네비게이션 바 (생활 도움 탭 활성화) ───────────────────── */}
      <BottomNavBar
        currentScreen="guide"
        onNavigateHome={() => {
          stopGuideVoice();
          onNavigateHome();
        }}
        onNavigateGame={() => {
          stopGuideVoice();
          onNavigateGame();
        }}
        onNavigateMemory={() => {
          stopGuideVoice();
          onNavigateMemory();
        }}
        onNavigateGuide={() => {}}
      />
    </div>
  );
}
