import { useState, useEffect, useRef } from "react";
import { voiceRecordService } from "../services/voiceRecordService";
import { memoryStorage } from "../services/memoryStorage";

interface MemoryRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  characterMode?: "boy" | "girl";
}

const QUESTIONS = [
  "오늘 가장 좋았던 일은 뭐였어요?",
  "오늘 누구와 이야기했어요?",
  "오늘 맛있게 드신 음식은 뭐예요?",
  "오늘 어디에 다녀오셨어요?",
  "오늘 재미있었던 일이 있었어요?",
];

type Step = "choose" | "voice_record" | "voice_confirm" | "text_input";

export function MemoryRecordModal({
  isOpen,
  onClose,
  onSaved,
  characterMode = "boy",
}: MemoryRecordModalProps) {
  // 오늘 날짜 기준 1개 질문 선택
  const today = new Date();
  const dayIndex = today.getDate() % QUESTIONS.length;
  const currentQuestion = QUESTIONS[dayIndex];

  const [step, setStep] = useState<Step>("choose");
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [confirmedText, setConfirmedText] = useState("");
  const [audioDataUrl, setAudioDataUrl] = useState<string | undefined>(undefined);
  const [isEditingText, setIsEditingText] = useState(false);

  // 글 작성용
  const [manualText, setManualText] = useState("");

  const timerRef = useRef<any>(null);

  // 모달 열릴 때 초기화
  useEffect(() => {
    if (isOpen) {
      setStep("choose");
      setIsRecording(false);
      setRecordSeconds(0);
      setLiveTranscript("");
      setConfirmedText("");
      setAudioDataUrl(undefined);
      setIsEditingText(false);
      setManualText("");
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

  // 음성 녹음 시작
  const handleStartVoice = async () => {
    setStep("voice_record");
    setLiveTranscript("");
    setRecordSeconds(0);
    setIsRecording(true);

    const started = await voiceRecordService.recordVoice((transcript) => {
      setLiveTranscript(transcript);
    });

    if (!started) {
      // 마이크 지원 안 될 경우 글 작성으로 전환 안내
      setStep("text_input");
    }
  };

  // 녹음 종료
  const handleStopVoice = async () => {
    setIsRecording(false);
    const result = await voiceRecordService.stopRecording();
    const finalTranscript = result.transcript || liveTranscript || "오늘 참 기분 좋은 하루를 보냈어요.";
    setConfirmedText(finalTranscript);
    setAudioDataUrl(result.audioDataUrl);
    setStep("voice_confirm");
  };

  // 녹음 취소
  const handleCancelVoice = () => {
    voiceRecordService.cancelRecording();
    setIsRecording(false);
    setStep("choose");
  };

  // 저장 실행 (음성 또는 글)
  const handleSave = (type: "voice" | "text", content: string) => {
    const textToSave = content.trim();
    if (!textToSave) return;

    const dateStr = today.toISOString().split("T")[0];
    const month = today.getMonth() + 1;
    const date = today.getDate();
    const dayNames = ["일", "월", "화", "수", "목", "금", "토"];
    const dayName = dayNames[today.getDay()];
    const dateLabel = `${month}월 ${date}일 ${dayName}요일`;

    // 카테고리/제목 자동 결정
    let title = "🌳 오늘의 기억";
    if (textToSave.includes("산책") || textToSave.includes("공원") || textToSave.includes("걷")) {
      title = "🌳 공원 산책";
    } else if (textToSave.includes("밥") || textToSave.includes("식사") || textToSave.includes("저녁") || textToSave.includes("점심") || textToSave.includes("음식")) {
      title = "🍲 맛있는 식사";
    } else if (textToSave.includes("친구") || textToSave.includes("만남") || textToSave.includes("커피") || textToSave.includes("동무")) {
      title = "☕ 반가운 만남";
    } else if (textToSave.includes("가족") || textToSave.includes("딸") || textToSave.includes("아들") || textToSave.includes("손자") || textToSave.includes("손녀")) {
      title = "❤️ 가족과 함께";
    } else if (textToSave.includes("병원") || textToSave.includes("약") || textToSave.includes("의사")) {
      title = "🏥 건강 챙기기";
    }

    const formattedSummary = textToSave.endsWith(".") ? textToSave : `${textToSave}.`;

    memoryStorage.saveMemory({
      date: dateStr,
      date_label: dateLabel,
      title,
      question: currentQuestion,
      input_type: type,
      original_text: textToSave,
      display_text: formattedSummary,
      summary: formattedSummary,
      character_mode: characterMode,
      audio_data_url: type === "voice" ? audioDataUrl : undefined,
    });

    onSaved();
    onClose();
  };

  // 타이머 초 포맷 (00:24)
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
          maxWidth: 380,
          background: "#FFFDF7",
          borderRadius: 28,
          border: "3px solid #26734D",
          boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          maxHeight: "90vh",
        }}
      >
        {/* 상단 닫기 바 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 18px",
            background: "#FFFFFF",
            borderBottom: "1.5px solid #EEDBB2",
          }}
        >
          <span style={{ fontSize: 18, fontWeight: 900, color: "#1F5D40" }}>
            🌷 오늘의 기억 남기기
          </span>
          <button
            onClick={() => {
              if (isRecording) voiceRecordService.cancelRecording();
              onClose();
            }}
            aria-label="닫기"
            style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              background: "#F1F5F3",
              border: "none",
              fontSize: 18,
              fontWeight: 900,
              color: "#626A6E",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ✕
          </button>
        </div>

        {/* 바디 컨텐츠 */}
        <div style={{ padding: "20px 18px", overflowY: "auto" }}>
          {/* ════════════════════════════════════════════════════
              1. 기록 방법 선택 화면 (Step: choose)
          ════════════════════════════════════════════════════ */}
          {step === "choose" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* 질문 카드 */}
              <div
                style={{
                  background: "#FFF9ED",
                  border: "2px solid #EEDBB2",
                  borderRadius: 20,
                  padding: "16px",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: 26, marginBottom: 4 }}>
                  {characterMode === "boy" ? "👦" : "👧"}
                </div>
                <div style={{ fontSize: 14, fontWeight: 800, color: "#D97706" }}>
                  {characterMode === "boy" ? "손자의 질문" : "손녀의 질문"}
                </div>
                <p
                  style={{
                    fontSize: 20,
                    fontWeight: 900,
                    color: "#252A2D",
                    margin: "6px 0 0",
                    lineHeight: 1.4,
                    wordBreak: "keep-all",
                  }}
                >
                  “할머니, {currentQuestion}”
                </p>
              </div>

              <div style={{ textAlign: "center" }}>
                <p style={{ fontSize: 17, fontWeight: 700, color: "#4A5568", margin: 0 }}>
                  오늘 있었던 일을 들려주세요 😊
                </p>
              </div>

              {/* 2개 큰 선택 버튼 */}
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {/* 1. 말로 이야기하기 (Primary) */}
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
                    boxShadow: "0 6px 18px rgba(38,115,77,0.25)",
                    textAlign: "left",
                  }}
                >
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: "50%",
                      background: "#FFFFFF",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 26,
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
                      편하게 말씀해 주세요
                    </div>
                  </div>
                  <span style={{ fontSize: 22, color: "#FFFFFF", fontWeight: 900 }}>▶</span>
                </button>

                {/* 2. 글로 기록하기 (Secondary) */}
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
                      width: 44,
                      height: 44,
                      borderRadius: "50%",
                      background: "#E7F4EC",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 22,
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
                      직접 글을 적어보세요
                    </div>
                  </div>
                  <span style={{ fontSize: 20, color: "#26734D", fontWeight: 900 }}>▶</span>
                </button>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════
              2. 음성 녹음 진행 화면 (Step: voice_record)
          ════════════════════════════════════════════════════ */}
          {step === "voice_record" && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18, textAlign: "center" }}>
              {/* 질문 문구 */}
              <div style={{ fontSize: 16, fontWeight: 800, color: "#26734D" }}>
                “{currentQuestion}”
              </div>

              {/* 녹음 상태 & 시간 */}
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  background: "#FEE2E2",
                  border: "2px solid #EF4444",
                  padding: "6px 16px",
                  borderRadius: 20,
                }}
              >
                <span style={{ width: 12, height: 12, borderRadius: "50%", background: "#EF4444", animation: "pulse 1s infinite" }} />
                <span style={{ fontSize: 17, fontWeight: 900, color: "#991B1B" }}>
                  듣고 있어요
                </span>
                <span style={{ fontSize: 17, fontWeight: 800, color: "#991B1B" }}>
                  {formatTime(recordSeconds)}
                </span>
              </div>

              {/* 중앙 큰 마이크 애니메이션 */}
              <div
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: "50%",
                  background: "#26734D",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 48,
                  color: "#FFFFFF",
                  boxShadow: "0 8px 30px rgba(38,115,77,0.35)",
                  animation: "pulse 1.4s infinite",
                }}
              >
                🎤
              </div>

              <div>
                <p style={{ fontSize: 20, fontWeight: 900, color: "#252A2D", margin: 0 }}>
                  천천히 편하게 말씀해 주세요
                </p>
                <p style={{ fontSize: 16, fontWeight: 700, color: "#626A6E", margin: "6px 0 0" }}>
                  말씀이 끝나면 아래 버튼을 눌러주세요
                </p>
              </div>

              {/* 실시간 텍스트 피드백 */}
              {liveTranscript && (
                <div
                  style={{
                    width: "100%",
                    background: "#FFFFFF",
                    border: "2px solid #D9DEDA",
                    borderRadius: 16,
                    padding: "12px 14px",
                    fontSize: 17,
                    fontWeight: 700,
                    color: "#1F5D40",
                    lineHeight: 1.4,
                    boxSizing: "border-box",
                  }}
                >
                  “{liveTranscript}”
                </div>
              )}

              {/* 녹음 끝내기 버튼 */}
              <button
                onClick={handleStopVoice}
                aria-label="녹음 끝내기"
                style={{
                  width: "100%",
                  minHeight: 64,
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
                  boxShadow: "0 6px 18px rgba(229,62,62,0.3)",
                }}
              >
                <span style={{ fontSize: 22 }}>■</span>
                <span>녹음 끝내기</span>
              </button>

              <button
                onClick={handleCancelVoice}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: 15,
                  fontWeight: 700,
                  color: "#626A6E",
                  cursor: "pointer",
                }}
              >
                취소하고 돌아가기
              </button>
            </div>
          )}

          {/* ════════════════════════════════════════════════════
              3. 음성 → 텍스트 확인 화면 (Step: voice_confirm)
          ════════════════════════════════════════════════════ */}
          {step === "voice_confirm" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ textAlign: "center" }}>
                <span style={{ fontSize: 24 }}>🌷</span>
                <h3 style={{ fontSize: 22, fontWeight: 900, color: "#1F5D40", margin: "4px 0 0" }}>
                  이렇게 기록할까요?
                </h3>
                <p style={{ fontSize: 15, fontWeight: 700, color: "#626A6E", margin: "4px 0 0" }}>
                  내용을 확인하시고 저장해 주세요
                </p>
              </div>

              {/* 변환된 텍스트 카드 (수정 가능) */}
              <div
                style={{
                  background: "#FFFFFF",
                  border: "2.5px solid #26734D",
                  borderRadius: 20,
                  padding: "16px",
                  boxShadow: "0 4px 14px rgba(38,115,77,0.1)",
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 800, color: "#26734D", marginBottom: 6 }}>
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
                      padding: "10px",
                      fontSize: 18,
                      fontWeight: 700,
                      lineHeight: 1.45,
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                ) : (
                  <p
                    style={{
                      fontSize: 19,
                      fontWeight: 800,
                      color: "#252A2D",
                      lineHeight: 1.5,
                      margin: 0,
                      wordBreak: "keep-all",
                    }}
                  >
                    “{confirmedText}”
                  </p>
                )}
              </div>

              {/* 버튼 그룹 */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {/* 1. 기억에 저장 (Primary) */}
                <button
                  onClick={() => handleSave("voice", confirmedText)}
                  aria-label="기억에 저장"
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
                  <span>💾</span>
                  <span>기억에 저장</span>
                </button>

                <div style={{ display: "flex", gap: 8 }}>
                  {/* 2. 다시 말하기 */}
                  <button
                    onClick={handleStartVoice}
                    aria-label="다시 말하기"
                    style={{
                      flex: 1,
                      minHeight: 52,
                      borderRadius: 16,
                      background: "#FFFFFF",
                      border: "2px solid #D9DEDA",
                      color: "#252A2D",
                      fontSize: 16,
                      fontWeight: 800,
                      cursor: "pointer",
                    }}
                  >
                    🎤 다시 말하기
                  </button>

                  {/* 3. 내용 고치기 */}
                  <button
                    onClick={() => setIsEditingText(!isEditingText)}
                    aria-label="내용 고치기"
                    style={{
                      flex: 1,
                      minHeight: 52,
                      borderRadius: 16,
                      background: isEditingText ? "#E7F4EC" : "#FFFFFF",
                      border: "2px solid #26734D",
                      color: "#1F5D40",
                      fontSize: 16,
                      fontWeight: 800,
                      cursor: "pointer",
                    }}
                  >
                    ✏️ {isEditingText ? "수정 완료" : "내용 고치기"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════
              4. 글로 기록하기 화면 (Step: text_input)
          ════════════════════════════════════════════════════ */}
          {step === "text_input" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ textAlign: "center" }}>
                <span style={{ fontSize: 24 }}>✏️</span>
                <h3 style={{ fontSize: 21, fontWeight: 900, color: "#1F5D40", margin: "4px 0 0" }}>
                  오늘 있었던 일을 적어보세요
                </h3>
                <p style={{ fontSize: 15, fontWeight: 700, color: "#D97706", margin: "4px 0 0" }}>
                  “{currentQuestion}”
                </p>
              </div>

              {/* 큰 텍스트 입력창 (최소 높이 180px, 글자 18~20px) */}
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
                  lineHeight: 1.5,
                  outline: "none",
                  boxSizing: "border-box",
                  resize: "none",
                  background: "#FFFFFF",
                }}
              />

              {/* 하단 대형 저장 버튼 */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <button
                  onClick={() => handleSave("text", manualText)}
                  disabled={!manualText.trim()}
                  aria-label="기억에 저장"
                  style={{
                    width: "100%",
                    minHeight: 64,
                    borderRadius: 18,
                    background: manualText.trim() ? "#26734D" : "#CBD5E1",
                    border: "none",
                    color: "#FFFFFF",
                    fontSize: 20,
                    fontWeight: 900,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 10,
                    cursor: manualText.trim() ? "pointer" : "not-allowed",
                    boxShadow: manualText.trim() ? "0 6px 18px rgba(38,115,77,0.28)" : "none",
                  }}
                >
                  <span>💾</span>
                  <span>기억에 저장</span>
                </button>

                <button
                  onClick={() => setStep("choose")}
                  style={{
                    background: "none",
                    border: "none",
                    fontSize: 15,
                    fontWeight: 700,
                    color: "#626A6E",
                    cursor: "pointer",
                    padding: "8px",
                  }}
                >
                  ◀ 다른 방법으로 기록하기
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
