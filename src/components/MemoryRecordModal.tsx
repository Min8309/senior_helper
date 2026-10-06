import { useState, useEffect, useRef } from "react";
import { localDateKey } from "../utils/date";
import { CharacterMode } from "../types/memory";
import { recordVoice, stopRecording, cancelRecording } from "../services/voiceRecordService";
import { formatDisplayText, generateMemoryTitle } from "../services/memoryStorage";
import { saveMemory as saveMemoryToService } from "../services/memoryService";

interface MemoryRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  characterMode?: CharacterMode;
}

// Requirement 6: AI 손자·손녀 질문 목록
const QUESTIONS = [
  "오늘 가장 좋았던 일은 뭐였어요?",
  "오늘 누구와 이야기했어요?",
  "오늘 재미있었던 일이 있었어요?",
  "오늘 어디에 다녀오셨어요?",
  "오늘 맛있게 드신 음식은 뭐예요?",
];

type Step = "choose" | "voice_record" | "voice_confirm" | "text_input";

export function MemoryRecordModal({
  isOpen,
  onClose,
  onSaved,
  characterMode = "boy",
}: MemoryRecordModalProps) {
  const isGirl = characterMode === "girl" || characterMode === "granddaughter";

  // 오늘 날짜 및 질문 인덱스 관리
  const today = new Date();
  const [questionIndex, setQuestionIndex] = useState(() => today.getDate() % QUESTIONS.length);
  const currentQuestion = QUESTIONS[questionIndex];

  const [step, setStep] = useState<Step>("choose");

  // 음성 녹음 관련 상태
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [confirmedText, setConfirmedText] = useState("");
  const [audioDataUrl, setAudioDataUrl] = useState<string | undefined>(undefined);
  const [isEditingText, setIsEditingText] = useState(false);

  // 미리듣기 오디오 상태
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  // 글 작성용 상태
  const [manualText, setManualText] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const timerRef = useRef<any>(null);
  const sessionRef = useRef(0);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    return () => { sessionRef.current++; cancelRecording(); previewAudioRef.current?.pause(); };
  }, [isOpen]);

  // 모달이 열릴 때 초기화
  useEffect(() => {
    if (isOpen) {
      setErrorMessage("");
      setStep("choose");
      setIsRecording(false);
      setRecordSeconds(0);
      setLiveTranscript("");
      setConfirmedText("");
      setAudioDataUrl(undefined);
      setIsEditingText(false);
      setManualText("");
      setIsPlayingPreview(false);
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
        previewAudioRef.current = null;
      }
    }
  }, [isOpen]);

  // 녹음 타이머 관리
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  if (!isOpen) return null;

  // 다음 질문으로 변경 (영감 제공용)
  const handleNextQuestion = () => {
    setQuestionIndex((prev) => (prev + 1) % QUESTIONS.length);
  };

  // 1. 음성 녹음 시작
  const handleStartVoice = async () => {
    setStep("voice_record");
    setLiveTranscript("");
    setRecordSeconds(0);
    setIsRecording(true);

    const session = sessionRef.current;
    const started = await recordVoice((transcript) => {
      setLiveTranscript(transcript);
    });

    if (session !== sessionRef.current) return;
    if (!started) {
      setIsRecording(false);
      setErrorMessage("마이크를 사용할 수 없어요. 글로 남겨주세요.");
      // 마이크 권한이나 미지원 환경 시 글쓰기 화면으로 전환
      setStep("text_input");
    }
  };

  // 2. 녹음 종료 (Requirement 3 & 4)
  const handleStopVoice = async () => {
    setIsRecording(false);
    const session = sessionRef.current;
    const result = await stopRecording();
    if (session !== sessionRef.current) return;

    // 음성 텍스트 확인 (원문 및 다듬어진 문장 준비)
    const rawTranscript = (result.transcript || liveTranscript || "").trim();
    const textToShow = rawTranscript ? formatDisplayText(rawTranscript) : "";
    if (!rawTranscript) {
      setErrorMessage("말씀을 글로 알아듣지 못했어요. 내용을 직접 입력하거나 다시 녹음해 주세요.");
      setIsEditingText(true);
    }

    setConfirmedText(textToShow);
    setAudioDataUrl(result.audioDataUrl);
    setStep("voice_confirm");
  };

  // 녹음 취소
  const handleCancelVoice = () => {
    cancelRecording();
    setIsRecording(false);
    setStep("choose");
  };

  // 녹음된 오디오 미리듣기 토글
  const handleTogglePreviewAudio = () => {
    if (!audioDataUrl) return;

    if (isPlayingPreview && previewAudioRef.current) {
      previewAudioRef.current.pause();
      setIsPlayingPreview(false);
      return;
    }

    try {
      const audio = new Audio(audioDataUrl);
      previewAudioRef.current = audio;
      setIsPlayingPreview(true);
      audio.onended = () => {
        setIsPlayingPreview(false);
      };
      audio.onerror = () => {
        setIsPlayingPreview(false);
      };
      audio.play().catch(() => setIsPlayingPreview(false));
    } catch {
      setIsPlayingPreview(false);
    }
  };

  // 기억 저장 실행 (Supabase DB + Storage 및 로컬 동기화)
  const handleSave = async (type: "voice" | "text", rawInput: string) => {
    const trimmed = rawInput.trim();
    if (!trimmed || isSaving) return;

    setIsSaving(true);
    const dateStr = localDateKey(today);
    const month = today.getMonth() + 1;
    const date = today.getDate();
    const dayNames = ["일", "월", "화", "수", "목", "금", "토"];
    const dayName = dayNames[today.getDay()];
    const dateLabel = `${month}월 ${date}일 ${dayName}요일`;

    const title = generateMemoryTitle(trimmed);
    const formattedDisplay = formatDisplayText(trimmed);

    try {
      await saveMemoryToService({
        date: dateStr,
        date_label: dateLabel,
        title,
        question: currentQuestion,
        input_type: type,
        original_text: trimmed,
        display_text: formattedDisplay,
        summary: formattedDisplay,
        character_mode: isGirl ? "granddaughter" : "grandson",
        audio_data_url: type === "voice" ? audioDataUrl : undefined,
      });
    } catch (err) {
      console.warn("기억 저장 처리:", err);
      setErrorMessage("저장하지 못했어요. 기기 저장 공간을 확인하고 다시 시도해 주세요.");
      return;
    } finally {
      setIsSaving(false);
    }

    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
    }

    onSaved();
    onClose();
  };

  // 초 단위 시간 포맷 (00:24)
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
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
          background: "#FFFDF7",
          borderRadius: 28,
          border: "3px solid #26734D",
          boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          maxHeight: "92vh",
        }}
      >
        {errorMessage && <p role="alert" style={{ padding: "12px 18px", margin: 0, color: "#9A3412", fontSize: 17 }}>{errorMessage}</p>}
        {/* ── 상단 닫기 헤더 바 ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 18px",
            background: "#FFFFFF",
            borderBottom: "2px solid #EEDBB2",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 22 }}>🌷</span>
            <span style={{ fontSize: 19, fontWeight: 900, color: "#1F5D40" }}>
              오늘의 기억
            </span>
          </div>

          <button
            onClick={() => {
              sessionRef.current++;
              cancelRecording();
              setIsRecording(false);
              if (previewAudioRef.current) previewAudioRef.current.pause();
              onClose();
            }}
            aria-label="기억 창 닫기"
            style={{
              height: 44,
              paddingInline: 14,
              borderRadius: 14,
              background: "#F1F5F3",
              border: "1.5px solid #D9DEDA",
              fontSize: 16,
              fontWeight: 800,
              color: "#4A5568",
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

        {/* ── 바디 스크롤 컨텐츠 ── */}
        <div style={{ padding: "20px 18px", overflowY: "auto", flex: 1 }}>
          {/* ════════════════════════════════════════════════════
              1. 기록 방법 선택 화면 (Requirement 2 & 6: choose)
          ════════════════════════════════════════════════════ */}
          {step === "choose" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Requirement 6: AI 손자/손녀 질문 카드 */}
              <div
                style={{
                  background: "#FFF9ED",
                  border: "2.5px solid #EEDBB2",
                  borderRadius: 22,
                  padding: "18px 16px",
                  textAlign: "center",
                  boxShadow: "0 4px 12px rgba(242,162,58,0.1)",
                }}
              >
                <div style={{ fontSize: 36, marginBottom: 4 }}>
                  {isGirl ? "👧" : "👦"}
                </div>
                <div
                  style={{
                    display: "inline-block",
                    background: "#FEF3C7",
                    color: "#92400E",
                    fontSize: 14,
                    fontWeight: 800,
                    padding: "3px 10px",
                    borderRadius: 10,
                  }}
                >
                  {isGirl ? "손녀의 오늘 질문" : "손자의 오늘 질문"} 💭
                </div>
                <p
                  style={{
                    fontSize: 20,
                    fontWeight: 900,
                    color: "#252A2D",
                    margin: "10px 0 6px",
                    lineHeight: 1.45,
                    wordBreak: "keep-all",
                  }}
                >
                  “할머니, {currentQuestion}”
                </p>

                {/* 질문 변경 버튼 (시니어 영감 도움) */}
                <button
                  onClick={handleNextQuestion}
                  style={{
                    marginTop: 6,
                    background: "none",
                    border: "none",
                    fontSize: 14,
                    fontWeight: 700,
                    color: "#D97706",
                    cursor: "pointer",
                    textDecoration: "underline",
                    padding: "4px 8px",
                  }}
                >
                  🔄 다른 질문 보기
                </button>
              </div>

              {/* Requirement 2 문구: “오늘 있었던 일을 들려주세요.” */}
              <div style={{ textAlign: "center", padding: "4px 0" }}>
                <p style={{ fontSize: 18, fontWeight: 800, color: "#4A5568", margin: 0 }}>
                  오늘 있었던 일을 들려주세요 😊
                </p>
              </div>

              {/* Requirement 2: 두 개의 큰 버튼 (음성 vs 글) */}
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {/* 1. 🎤 말로 이야기하기 (Primary 기능, 가장 크게) */}
                <button
                  onClick={handleStartVoice}
                  aria-label="말로 이야기하기"
                  style={{
                    width: "100%",
                    minHeight: 74,
                    borderRadius: 20,
                    background: "#26734D",
                    border: "none",
                    padding: "14px 18px",
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    cursor: "pointer",
                    boxShadow: "0 6px 18px rgba(38,115,77,0.28)",
                    textAlign: "left",
                  }}
                >
                  <div
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: "50%",
                      background: "#FFFFFF",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 28,
                      flexShrink: 0,
                    }}
                  >
                    🎤
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 20, fontWeight: 900, color: "#FFFFFF" }}>
                      말로 이야기하기
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#E7F4EC", marginTop: 2 }}>
                      편하게 말씀해 주세요 (말로 대답하기)
                    </div>
                  </div>
                  <span style={{ fontSize: 22, color: "#FFFFFF", fontWeight: 900 }}>▶</span>
                </button>

                {/* 2. ✏️ 글로 기록하기 (Secondary 기능) */}
                <button
                  onClick={() => setStep("text_input")}
                  aria-label="글로 기록하기"
                  style={{
                    width: "100%",
                    minHeight: 68,
                    borderRadius: 20,
                    background: "#FFFFFF",
                    border: "2.5px solid #26734D",
                    padding: "12px 18px",
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    cursor: "pointer",
                    boxShadow: "0 4px 12px rgba(38,115,77,0.08)",
                    textAlign: "left",
                  }}
                >
                  <div
                    style={{
                      width: 46,
                      height: 46,
                      borderRadius: "50%",
                      background: "#E7F4EC",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 24,
                      flexShrink: 0,
                    }}
                  >
                    ✏️
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 19, fontWeight: 900, color: "#1F5D40" }}>
                      글로 기록하기
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#26734D", marginTop: 2 }}>
                      직접 글을 적어보세요 (글로 대답하기)
                    </div>
                  </div>
                  <span style={{ fontSize: 20, color: "#26734D", fontWeight: 900 }}>▶</span>
                </button>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════
              2. 음성 녹음 화면 (Requirement 3: voice_record)
          ════════════════════════════════════════════════════ */}
          {step === "voice_record" && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18, textAlign: "center" }}>
              {/* 질문 안내 */}
              <div
                style={{
                  background: "#FFF9ED",
                  border: "1.5px solid #EEDBB2",
                  borderRadius: 16,
                  padding: "10px 16px",
                  width: "100%",
                  boxSizing: "border-box",
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 800, color: "#D97706" }}>
                  {isGirl ? "손녀의 질문" : "손자의 질문"}
                </div>
                <div style={{ fontSize: 17, fontWeight: 800, color: "#92400E", marginTop: 2 }}>
                  “{currentQuestion}”
                </div>
              </div>

              {/* 녹음 중 상태 vs 시작 대기 상태 */}
              {isRecording ? (
                <>
                  {/* Requirement 3: 🔴 듣고 있어요 00:24 */}
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      background: "#FEE2E2",
                      border: "2px solid #EF4444",
                      padding: "8px 20px",
                      borderRadius: 22,
                    }}
                  >
                    <span
                      style={{
                        width: 14,
                        height: 14,
                        borderRadius: "50%",
                        background: "#EF4444",
                        boxShadow: "0 0 8px #EF4444",
                      }}
                    />
                    <span style={{ fontSize: 18, fontWeight: 900, color: "#991B1B" }}>
                      듣고 있어요
                    </span>
                    <span style={{ fontSize: 18, fontWeight: 900, color: "#991B1B" }}>
                      {formatTime(recordSeconds)}
                    </span>
                  </div>

                  {/* 중앙 큰 마이크 (녹음 애니메이션) */}
                  <div
                    style={{
                      width: 104,
                      height: 104,
                      borderRadius: "50%",
                      background: "#26734D",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 50,
                      color: "#FFFFFF",
                      boxShadow: "0 8px 32px rgba(38,115,77,0.38)",
                    }}
                  >
                    🎤
                  </div>

                  <div>
                    <p style={{ fontSize: 20, fontWeight: 900, color: "#252A2D", margin: 0 }}>
                      천천히 편하게 말씀해 주세요
                    </p>
                    <p style={{ fontSize: 16, fontWeight: 700, color: "#626A6E", margin: "6px 0 0" }}>
                      말씀이 끝나시면 아래 [녹음 끝내기]를 눌러주세요
                    </p>
                  </div>

                  {/* 실시간 음성인식 텍스트 */}
                  {liveTranscript && (
                    <div
                      style={{
                        width: "100%",
                        background: "#FFFFFF",
                        border: "2px solid #26734D",
                        borderRadius: 16,
                        padding: "12px 14px",
                        fontSize: 18,
                        fontWeight: 700,
                        color: "#1F5D40",
                        lineHeight: 1.45,
                        boxSizing: "border-box",
                      }}
                    >
                      “{liveTranscript}”
                    </div>
                  )}

                  {/* Requirement 3: [ ■ 녹음 끝내기 ] 버튼 */}
                  <button
                    onClick={handleStopVoice}
                    aria-label="녹음 끝내기"
                    style={{
                      width: "100%",
                      minHeight: 66,
                      borderRadius: 18,
                      background: "#E53E3E",
                      border: "none",
                      color: "#FFFFFF",
                      fontSize: 20,
                      fontWeight: 900,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 10,
                      cursor: "pointer",
                      boxShadow: "0 6px 18px rgba(229,62,62,0.32)",
                    }}
                  >
                    <span style={{ fontSize: 22 }}>■</span>
                    <span>녹음 끝내기</span>
                  </button>
                </>
              ) : (
                /* 녹음 시작 전 상태: 큰 마이크 버튼과 안내 문구 */
                <>
                  <button
                    onClick={handleStartVoice}
                    aria-label="녹음 시작하기"
                    style={{
                      width: 104,
                      height: 104,
                      borderRadius: "50%",
                      background: "#26734D",
                      border: "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 50,
                      color: "#FFFFFF",
                      boxShadow: "0 8px 30px rgba(38,115,77,0.32)",
                      cursor: "pointer",
                    }}
                  >
                    🎤
                  </button>

                  {/* Requirement 3 문구 */}
                  <div>
                    <p style={{ fontSize: 21, fontWeight: 900, color: "#252A2D", margin: 0, lineHeight: 1.35 }}>
                      버튼을 누르고<br />천천히 말씀해 주세요
                    </p>
                    <p style={{ fontSize: 16, fontWeight: 700, color: "#626A6E", margin: "8px 0 0" }}>
                      준비가 되시면 아래 [녹음 시작]을 눌러주세요
                    </p>
                  </div>

                  <button
                    onClick={handleStartVoice}
                    aria-label="녹음 시작하기"
                    style={{
                      width: "100%",
                      minHeight: 64,
                      borderRadius: 18,
                      background: "#26734D",
                      border: "none",
                      color: "#FFFFFF",
                      fontSize: 20,
                      fontWeight: 900,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 10,
                      cursor: "pointer",
                      boxShadow: "0 6px 18px rgba(38,115,77,0.28)",
                    }}
                  >
                    <span>🎤</span>
                    <span>녹음 시작하기</span>
                  </button>
                </>
              )}

              {/* 하단 취소 및 뒤로 가기 */}
              <button
                onClick={handleCancelVoice}
                style={{
                  height: 48,
                  paddingInline: 16,
                  borderRadius: 14,
                  background: "#F1F5F3",
                  border: "1.5px solid #D9DEDA",
                  fontSize: 16,
                  fontWeight: 800,
                  color: "#626A6E",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <span>◀</span>
                <span>취소하고 돌아가기</span>
              </button>
            </div>
          )}

          {/* ════════════════════════════════════════════════════
              3. 음성 → 텍스트 확인 화면 (Requirement 4: voice_confirm)
          ════════════════════════════════════════════════════ */}
          {step === "voice_confirm" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Requirement 4 제목: 🌷 이렇게 기록할까요? */}
              <div style={{ textAlign: "center" }}>
                <span style={{ fontSize: 28 }}>🌷</span>
                <h3 style={{ fontSize: 22, fontWeight: 900, color: "#1F5D40", margin: "4px 0 0" }}>
                  이렇게 기록할까요?
                </h3>
                <p style={{ fontSize: 16, fontWeight: 700, color: "#626A6E", margin: "4px 0 0" }}>
                  말씀하신 내용을 확인하시고 저장해 주세요
                </p>
              </div>

              {/* 내용 확인 카드 (수정 가능) */}
              <div
                style={{
                  background: "#FFFFFF",
                  border: "2.5px solid #26734D",
                  borderRadius: 20,
                  padding: "16px",
                  boxShadow: "0 4px 14px rgba(38,115,77,0.1)",
                }}
              >
                <div style={{ fontSize: 14, fontWeight: 800, color: "#26734D", marginBottom: 6 }}>
                  할머니의 이야기 👵
                </div>

                {isEditingText ? (
                  <textarea
                    value={confirmedText}
                    onChange={(e) => setConfirmedText(e.target.value)}
                    rows={4}
                    style={{
                      width: "100%",
                      borderRadius: 14,
                      border: "2px solid #26734D",
                      padding: "12px",
                      fontSize: 19,
                      fontWeight: 700,
                      lineHeight: 1.5,
                      outline: "none",
                      boxSizing: "border-box",
                      background: "#FFFDF7",
                    }}
                  />
                ) : (
                  <p
                    style={{
                      fontSize: 20,
                      fontWeight: 800,
                      color: "#252A2D",
                      lineHeight: 1.55,
                      margin: 0,
                      wordBreak: "keep-all",
                    }}
                  >
                    “{confirmedText}”
                  </p>
                )}

                {/* 실제 녹음된 원본 음성이 있는 경우 미리듣기 지원 */}
                {audioDataUrl && (
                  <div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px dashed #D9DEDA" }}>
                    <button
                      onClick={handleTogglePreviewAudio}
                      aria-label="방금 녹음한 목소리 들어보기"
                      style={{
                        width: "100%",
                        height: 46,
                        borderRadius: 12,
                        background: isPlayingPreview ? "#D1EBE0" : "#E7F4EC",
                        border: "1.5px solid #26734D",
                        color: "#1F5D40",
                        fontSize: 15,
                        fontWeight: 800,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 6,
                        cursor: "pointer",
                      }}
                    >
                      <span>{isPlayingPreview ? "⏹" : "🔊"}</span>
                      <span>{isPlayingPreview ? "목소리 멈추기" : "방금 녹음한 내 목소리 들어보기"}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Requirement 4: 버튼 3종 */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {/* 1. [ 💾 기억에 저장 ] (Primary, 가장 큼) */}
                <button
                  onClick={() => handleSave("voice", confirmedText)}
                  disabled={!confirmedText.trim() || isSaving}
                  aria-label="기억에 저장"
                  style={{
                    width: "100%",
                    minHeight: 66,
                    borderRadius: 18,
                    background: isSaving ? "#626A6E" : "#26734D",
                    border: "none",
                    color: "#FFFFFF",
                    fontSize: 20,
                    fontWeight: 900,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 10,
                    cursor: isSaving ? "wait" : "pointer",
                    boxShadow: "0 6px 18px rgba(38,115,77,0.28)",
                  }}
                >
                  <span style={{ fontSize: 22 }}>{isSaving ? "⏳" : "💾"}</span>
                  <span>{isSaving ? "안전하게 저장 중..." : "기억에 저장"}</span>
                </button>

                {/* 2. [ 🎤 다시 말하기 ] & 3. [ ✏️ 내용 고치기 ] */}
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={handleStartVoice}
                    aria-label="다시 말하기"
                    style={{
                      flex: 1,
                      minHeight: 56,
                      borderRadius: 16,
                      background: "#FFFFFF",
                      border: "2px solid #D9DEDA",
                      color: "#252A2D",
                      fontSize: 17,
                      fontWeight: 800,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                      cursor: "pointer",
                    }}
                  >
                    <span>🎤</span>
                    <span>다시 말하기</span>
                  </button>

                  <button
                    onClick={() => setIsEditingText(!isEditingText)}
                    aria-label="내용 고치기"
                    style={{
                      flex: 1,
                      minHeight: 56,
                      borderRadius: 16,
                      background: isEditingText ? "#E7F4EC" : "#FFFFFF",
                      border: "2px solid #26734D",
                      color: "#1F5D40",
                      fontSize: 17,
                      fontWeight: 800,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                      cursor: "pointer",
                    }}
                  >
                    <span>✏️</span>
                    <span>{isEditingText ? "수정 완료" : "내용 고치기"}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════
              4. 글로 기록하기 화면 (Requirement 5: text_input)
          ════════════════════════════════════════════════════ */}
          {step === "text_input" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {/* Requirement 5 제목: ✏️ 오늘 있었던 일을 적어보세요 */}
              <div style={{ textAlign: "center" }}>
                <span style={{ fontSize: 26 }}>✏️</span>
                <h3 style={{ fontSize: 21, fontWeight: 900, color: "#1F5D40", margin: "4px 0 0" }}>
                  오늘 있었던 일을 적어보세요
                </h3>
                <p style={{ fontSize: 16, fontWeight: 800, color: "#D97706", margin: "6px 0 0" }}>
                  “{currentQuestion}”
                </p>
              </div>

              {/* Requirement 5 입력창: 최소 높이 180px, 글자 크기 18~20px */}
              <textarea
                value={manualText}
                onChange={(e) => setManualText(e.target.value)}
                placeholder="예: 오늘 친구와 공원에서 산책했어요."
                rows={6}
                style={{
                  width: "100%",
                  minHeight: 180,
                  borderRadius: 18,
                  border: "2.5px solid #26734D",
                  padding: "16px",
                  fontSize: 19,
                  fontWeight: 700,
                  lineHeight: 1.55,
                  outline: "none",
                  boxSizing: "border-box",
                  resize: "none",
                  background: "#FFFFFF",
                }}
              />

              {/* Requirement 5: 하단 대형 [ 💾 기억에 저장 ] 버튼 */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <button
                  onClick={() => handleSave("text", manualText)}
                  disabled={!manualText.trim() || isSaving}
                  aria-label="기억에 저장"
                  style={{
                    width: "100%",
                    minHeight: 66,
                    borderRadius: 18,
                    background: isSaving
                      ? "#626A6E"
                      : manualText.trim()
                      ? "#26734D"
                      : "#CBD5E1",
                    border: "none",
                    color: "#FFFFFF",
                    fontSize: 20,
                    fontWeight: 900,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 10,
                    cursor: manualText.trim() && !isSaving ? "pointer" : "not-allowed",
                    boxShadow: manualText.trim() && !isSaving ? "0 6px 18px rgba(38,115,77,0.28)" : "none",
                  }}
                >
                  <span style={{ fontSize: 22 }}>{isSaving ? "⏳" : "💾"}</span>
                  <span>{isSaving ? "안전하게 저장 중..." : "기억에 저장"}</span>
                </button>

                <button
                  onClick={() => setStep("choose")}
                  style={{
                    height: 48,
                    borderRadius: 14,
                    background: "#F1F5F3",
                    border: "1.5px solid #D9DEDA",
                    fontSize: 16,
                    fontWeight: 800,
                    color: "#626A6E",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                  }}
                >
                  <span>◀</span>
                  <span>다른 방법으로 기록하기</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
