import { useState, useEffect, useRef } from "react";
import { getAiGrandchildAnswer, AiAnswerResult } from "../services/aiGrandchild";

interface AiAskCardProps {
  childType: "boy" | "girl";
  onOpenGuide: () => void;
}

export function AiAskCard({ childType, onOpenGuide }: AiAskCardProps) {
  const [isListening, setIsListening] = useState(false);
  const [userQuery, setUserQuery] = useState("");
  const [aiResult, setAiResult] = useState<AiAnswerResult | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [manualText, setManualText] = useState("");

  const recognitionRef = useRef<any>(null);

  // Web Speech API 음성 인식 초기화
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.lang = "ko-KR";
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
          setIsListening(true);
        };

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          handleProcessQuestion(transcript);
        };

        recognition.onerror = () => {
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, [childType]);

  // 질문 처리 및 AI 답변 생성
  const handleProcessQuestion = (question: string) => {
    setIsListening(false);
    setUserQuery(question);
    const result = getAiGrandchildAnswer(question, childType);
    setAiResult(result);
    speakAnswer(result.answer);
  };

  // 마이크 버튼 클릭 시 음성 인식 시작
  const startListening = () => {
    if (isSpeaking) {
      window.speechSynthesis?.cancel();
      setIsSpeaking(false);
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch {
        recognitionRef.current.stop();
        setTimeout(() => recognitionRef.current.start(), 200);
      }
    } else {
      // Web Speech API 미지원 시 텍스트 입력 활성화
      setShowInput(true);
    }
  };

  // TTS 답변 재생
  const speakAnswer = (text: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "ko-KR";
      utterance.rate = 0.88;
      utterance.pitch = childType === "boy" ? 1.05 : 1.25;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const resetDialog = () => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
    setUserQuery("");
    setAiResult(null);
    setShowInput(false);
    setManualText("");
  };

  return (
    <div
      style={{
        background: "#FFFFFF",
        border: "2.5px solid #26734D",
        borderRadius: 24,
        padding: "20px",
        boxShadow: "0 6px 20px rgba(38,115,77,0.12)",
        display: "flex",
        flexDirection: "column",
        gap: 14,
      }}
    >
      {/* 카드 상단 헤더 */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 28 }}>{childType === "boy" ? "👦" : "👧"}</span>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 900, color: "#1F5D40", margin: 0 }}>
              {childType === "boy" ? "손자에게 물어보기" : "손녀에게 물어보기"}
            </h2>
            <p style={{ fontSize: 15, fontWeight: 700, color: "#626A6E", margin: "2px 0 0" }}>
              궁금한 것을 편하게 말씀해 주세요
            </p>
          </div>
        </div>
        {aiResult && (
          <button
            onClick={resetDialog}
            style={{
              background: "#F1F5F3",
              border: "1.5px solid #D9DEDA",
              borderRadius: 12,
              padding: "6px 10px",
              fontSize: 14,
              fontWeight: 700,
              color: "#626A6E",
              cursor: "pointer",
            }}
          >
            다시 질문
          </button>
        )}
      </div>

      {/* 1. 음성 인식 중 상태 */}
      {isListening && (
        <div
          style={{
            background: "#E7F4EC",
            border: "2px dashed #26734D",
            borderRadius: 18,
            padding: "20px 16px",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: "#26734D",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 30,
              color: "#FFFFFF",
              animation: "pulse 1.2s infinite",
            }}
          >
            🎤
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 900, color: "#1F5D40" }}>
              듣고 있어요.
            </div>
            <div style={{ fontSize: 17, fontWeight: 700, color: "#26734D", marginTop: 4 }}>
              천천히 말씀해 주세요
            </div>
          </div>
        </div>
      )}

      {/* 2. 대화 결과 상태 */}
      {aiResult && !isListening && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {/* 어르신 질문 */}
          <div
            style={{
              background: "#F8FAF9",
              border: "1.5px solid #E2E8E4",
              borderRadius: 16,
              padding: "12px 16px",
              display: "flex",
              alignItems: "flex-start",
              gap: 10,
            }}
          >
            <span style={{ fontSize: 24, flexShrink: 0 }}>👵</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#626A6E" }}>할머니 질문</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#252A2D", marginTop: 2 }}>
                “{userQuery}”
              </div>
            </div>
          </div>

          {/* AI 손자/손녀 답변 */}
          <div
            style={{
              background: "#E7F4EC",
              border: "2px solid #26734D",
              borderRadius: 18,
              padding: "16px",
              display: "flex",
              alignItems: "flex-start",
              gap: 12,
            }}
          >
            <span style={{ fontSize: 28, flexShrink: 0 }}>{childType === "boy" ? "👦" : "👧"}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 900, color: "#1F5D40" }}>
                {childType === "boy" ? "AI 손자 답변" : "AI 손녀 답변"}
              </div>
              <p
                style={{
                  fontSize: 18,
                  fontWeight: 800,
                  color: "#1F5D40",
                  lineHeight: 1.45,
                  margin: "6px 0 0",
                  wordBreak: "keep-all",
                }}
              >
                “{aiResult.answer}”
              </p>
            </div>
          </div>

          {/* 다시 듣기 & CTA 버튼 영역 */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
            <button
              onClick={() => speakAnswer(aiResult.answer)}
              aria-label="답변 다시 듣기"
              style={{
                width: "100%",
                minHeight: 52,
                borderRadius: 16,
                background: isSpeaking ? "#D1EBE0" : "#FFFFFF",
                border: "2px solid #26734D",
                color: "#26734D",
                fontSize: 17,
                fontWeight: 800,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                cursor: "pointer",
              }}
            >
              <span style={{ fontSize: 20 }}>🔊</span>
              <span>다시 듣기</span>
            </button>

            {/* 가전제품 질문 시 사진 촬영 CTA 버튼 */}
            {aiResult.isApplianceQuestion && (
              <button
                onClick={onOpenGuide}
                aria-label="사진 찍어 보여주기"
                style={{
                  width: "100%",
                  minHeight: 58,
                  borderRadius: 16,
                  background: "#26734D",
                  border: "none",
                  color: "#FFFFFF",
                  fontSize: 18,
                  fontWeight: 900,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(38,115,77,0.25)",
                }}
              >
                <span style={{ fontSize: 24 }}>📷</span>
                <span>사진 찍어 보여주기</span>
                <span style={{ fontSize: 18 }}>▶</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* 3. 대기 상태 (마이크 버튼 & 쉬운 예시) */}
      {!isListening && !aiResult && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
          {/* 큰 72x72px 마이크 버튼 */}
          <button
            onClick={startListening}
            aria-label="음성으로 물어보기"
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: "#26734D",
              border: "none",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              boxShadow: "0 6px 18px rgba(38,115,77,0.35)",
              transition: "transform 0.1s",
            }}
          >
            <span style={{ fontSize: 32, color: "#FFFFFF", lineHeight: 1 }}>🎤</span>
            <span style={{ fontSize: 13, fontWeight: 900, color: "#FFFFFF", marginTop: 2 }}>
              말하기
            </span>
          </button>

          {/* 자주 묻는 질문 칩 (터치 한 번으로 질문 가능) */}
          <div style={{ width: "100%", marginTop: 4 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#626A6E", marginBottom: 6, textAlign: "center" }}>
              눌러서 바로 물어보실 수도 있어요 👇
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center" }}>
              {[
                { label: "에어컨 어떻게 켜?", q: "에어컨 어떻게 켜?" },
                { label: "오늘 날씨 어때?", q: "오늘 날씨 어때?" },
                { label: "세탁기 탈수 어떻게 해?", q: "세탁기 탈수 어떻게 해?" },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={() => handleProcessQuestion(item.q)}
                  style={{
                    background: "#F1F5F3",
                    border: "1.5px solid #D9DEDA",
                    borderRadius: 14,
                    padding: "8px 12px",
                    fontSize: 14,
                    fontWeight: 800,
                    color: "#252A2D",
                    cursor: "pointer",
                  }}
                >
                  💬 {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* 텍스트 입력창 토글 */}
          {showInput ? (
            <div style={{ width: "100%", display: "flex", gap: 8, marginTop: 4 }}>
              <input
                type="text"
                placeholder="궁금한 내용을 적어주세요"
                value={manualText}
                onChange={(e) => setManualText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && manualText.trim()) {
                    handleProcessQuestion(manualText);
                  }
                }}
                style={{
                  flex: 1,
                  height: 48,
                  borderRadius: 14,
                  border: "2px solid #D9DEDA",
                  paddingInline: 12,
                  fontSize: 16,
                  fontWeight: 600,
                  outline: "none",
                }}
              />
              <button
                onClick={() => {
                  if (manualText.trim()) handleProcessQuestion(manualText);
                }}
                style={{
                  height: 48,
                  paddingInline: 16,
                  borderRadius: 14,
                  background: "#26734D",
                  border: "none",
                  color: "#FFFFFF",
                  fontSize: 16,
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                질문
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowInput(true)}
              style={{
                background: "none",
                border: "none",
                fontSize: 13,
                fontWeight: 700,
                color: "#626A6E",
                textDecoration: "underline",
                cursor: "pointer",
                padding: 4,
              }}
            >
              ⌨️ 글자로 입력하기
            </button>
          )}
        </div>
      )}
    </div>
  );
}
