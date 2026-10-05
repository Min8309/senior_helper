import { useState, useEffect, useRef } from "react";
import { MemoryItem, CharacterMode } from "../types/memory";
import { getMemories, updateMemory, deleteMemory } from "../services/memoryService";
import { MemoryRecordModal } from "./MemoryRecordModal";
import { BottomNavBar } from "./BottomNavBar";

interface MemoryScreenProps {
  onBack: () => void;
  onNavigateHome: () => void;
  onNavigateGame: () => void;
  onNavigateGuide: () => void;
  characterMode?: CharacterMode;
}

export function MemoryScreen({
  onBack,
  onNavigateHome,
  onNavigateGame,
  onNavigateGuide,
  characterMode = "boy",
}: MemoryScreenProps) {
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMemory, setSelectedMemory] = useState<MemoryItem | null>(null);
  const [filterMode, setFilterMode] = useState<"recent" | "byDate">("recent");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [visibleCount, setVisibleCount] = useState(6); // Requirement 11: 점진적 렌더링

  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);

  // 음성 재생 상태 관리
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // 상세 보기 내 수정 상태
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState("");

  // 상세 보기 내 삭제 확인
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // 기억 목록 불러오기 (Supabase 최신순 created_at DESC + 로컬 동기화)
  const loadMemories = async () => {
    setIsLoading(true);
    try {
      const list = await getMemories();
      setMemories(list);
    } catch (err) {
      console.warn("기억 목록 불러오기 오류:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMemories();
  }, []);

  // ══════════════════════════════════════════════════════════════════════════
  // Requirement 10: 다시 듣기 기능 (두 방식이 코드에서 명확하게 구분되도록 구현)
  // ══════════════════════════════════════════════════════════════════════════

  // [방식 1] 실제 사용자가 녹음했던 원본 음성 오디오 재생 (HTML5 Audio / Data URL)
  const playOriginalAudio = (item: MemoryItem) => {
    if (!item.audio_data_url) return;

    try {
      const audio = new Audio(item.audio_data_url);
      audioPlayerRef.current = audio;
      setPlayingId(item.id);

      audio.onended = () => {
        setPlayingId(null);
        audioPlayerRef.current = null;
      };

      audio.onerror = () => {
        console.warn("녹음 오디오 재생 실패, TTS로 전환합니다.");
        audioPlayerRef.current = null;
        // 오디오 로드 실패 시 [방식 2] TTS로 대체
        playTextToSpeech(item);
      };

      audio.play().catch(() => {
        playTextToSpeech(item);
      });
    } catch {
      playTextToSpeech(item);
    }
  };

  // [방식 2] 원본 음성이 없거나 파일 재생 불가 시 TTS 음성 낭독 (Web Speech Synthesis)
  const playTextToSpeech = (item: MemoryItem) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();

      const textToRead = `${item.date_label}. ${item.display_text || item.summary || item.original_text}`;
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.lang = "ko-KR";
      utterance.rate = 0.88; // 어르신을 위한 차분한 속도
      utterance.pitch = item.character_mode === "boy" || item.character_mode === "grandson" ? 1.05 : 1.25;

      utterance.onstart = () => setPlayingId(item.id);
      utterance.onend = () => setPlayingId(null);
      utterance.onerror = () => setPlayingId(null);

      window.speechSynthesis.speak(utterance);
    }
  };

  // 다시 듣기 버튼 통합 핸들러
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

    // 다른 모든 오디오 및 TTS 중단
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current = null;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    // Requirement 10: 원본 음성 여부에 따른 명확한 분기 실행
    if (item.audio_data_url) {
      // 방식 1: 원본 녹음 음성 재생
      playOriginalAudio(item);
    } else {
      // 방식 2: 텍스트 TTS 낭독
      playTextToSpeech(item);
    }
  };

  // 상세 보기 열기
  const handleOpenDetail = (item: MemoryItem) => {
    setSelectedMemory(item);
    setIsEditing(false);
    setEditText(item.display_text || item.summary || item.original_text);
    setShowDeleteConfirm(false);
  };

  // 상세 보기 닫기
  const handleCloseDetail = () => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current = null;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setPlayingId(null);
    setSelectedMemory(null);
    setIsEditing(false);
    setShowDeleteConfirm(false);
    loadMemories();
  };

  // 상세 내 내용 수정 저장
  const handleSaveEdit = async () => {
    if (!selectedMemory || !editText.trim()) return;
    const updatedText = editText.trim();

    await updateMemory(selectedMemory.id, {
      display_text: updatedText,
      summary: updatedText,
      original_text: updatedText,
    });

    setSelectedMemory({
      ...selectedMemory,
      display_text: updatedText,
      summary: updatedText,
      original_text: updatedText,
    });
    setIsEditing(false);
    loadMemories();
  };

  // 기억 삭제 (Supabase 및 로컬 영구 삭제)
  const handleDelete = async () => {
    if (!selectedMemory) return;
    await deleteMemory(selectedMemory.id);
    handleCloseDetail();
  };

  // 검색 및 정렬 필터링
  const filteredMemories = memories.filter((item) => {
    if (!searchKeyword.trim()) return true;
    const kw = searchKeyword.trim().toLowerCase();
    return (
      item.title.toLowerCase().includes(kw) ||
      (item.display_text && item.display_text.toLowerCase().includes(kw)) ||
      item.original_text.toLowerCase().includes(kw) ||
      item.date_label.toLowerCase().includes(kw)
    );
  });

  const sortedMemories = [...filteredMemories].sort((a, b) => {
    if (filterMode === "recent") {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
    // 날짜별 보기 (date 기준)
    return b.date.localeCompare(a.date);
  });

  // Requirement 11: 점진적 렌더링 (많은 기록 대비)
  const displayedMemories = sortedMemories.slice(0, visibleCount);
  const hasMore = sortedMemories.length > visibleCount;

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
      {/* ── 1. 상단 헤더 (Requirement 1: < 홈으로 / 나의 기억 📖) ── */}
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
          aria-label={selectedMemory ? "목록으로 돌아가기" : "홈으로 돌아가기"}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            height: 48,
            paddingInline: 14,
            borderRadius: 14,
            border: "2px solid #D9DEDA",
            background: "#F8FAF9",
            cursor: "pointer",
          }}
        >
          <span style={{ fontSize: 20 }}>◀</span>
          <span style={{ fontSize: 17, fontWeight: 800, color: "#252A2D" }}>
            {selectedMemory ? "목록으로" : "홈으로"}
          </span>
        </button>

        <h1 style={{ fontSize: 22, fontWeight: 900, color: "#252A2D", margin: 0 }}>
          {selectedMemory ? "기억 상세 🌷" : "나의 기억 📖"}
        </h1>

        <div style={{ width: 72 }} />
      </header>

      {/* ── 2. 메인 바디 컨텐츠 ── */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          padding: "16px 20px 24px",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        {/* ────────────────────────────────────────────────────────
            A. 상세 보기 모드
        ──────────────────────────────────────────────────────── */}
        {selectedMemory ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
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
                <span style={{ fontSize: 18, fontWeight: 900, color: "#26734D" }}>
                  {selectedMemory.date_label}
                </span>
                <div style={{ display: "flex", gap: 6 }}>
                  <span
                    style={{
                      background: selectedMemory.input_type === "voice" ? "#EDE9FE" : "#E0F2FE",
                      color: selectedMemory.input_type === "voice" ? "#6D28D9" : "#0369A1",
                      fontSize: 14,
                      fontWeight: 800,
                      padding: "4px 10px",
                      borderRadius: 10,
                    }}
                  >
                    {selectedMemory.input_type === "voice" ? "🎤 음성 기록" : "✏️ 글 기록"}
                  </span>
                  <span
                    style={{
                      background: "#E7F4EC",
                      color: "#1F5D40",
                      fontSize: 14,
                      fontWeight: 800,
                      padding: "4px 10px",
                      borderRadius: 10,
                    }}
                  >
                    {selectedMemory.character_mode === "girl" || selectedMemory.character_mode === "granddaughter"
                      ? "👧 손녀"
                      : "👦 손자"}
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
                  borderRadius: 16,
                  padding: "12px 14px",
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 800, color: "#D97706" }}>
                  손자·손녀의 질문
                </div>
                <div style={{ fontSize: 17, fontWeight: 700, color: "#92400E", marginTop: 2 }}>
                  “{selectedMemory.question}”
                </div>
              </div>

              {/* 기억 본문 (수정 모드 vs 일반 모드) */}
              {isEditing ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    rows={4}
                    style={{
                      width: "100%",
                      borderRadius: 16,
                      border: "2.5px solid #26734D",
                      padding: "12px",
                      fontSize: 19,
                      fontWeight: 700,
                      lineHeight: 1.5,
                      outline: "none",
                      boxSizing: "border-box",
                      background: "#FFFDF7",
                    }}
                  />
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={handleSaveEdit}
                      aria-label="수정 내용 저장"
                      style={{
                        flex: 1,
                        height: 52,
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
                      aria-label="수정 취소"
                      style={{
                        height: 52,
                        paddingInline: 18,
                        borderRadius: 14,
                        background: "#F1F5F3",
                        border: "1.5px solid #D9DEDA",
                        fontSize: 16,
                        fontWeight: 800,
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
                    lineHeight: 1.6,
                    wordBreak: "keep-all",
                    padding: "6px 0",
                  }}
                >
                  “{selectedMemory.display_text || selectedMemory.summary || selectedMemory.original_text}”
                </div>
              )}

              {/* Requirement 10: 다시 듣기 버튼 */}
              {!isEditing && (
                <button
                  onClick={() => handlePlayVoice(selectedMemory)}
                  aria-label="기억 다시 듣기"
                  style={{
                    width: "100%",
                    minHeight: 58,
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

            {/* 조작 버튼 (수정 & 삭제) */}
            {!isEditing && (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <button
                  onClick={() => setIsEditing(true)}
                  aria-label="내용 수정하기"
                  style={{
                    width: "100%",
                    height: 56,
                    borderRadius: 16,
                    background: "#FFFFFF",
                    border: "2px solid #D9DEDA",
                    color: "#252A2D",
                    fontSize: 18,
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

                <div style={{ paddingTop: 12, borderTop: "1px dashed #D9DEDA" }}>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    aria-label="기억 삭제하기"
                    style={{
                      width: "100%",
                      height: 50,
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
          /* ────────────────────────────────────────────────────────
              B. 기억 목록 모드
          ──────────────────────────────────────────────────────── */
          <>
            {/* ── Requirement 1: 신규 대형 [ ＋ 오늘의 기억 남기기 ] 버튼 ── */}
            <button
              onClick={() => setIsRecordModalOpen(true)}
              aria-label="오늘의 기억 남기기"
              style={{
                width: "100%",
                minHeight: 72,
                borderRadius: 18,
                background: "#26734D",
                border: "none",
                padding: "14px 20px",
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

            {/* ── Requirement 11: 간단한 필터 탭 [ 최근 기록 ] [ 날짜별 보기 ] ── */}
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setFilterMode("recent")}
                aria-label="최근 기록 보기"
                style={{
                  flex: 1,
                  height: 48,
                  borderRadius: 14,
                  border: filterMode === "recent" ? "2.5px solid #26734D" : "1.5px solid #D9DEDA",
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
                aria-label="날짜별 보기"
                style={{
                  flex: 1,
                  height: 48,
                  borderRadius: 14,
                  border: filterMode === "byDate" ? "2.5px solid #26734D" : "1.5px solid #D9DEDA",
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

            {/* 기억 검색 입력창 (확장성) */}
            <div style={{ position: "relative" }}>
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="🔍 기억 검색 (예: 공원, 친구, 가족)"
                style={{
                  width: "100%",
                  height: 48,
                  borderRadius: 14,
                  border: "1.5px solid #D9DEDA",
                  paddingInline: "14px 40px",
                  fontSize: 16,
                  fontWeight: 600,
                  outline: "none",
                  boxSizing: "border-box",
                  background: "#FFFFFF",
                }}
              />
              {searchKeyword && (
                <button
                  onClick={() => setSearchKeyword("")}
                  aria-label="검색어 지우기"
                  style={{
                    position: "absolute",
                    right: 10,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    fontSize: 16,
                    color: "#9CA3AF",
                    cursor: "pointer",
                  }}
                >
                  ✕
                </button>
              )}
            </div>

            {/* ── Requirement 8: 기억 카드 목록 ── */}
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
                    {searchKeyword ? "검색된 기억이 없어요" : "아직 저장된 기억이 없어요"}
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 600, marginTop: 4 }}>
                    {searchKeyword
                      ? "다른 단어로 찾아보시거나 새로운 기억을 남겨보세요!"
                      : "위의 [＋ 오늘의 기억 남기기]를 눌러 이야기를 남겨보세요!"}
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
                    {/* 카드 헤더: 날짜 & 뱃지 (Requirement 8) */}
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
                          padding: "3px 9px",
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
                      “{item.display_text || item.summary || item.original_text}”
                    </p>

                    {/* Requirement 8: 하단 액션 버튼
                        - 음성 기록: [ 🔊 다시 듣기 ] [ 상세 보기 ▶ ]
                        - 글 기록: [ 상세 보기 ▶ ]
                    */}
                    <div style={{ paddingTop: 8, borderTop: "1px solid #F1F5F3" }}>
                      {item.input_type === "voice" ? (
                        <div style={{ display: "flex", gap: 8 }}>
                          {/* [ 🔊 다시 듣기 ] */}
                          <button
                            onClick={() => handlePlayVoice(item)}
                            aria-label={`${item.title} 다시 듣기`}
                            style={{
                              flex: 1,
                              height: 50,
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

                          {/* [ 상세 보기 ▶ ] */}
                          <button
                            onClick={() => handleOpenDetail(item)}
                            aria-label={`${item.title} 상세 보기`}
                            style={{
                              flex: 1,
                              height: 50,
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
                      ) : (
                        /* 글 기록: 단독 대형 [ 상세 보기 ▶ ] 버튼 (Requirement 8) */
                        <button
                          onClick={() => handleOpenDetail(item)}
                          aria-label={`${item.title} 상세 보기`}
                          style={{
                            width: "100%",
                            height: 50,
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
                      )}
                    </div>
                  </div>
                ))
              )}

              {/* Requirement 11: 기록이 많아지는 경우 점진적 로딩 [ 이전 기억 더 보기 ] */}
              {hasMore && (
                <button
                  onClick={() => setVisibleCount((prev) => prev + 5)}
                  aria-label="이전 기억 더 보기"
                  style={{
                    width: "100%",
                    minHeight: 54,
                    borderRadius: 16,
                    background: "#FFFFFF",
                    border: "2px solid #26734D",
                    color: "#26734D",
                    fontSize: 17,
                    fontWeight: 800,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    cursor: "pointer",
                    boxShadow: "0 2px 8px rgba(38,115,77,0.08)",
                    marginTop: 4,
                  }}
                >
                  <span>⬇</span>
                  <span>이전 기억 더 보기 ({sortedMemories.length - visibleCount}개 남음)</span>
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {/* ── 3. 기억 남기기 모달 (Requirement 2~7) ── */}
      <MemoryRecordModal
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
        onSaved={loadMemories}
        characterMode={characterMode}
      />

      {/* ── 4. 하단 네비게이션 4개 메뉴 (BottomNavBar 일원화) ── */}
      <BottomNavBar
        currentScreen="memory"
        onNavigateHome={onNavigateHome}
        onNavigateGame={onNavigateGame}
        onNavigateMemory={() => {}}
        onNavigateGuide={onNavigateGuide}
      />
    </div>
  );
}
