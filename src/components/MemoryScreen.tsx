import { useState, useEffect, useRef } from "react";
import { MemoryItem } from "../types/memory";
import { memoryStorage } from "../services/memoryStorage";
import { MemoryRecordModal } from "./MemoryRecordModal";

interface MemoryScreenProps {
  onBack: () => void;
  onNavigateHome: () => void;
  onNavigateGame: () => void;
  onNavigateGuide: () => void;
  characterMode?: "boy" | "girl";
}

export function MemoryScreen({
  onBack,
  onNavigateHome,
  onNavigateGame,
  onNavigateGuide,
  characterMode = "boy",
}: MemoryScreenProps) {
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [selectedMemory, setSelectedMemory] = useState<MemoryItem | null>(null);
  const [filterMode, setFilterMode] = useState<"recent" | "byDate">("recent");
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);

  // 음성 재생 상태 관리 (오디오 또는 TTS)
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // 수정 모드 상태
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState("");

  // 삭제 확인 모달
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // 기억 목록 불러오기
  const loadMemories = () => {
    const list = memoryStorage.getMemories();
    setMemories(list);
  };

  useEffect(() => {
    loadMemories();
  }, []);

  // 음성/TTS 다시 듣기
  const handlePlayVoice = (item: MemoryItem) => {
    // 1. 이미 재생 중인 경우 정지
    if (playingId === item.id) {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        audioPlayerRef.current = null;
      }
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      setPlayingId(null);
      return;
    }

    // 다른 재생 중단
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current = null;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    // 2. 실제 녹음된 음성 오디오(Data URL)가 있는 경우 우선 재생
    if (item.audio_data_url) {
      try {
        const audio = new Audio(item.audio_data_url);
        audioPlayerRef.current = audio;
        setPlayingId(item.id);
        audio.onended = () => {
          setPlayingId(null);
          audioPlayerRef.current = null;
        };
        audio.onerror = () => {
          // 오디오 로드 실패 시 TTS로 대체
          playTts(item);
        };
        audio.play().catch(() => playTts(item));
        return;
      } catch {
        playTts(item);
        return;
      }
    }

    // 3. 녹음 오디오가 없거나 글 기록인 경우 TTS 음성 낭독
    playTts(item);
  };

  const playTts = (item: MemoryItem) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const readText = `${item.date_label}. ${item.summary || item.original_text}`;
      const utterance = new SpeechSynthesisUtterance(readText);
      utterance.lang = "ko-KR";
      utterance.rate = 0.88;
      utterance.pitch = item.character_mode === "boy" ? 1.05 : 1.25;
      utterance.onstart = () => setPlayingId(item.id);
      utterance.onend = () => setPlayingId(null);
      utterance.onerror = () => setPlayingId(null);
      window.speechSynthesis.speak(utterance);
    }
  };

  // 상세 보기 열기
  const handleOpenDetail = (item: MemoryItem) => {
    setSelectedMemory(item);
    setIsEditing(false);
    setEditText(item.summary || item.original_text);
    setShowDeleteConfirm(false);
  };

  // 상세 닫기
  const handleCloseDetail = () => {
    if (audioPlayerRef.current) audioPlayerRef.current.pause();
    window.speechSynthesis?.cancel();
    setPlayingId(null);
    setSelectedMemory(null);
    setIsEditing(false);
    setShowDeleteConfirm(false);
    loadMemories();
  };

  // 수정 내용 저장
  const handleSaveEdit = () => {
    if (!selectedMemory || !editText.trim()) return;
    memoryStorage.updateMemory(selectedMemory.id, {
      summary: editText.trim(),
      display_text: editText.trim(),
      original_text: editText.trim(),
    });
    setSelectedMemory({
      ...selectedMemory,
      summary: editText.trim(),
      display_text: editText.trim(),
      original_text: editText.trim(),
    });
    setIsEditing(false);
    loadMemories();
  };

  // 기억 삭제
  const handleDelete = () => {
    if (!selectedMemory) return;
    memoryStorage.deleteMemory(selectedMemory.id);
    handleCloseDetail();
  };

  // 정렬된 기억 목록
  const displayedMemories = [...memories].sort((a, b) => {
    if (filterMode === "recent") {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
    // 날짜별 보기
    return b.date.localeCompare(a.date);
  });

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
      {/* ── 1. 상단 헤더 ── */}
      <header
        style={{
          padding: "16px 20px",
          background: "#FFFFFF",
          borderBottom: "2px solid #EEDBB2",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
        }}
      >
        <button
          onClick={selectedMemory ? handleCloseDetail : onBack}
          aria-label="이전 화면으로"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            height: 48,
            paddingInline: 12,
            borderRadius: 14,
            border: "2px solid #D9DEDA",
            background: "#F8FAF9",
            cursor: "pointer",
          }}
        >
          <span style={{ fontSize: 20 }}>◀</span>
          <span style={{ fontSize: 16, fontWeight: 800, color: "#252A2D" }}>
            {selectedMemory ? "목록으로" : "홈으로"}
          </span>
        </button>

        <h1 style={{ fontSize: 22, fontWeight: 900, color: "#252A2D", margin: 0 }}>
          {selectedMemory ? "기억 상세 🌷" : "나의 기억 📖"}
        </h1>

        <div style={{ width: 70 }} />
      </header>

      {/* ── 2. 메인 바디 컨텐츠 ── */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
        
        {/* A. 상세 화면 */}
        {selectedMemory ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* 기억 카드 본체 */}
            <div
              style={{
                background: "#FFFFFF",
                border: "2.5px solid #26734D",
                borderRadius: 24,
                padding: "22px",
                boxShadow: "0 6px 20px rgba(38,115,77,0.12)",
                display: "flex",
                flexDirection: "column",
                gap: 14,
              }}
            >
              {/* 상단 날짜 및 뱃지 */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 17, fontWeight: 900, color: "#26734D" }}>
                  {selectedMemory.date_label}
                </span>
                <div style={{ display: "flex", gap: 6 }}>
                  <span
                    style={{
                      background: selectedMemory.input_type === "voice" ? "#EDE9FE" : "#E0F2FE",
                      color: selectedMemory.input_type === "voice" ? "#6D28D9" : "#0369A1",
                      fontSize: 13,
                      fontWeight: 800,
                      padding: "4px 8px",
                      borderRadius: 8,
                    }}
                  >
                    {selectedMemory.input_type === "voice" ? "🎤 음성 기록" : "✏️ 글 기록"}
                  </span>
                  <span
                    style={{
                      background: "#E7F4EC",
                      color: "#1F5D40",
                      fontSize: 13,
                      fontWeight: 800,
                      padding: "4px 8px",
                      borderRadius: 8,
                    }}
                  >
                    {selectedMemory.character_mode === "boy" ? "👦 손자" : "👧 손녀"}
                  </span>
                </div>
              </div>

              {/* 제목 */}
              <div style={{ fontSize: 24, fontWeight: 900, color: "#252A2D" }}>
                {selectedMemory.title}
              </div>

              {/* 질문 내용 */}
              <div
                style={{
                  background: "#FFF9ED",
                  border: "1.5px solid #EEDBB2",
                  borderRadius: 14,
                  padding: "10px 14px",
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 800, color: "#D97706" }}>손자·손녀의 질문</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#92400E", marginTop: 2 }}>
                  “{selectedMemory.question}”
                </div>
              </div>

              {/* 기억 본문 */}
              {isEditing ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    rows={4}
                    style={{
                      width: "100%",
                      borderRadius: 16,
                      border: "2.5px solid #26734D",
                      padding: "12px",
                      fontSize: 18,
                      fontWeight: 700,
                      lineHeight: 1.45,
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={handleSaveEdit}
                      style={{
                        flex: 1,
                        height: 50,
                        borderRadius: 14,
                        background: "#26734D",
                        border: "none",
                        color: "#FFFFFF",
                        fontSize: 17,
                        fontWeight: 900,
                        cursor: "pointer",
                      }}
                    >
                      ✓ 저장하기
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      style={{
                        height: 50,
                        paddingInline: 16,
                        borderRadius: 14,
                        background: "#F1F5F3",
                        border: "1.5px solid #D9DEDA",
                        fontSize: 16,
                        fontWeight: 700,
                        color: "#626A6E",
                        cursor: "pointer",
                      }}
                    >
                      취소
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    fontSize: 21,
                    fontWeight: 800,
                    color: "#252A2D",
                    lineHeight: 1.55,
                    wordBreak: "keep-all",
                    padding: "6px 0",
                  }}
                >
                  “{selectedMemory.summary || selectedMemory.original_text}”
                </div>
              )}

              {/* 다시 듣기 버튼 */}
              {!isEditing && (
                <button
                  onClick={() => handlePlayVoice(selectedMemory)}
                  aria-label="기억 다시 듣기"
                  style={{
                    width: "100%",
                    minHeight: 56,
                    borderRadius: 16,
                    background: playingId === selectedMemory.id ? "#D1EBE0" : "#E7F4EC",
                    border: "2.5px solid #26734D",
                    color: "#1F5D40",
                    fontSize: 18,
                    fontWeight: 900,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 10,
                    cursor: "pointer",
                  }}
                >
                  <span style={{ fontSize: 22 }}>
                    {playingId === selectedMemory.id ? "⏹" : "🔊"}
                  </span>
                  <span>
                    {playingId === selectedMemory.id
                      ? "재생 멈추기"
                      : selectedMemory.audio_data_url
                      ? "녹음된 내 목소리 다시 듣기"
                      : "음성으로 다시 듣기"}
                  </span>
                </button>
              )}
            </div>

            {/* 조작 버튼 (수정 & 안전 거리 둔 삭제 버튼) */}
            {!isEditing && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <button
                  onClick={() => setIsEditing(true)}
                  aria-label="내용 수정하기"
                  style={{
                    width: "100%",
                    height: 54,
                    borderRadius: 16,
                    background: "#FFFFFF",
                    border: "2px solid #D9DEDA",
                    color: "#252A2D",
                    fontSize: 17,
                    fontWeight: 800,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    cursor: "pointer",
                  }}
                >
                  <span>✏️</span>
                  <span>내용 수정</span>
                </button>

                <div style={{ paddingTop: 14, borderTop: "1px dashed #D9DEDA" }}>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    aria-label="기억 삭제하기"
                    style={{
                      width: "100%",
                      height: 48,
                      borderRadius: 14,
                      background: "#FFF5F5",
                      border: "1.5px solid #FED7D7",
                      color: "#C53030",
                      fontSize: 16,
                      fontWeight: 800,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                      cursor: "pointer",
                    }}
                  >
                    <span>🗑</span>
                    <span>이 기억 삭제하기</span>
                  </button>
                </div>
              </div>
            )}

            {/* 2차 삭제 확인 모달 */}
            {showDeleteConfirm && (
              <div
                style={{
                  background: "#FFFFFF",
                  border: "2.5px solid #E53E3E",
                  borderRadius: 20,
                  padding: "20px",
                  boxShadow: "0 10px 30px rgba(229,62,62,0.18)",
                  textAlign: "center",
                  display: "flex",
                  flexDirection: "column",
                  gap: 14,
                }}
              >
                <div style={{ fontSize: 32 }}>⚠️</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: "#C53030" }}>
                  이 기억을 정말 삭제할까요?
                </div>
                <p style={{ fontSize: 16, fontWeight: 700, color: "#626A6E", margin: 0 }}>
                  삭제한 기억은 다시 복구할 수 없어요.
                </p>
                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    onClick={handleDelete}
                    style={{
                      flex: 1,
                      height: 52,
                      borderRadius: 14,
                      background: "#E53E3E",
                      border: "none",
                      color: "#FFFFFF",
                      fontSize: 17,
                      fontWeight: 900,
                      cursor: "pointer",
                    }}
                  >
                    삭제합니다
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    style={{
                      flex: 1,
                      height: 52,
                      borderRadius: 14,
                      background: "#F1F5F3",
                      border: "1.5px solid #D9DEDA",
                      color: "#252A2D",
                      fontSize: 17,
                      fontWeight: 800,
                      cursor: "pointer",
                    }}
                  >
                    취소
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* B. 기억 목록 화면 */
          <>
            {/* ── 1. 신규 대형 [ ＋ 오늘의 기억 남기기 ] 버튼 ── */}
            <button
              onClick={() => setIsRecordModalOpen(true)}
              aria-label="오늘의 기억 남기기"
              style={{
                width: "100%",
                minHeight: 72,
                borderRadius: 18,
                background: "#26734D",
                border: "none",
                padding: "12px 20px",
                display: "flex",
                alignItems: "center",
                gap: 16,
                cursor: "pointer",
                boxShadow: "0 6px 18px rgba(38,115,77,0.28)",
                textAlign: "left",
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  background: "#FFFFFF",
                  color: "#26734D",
                  fontSize: 26,
                  fontWeight: 900,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                ＋
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 20, fontWeight: 900, color: "#FFFFFF", lineHeight: 1.25 }}>
                  오늘의 기억 남기기
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#E7F4EC", marginTop: 3 }}>
                  말하거나 글로 오늘을 남겨보세요
                </div>
              </div>
              <span style={{ fontSize: 22, color: "#FFFFFF", fontWeight: 900 }}>▶</span>
            </button>

            {/* ── 2. 간단한 필터 탭 (최근 기록 / 날짜별 보기) ── */}
            <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
              <button
                onClick={() => setFilterMode("recent")}
                style={{
                  flex: 1,
                  height: 46,
                  borderRadius: 14,
                  border: filterMode === "recent" ? "2px solid #26734D" : "1.5px solid #D9DEDA",
                  background: filterMode === "recent" ? "#E7F4EC" : "#FFFFFF",
                  color: filterMode === "recent" ? "#26734D" : "#626A6E",
                  fontSize: 16,
                  fontWeight: filterMode === "recent" ? 900 : 700,
                  cursor: "pointer",
                }}
              >
                최근 기록
              </button>
              <button
                onClick={() => setFilterMode("byDate")}
                style={{
                  flex: 1,
                  height: 46,
                  borderRadius: 14,
                  border: filterMode === "byDate" ? "2px solid #26734D" : "1.5px solid #D9DEDA",
                  background: filterMode === "byDate" ? "#E7F4EC" : "#FFFFFF",
                  color: filterMode === "byDate" ? "#26734D" : "#626A6E",
                  fontSize: 16,
                  fontWeight: filterMode === "byDate" ? 900 : 700,
                  cursor: "pointer",
                }}
              >
                날짜별 보기
              </button>
            </div>

            {/* ── 3. 기억 카드 목록 ── */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {displayedMemories.length === 0 ? (
                <div
                  style={{
                    background: "#FFFFFF",
                    border: "2px dashed #D9DEDA",
                    borderRadius: 20,
                    padding: "36px 20px",
                    textAlign: "center",
                    color: "#626A6E",
                  }}
                >
                  <div style={{ fontSize: 36, marginBottom: 8 }}>🌷</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: "#252A2D" }}>
                    아직 저장된 기억이 없어요
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 600, marginTop: 4 }}>
                    위의 [＋ 오늘의 기억 남기기]를 눌러 이야기를 남겨보세요!
                  </div>
                </div>
              ) : (
                displayedMemories.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      background: "#FFFFFF",
                      border: "2px solid #EEDBB2",
                      borderRadius: 22,
                      padding: "18px",
                      boxShadow: "0 4px 14px rgba(0,0,0,0.04)",
                      display: "flex",
                      flexDirection: "column",
                      gap: 12,
                    }}
                  >
                    {/* 카드 헤더: 날짜 & 뱃지 */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 17, fontWeight: 900, color: "#92400E" }}>
                        {item.date_label}
                      </span>
                      <span
                        style={{
                          background: item.input_type === "voice" ? "#EDE9FE" : "#E0F2FE",
                          color: item.input_type === "voice" ? "#6D28D9" : "#0369A1",
                          fontSize: 13,
                          fontWeight: 800,
                          padding: "3px 8px",
                          borderRadius: 8,
                        }}
                      >
                        {item.input_type === "voice" ? "🎤 음성 기록" : "✏️ 글 기록"}
                      </span>
                    </div>

                    {/* 제목 */}
                    <div
                      onClick={() => handleOpenDetail(item)}
                      style={{
                        fontSize: 20,
                        fontWeight: 900,
                        color: "#252A2D",
                        cursor: "pointer",
                      }}
                    >
                      {item.title}
                    </div>

                    {/* 본문 문구 */}
                    <p
                      onClick={() => handleOpenDetail(item)}
                      style={{
                        fontSize: 18,
                        fontWeight: 700,
                        color: "#374151",
                        lineHeight: 1.5,
                        margin: 0,
                        cursor: "pointer",
                        wordBreak: "keep-all",
                      }}
                    >
                      “{item.summary || item.original_text}”
                    </p>

                    {/* 하단 액션 버튼 2개 (다시 듣기 & 상세 보기) */}
                    <div style={{ display: "flex", gap: 8, paddingTop: 6, borderTop: "1px solid #F1F5F3" }}>
                      <button
                        onClick={() => handlePlayVoice(item)}
                        aria-label={`${item.title} 다시 듣기`}
                        style={{
                          flex: 1,
                          height: 48,
                          borderRadius: 14,
                          background: playingId === item.id ? "#D1EBE0" : "#E7F4EC",
                          border: "1.5px solid #26734D",
                          color: "#1F5D40",
                          fontSize: 16,
                          fontWeight: 800,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 6,
                          cursor: "pointer",
                        }}
                      >
                        <span>{playingId === item.id ? "⏹" : "🔊"}</span>
                        <span>{playingId === item.id ? "멈추기" : "다시 듣기"}</span>
                      </button>

                      <button
                        onClick={() => handleOpenDetail(item)}
                        aria-label={`${item.title} 상세 보기`}
                        style={{
                          flex: 1,
                          height: 48,
                          borderRadius: 14,
                          background: "#FFFFFF",
                          border: "1.5px solid #D9DEDA",
                          color: "#252A2D",
                          fontSize: 16,
                          fontWeight: 800,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 4,
                          cursor: "pointer",
                        }}
                      >
                        <span>상세 보기</span>
                        <span style={{ fontSize: 14 }}>▶</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>

      {/* ── 3. 기억 남기기 모달 ── */}
      <MemoryRecordModal
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
        onSaved={loadMemories}
        characterMode={characterMode}
      />

      {/* ── 4. 하단 네비게이션 4개 메뉴 ── */}
      <nav
        style={{
          height: 68,
          background: "#FFFFFF",
          borderTop: "2px solid #D9DEDA",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-around",
          flexShrink: 0,
          boxShadow: "0 -2px 10px rgba(0,0,0,0.03)",
        }}
      >
        <button
          onClick={onNavigateHome}
          aria-label="홈 화면"
          style={{
            flex: 1,
            height: "100%",
            background: "none",
            border: "none",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
            cursor: "pointer",
            color: "#626A6E",
          }}
        >
          <span style={{ fontSize: 20 }}>🏠</span>
          <span style={{ fontSize: 14, fontWeight: 700 }}>홈</span>
        </button>

        <button
          onClick={onNavigateGame}
          aria-label="두뇌 운동 화면"
          style={{
            flex: 1,
            height: "100%",
            background: "none",
            border: "none",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
            cursor: "pointer",
            color: "#626A6E",
          }}
        >
          <span style={{ fontSize: 20 }}>🧠</span>
          <span style={{ fontSize: 14, fontWeight: 700 }}>두뇌 운동</span>
        </button>

        <button
          onClick={() => {}}
          aria-label="나의 기억 화면 (현재)"
          style={{
            flex: 1,
            height: "100%",
            background: "none",
            border: "none",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
            cursor: "pointer",
            color: "#26734D",
          }}
        >
          <span style={{ fontSize: 20 }}>🌷</span>
          <span style={{ fontSize: 14, fontWeight: 900 }}>나의 기억</span>
        </button>

        <button
          onClick={onNavigateGuide}
          aria-label="생활 도움 화면"
          style={{
            flex: 1,
            height: "100%",
            background: "none",
            border: "none",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
            cursor: "pointer",
            color: "#626A6E",
          }}
        >
          <span style={{ fontSize: 20 }}>📷</span>
          <span style={{ fontSize: 14, fontWeight: 700 }}>생활 도움</span>
        </button>
      </nav>
    </div>
  );
}
