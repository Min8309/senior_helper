import { useState, useEffect, useRef } from "react";
import { memoryStorage } from "../services/memoryStorage";

interface TodayMemoryCardProps {
  childType: "boy" | "girl";
  onViewMemories: () => void;
}

const QUESTIONS = [
  "오늘 가장 좋았던 일은 뭐였어요?",
  "오늘 누구와 이야기했어요?",
  "오늘 맛있게 드신 음식은 뭐예요?",
  "오늘 어디에 다녀오셨어요?",
];

export function TodayMemoryCard({ childType, onViewMemories }: TodayMemoryCardProps) {
  // 오늘 날짜 기준 고정 질문 선정 (하루 1질문)
  const today = new Date();
  const dayIndex = today.getDate() % QUESTIONS.length;
  const currentQuestion = QUESTIONS[dayIndex];

  const [isRecording, setIsRecording] = useState(false);
  const [spokenText, setSpokenText] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const [isSpeakingFeedback, setIsSpeakingFeedback] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [inputVal, setInputVal] = useState("");

  const recognitionRef = useRef<any>(null);

  // 음성 인식 설정
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
          setIsRecording(true);
        };

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setSpokenText(transcript);
          setIsRecording(false);
        };

        recognition.onerror = () => {
          setIsRecording(false);
        };

        recognition.onend = () => {
          setIsRecording(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  const handleStartTalk = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch {
        recognitionRef.current.stop();
        setTimeout(() => recognitionRef.current.start(), 200);
      }
    } else {
      setShowInput(true);
    }
  };

  const handleSaveMemory = () => {
    const textToSave = spokenText.trim() || inputVal.trim();
    if (!textToSave) return;

    const dateStr = today.toISOString().split("T")[0];
    const month = today.getMonth() + 1;
    const date = today.getDate();
    const dayNames = ["일", "월", "화", "수", "목", "금", "토"];
    const dayName = dayNames[today.getDay()];
    const dateLabel = `${month}월 ${date}일 ${dayName}요일`;

    // 간단한 제목 생성
    let title = "🌳 오늘의 기억";
    if (textToSave.includes("산책") || textToSave.includes("공원") || textToSave.includes("걷")) {
      title = "🌳 공원 산책";
    } else if (textToSave.includes("밥") || textToSave.includes("식사") || textToSave.includes("저녁") || textToSave.includes("점심")) {
      title = "🍲 맛있는 식사";
    } else if (textToSave.includes("친구") || textToSave.includes("만남") || textToSave.includes("커피")) {
      title = "☕ 반가운 만남";
    } else if (textToSave.includes("가족") || textToSave.includes("딸") || textToSave.includes("아들") || textToSave.includes("손자")) {
      title = "❤️ 가족과 함께";
    }

    memoryStorage.saveMemory({
      date: dateStr,
      date_label: dateLabel,
      title,
      question: currentQuestion,
      input_type: spokenText.trim() ? "voice" : "text",
      original_text: textToSave,
      summary: textToSave.endsWith("요.") || textToSave.endsWith("다.") ? textToSave : `${textToSave}했어요.`,
      character_mode: childType,
    });

    setIsSaved(true);

    // 저장 완료 음성 안내
    const feedback = childType === "boy"
      ? "좋은 하루였네요! 오늘 이야기도 제가 소중하게 잘 간직해둘게요 😊"
      : "정말 따뜻한 하루였네요! 오늘 소중한 기억 잘 보관해둘게요 💖";

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(feedback);
      utterance.lang = "ko-KR";
      utterance.rate = 0.88;
      utterance.pitch = childType === "boy" ? 1.05 : 1.25;
      utterance.onstart = () => setIsSpeakingFeedback(true);
      utterance.onend = () => setIsSpeakingFeedback(false);
      utterance.onerror = () => setIsSpeakingFeedback(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleReset = () => {
    setSpokenText("");
    setInputVal("");
    setIsSaved(false);
    setShowInput(false);
  };

  return (
    <div
      style={{
        background: "#FFFDF7",
        border: "2.5px solid #EEDBB2",
        borderRadius: 24,
        padding: "20px",
        boxShadow: "0 6px 18px rgba(242,162,58,0.1)",
        display: "flex",
        flexDirection: "column",
        gap: 14,
      }}
    >
      {/* 카드 제목 */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 24 }}>🌷</span>
          <span style={{ fontSize: 20, fontWeight: 900, color: "#92400E" }}>
            오늘의 기억
          </span>
        </div>
        <button
          onClick={onViewMemories}
          aria-label="나의 기억 저장소로 이동"
          style={{
            background: "#FEF3C7",
            border: "1.5px solid #FCD34D",
            borderRadius: 12,
            padding: "5px 10px",
            fontSize: 14,
            fontWeight: 800,
            color: "#92400E",
            cursor: "pointer",
          }}
        >
          기억함 📖
        </button>
      </div>

      {/* 오늘의 질문 */}
      <div
        style={{
          background: "#FFFFFF",
          border: "2px solid #EEDBB2",
          borderRadius: 18,
          padding: "14px 16px",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 14, fontWeight: 800, color: "#D97706", marginBottom: 4 }}>
          {childType === "boy" ? "손자의 질문" : "손녀의 질문"} 💭
        </div>
        <p style={{ fontSize: 19, fontWeight: 900, color: "#252A2D", margin: 0, lineHeight: 1.35, wordBreak: "keep-all" }}>
          “{currentQuestion}”
        </p>
      </div>

      {/* 음성 녹음/인식 중 안내 */}
      {isRecording && (
        <div
          style={{
            background: "#FEF3C7",
            border: "2px dashed #D97706",
            borderRadius: 16,
            padding: "16px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 24, animation: "bounce 1s infinite" }}>🎙️</div>
          <div style={{ fontSize: 18, fontWeight: 900, color: "#92400E", marginTop: 4 }}>
            이야기를 듣고 있어요...
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#B45309", marginTop: 2 }}>
            편안하게 말씀해 주세요
          </div>
        </div>
      )}

      {/* 저장 전 말씀하신 내용 확인 */}
      {(spokenText || inputVal) && !isSaved && !isRecording && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div
            style={{
              background: "#FFFFFF",
              border: "2px solid #26734D",
              borderRadius: 16,
              padding: "14px 16px",
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 800, color: "#26734D" }}>
              할머니의 이야기 👵
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#252A2D", marginTop: 4, lineHeight: 1.4 }}>
              “{spokenText || inputVal}”
            </div>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={handleSaveMemory}
              aria-label="오늘의 기억 저장하기"
              style={{
                flex: 1,
                minHeight: 56,
                borderRadius: 16,
                background: "#26734D",
                border: "none",
                color: "#FFFFFF",
                fontSize: 18,
                fontWeight: 900,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(38,115,77,0.25)",
              }}
            >
              <span>💾</span>
              <span>오늘의 기억 저장</span>
            </button>
            <button
              onClick={handleReset}
              aria-label="다시 말하기"
              style={{
                width: 60,
                borderRadius: 16,
                background: "#F1F5F3",
                border: "1.5px solid #D9DEDA",
                fontSize: 15,
                fontWeight: 700,
                color: "#626A6E",
                cursor: "pointer",
              }}
            >
              다시
            </button>
          </div>
        </div>
      )}

      {/* 저장 완료 상태 */}
      {isSaved && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div
            style={{
              background: "#E7F4EC",
              border: "2px solid #26734D",
              borderRadius: 18,
              padding: "16px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 26 }}>✓</div>
            <div style={{ fontSize: 19, fontWeight: 900, color: "#1F5D40", marginTop: 2 }}>
              기억을 저장했어요
            </div>
            <p style={{ fontSize: 16, fontWeight: 700, color: "#26734D", margin: "6px 0 0", lineHeight: 1.4 }}>
              {childType === "boy"
                ? "“좋은 하루였네요 😊 오늘 이야기도 잘 간직해둘게요.”"
                : "“정말 따뜻한 하루였네요 💕 오늘 소중한 기억 잘 보관할게요.”"}
            </p>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={onViewMemories}
              style={{
                flex: 1,
                height: 52,
                borderRadius: 16,
                background: "#26734D",
                border: "none",
                color: "#FFFFFF",
                fontSize: 17,
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              📖 나의 기억에서 보기
            </button>
            <button
              onClick={handleReset}
              style={{
                height: 52,
                paddingInline: 14,
                borderRadius: 16,
                background: "#FFFFFF",
                border: "2px solid #D9DEDA",
                fontSize: 15,
                fontWeight: 700,
                color: "#626A6E",
                cursor: "pointer",
              }}
            >
              새로 쓰기
            </button>
          </div>
        </div>
      )}

      {/* 기본 대기 상태 (이야기하기 버튼) */}
      {!spokenText && !inputVal && !isSaved && !isRecording && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "center" }}>
          {/* 큰 이야기하기 버튼 (배경 #E7F4EC, 텍스트 #26734D) */}
          <button
            onClick={handleStartTalk}
            aria-label="음성으로 오늘 이야기하기"
            style={{
              width: "100%",
              minHeight: 64,
              borderRadius: 18,
              background: "#E7F4EC",
              border: "2.5px solid #26734D",
              color: "#26734D",
              fontSize: 20,
              fontWeight: 900,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              cursor: "pointer",
              boxShadow: "0 4px 14px rgba(38,115,77,0.12)",
              transition: "transform 0.1s",
            }}
          >
            <span style={{ fontSize: 26 }}>🎤</span>
            <span>이야기하기</span>
          </button>

          {/* 텍스트 입력 지원 */}
          {showInput ? (
            <div style={{ width: "100%", display: "flex", gap: 8 }}>
              <input
                type="text"
                placeholder="오늘 있었던 일을 적어주세요"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
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
                  if (inputVal.trim()) setSpokenText(inputVal);
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
                입력
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
              ⌨️ 글자로 적기
            </button>
          )}
        </div>
      )}
    </div>
  );
}
