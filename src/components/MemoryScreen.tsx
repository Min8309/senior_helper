import { useState, useEffect } from "react";
import { MemoryItem } from "../types/memory";
import { memoryStorage } from "../services/memoryStorage";

interface MemoryScreenProps {
  onBack: () => void;
  onNavigateHome: () => void;
  onNavigateGame: () => void;
  onNavigateGuide: () => void;
}

export function MemoryScreen({
  onBack,
  onNavigateHome,
  onNavigateGame,
  onNavigateGuide,
}: MemoryScreenProps) {
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [selectedMemory, setSelectedMemory] = useState<MemoryItem | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);

  // 수정 상태
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

  // TTS 음성 낭독
  const handleSpeakMemory = (item: MemoryItem) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      if (playingId === item.id) {
        window.speechSynthesis.cancel();
        setPlayingId(null);
        return;
      }
      window.speechSynthesis.cancel();
      const readText = `${item.date_label}. ${item.summary}`;
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
    setEditText(item.summary);
    setShowDeleteConfirm(false);
  };

  // 상세 닫기
  const handleCloseDetail = () => {
    window.speechSynthesis?.cancel();
    setPlayingId(null);
    setSelectedMemory(null);
    setIsEditing(false);
    setShowDeleteConfirm(false);
    loadMemories();
  };

  // 수정 저장
  const handleSaveEdit = () => {
    if (!selectedMemory || !editText.trim()) return;
    memoryStorage.updateMemory(selectedMemory.id, {
      summary: editText.trim(),
      original_text: editText.trim(),
    });
    setSelectedMemory({
      ...selectedMemory,
      summary: editText.trim(),
      original_text: editText.trim(),
    });
    setIsEditing(false);
    loadMemories();
  };

  // 삭제 처리
  const handleDelete = () => {
    if (!selectedMemory) return;
    memoryStorage.deleteMemory(selectedMemory.id);
    handleCloseDetail();
  };

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

      {/* ── 2. 메인 컨텐츠 영역 ── */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px 24px" }}>
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
                gap: 16,
              }}
            >
              {/* 날짜 및 캐릭터 뱃지 */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 17, fontWeight: 900, color: "#26734D" }}>
                  {selectedMemory.date_label}
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
                  {selectedMemory.character_mode === "boy" ? "👦 손자와 대화" : "👧 손녀와 대화"}
                </span>
              </div>

              {/* 제목 */}
              <div style={{ fontSize: 24, fontWeight: 900, color: "#252A2D" }}>
                {selectedMemory.title}
              </div>

              {/* 질문 */}
              <div
                style={{
                  background: "#FFF9ED",
                  border: "1.5px solid #EEDBB2",
                  borderRadius: 14,
                  padding: "10px 14px",
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 800, color: "#D97706" }}>질문</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#92400E", marginTop: 2 }}>
                  “{selectedMemory.question}”
                </div>
              </div>

              {/* 기억 내용 (수정 모드 또는 텍스트 보기) */}
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
                    padding: "8px 0",
                  }}
                >
                  “{selectedMemory.summary}”
                </div>
              )}

              {/* 음성 다시 듣기 버튼 */}
              {!isEditing && (
                <button
                  onClick={() => handleSpeakMemory(selectedMemory)}
                  aria-label="기억 음성으로 다시 듣기"
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
                  <span style={{ fontSize: 22 }}>🔊</span>
                  <span>{playingId === selectedMemory.id ? "낭독 중 멈추기" : "음성으로 다시 듣기"}</span>
                </button>
              )}
            </div>

            {/* 주요 조작 버튼 (수정 & 안전 거리 둔 삭제 버튼) */}
            {!isEditing && (
              <div style={{ display: "flex", flexDirection: "column", gap: 20, marginTop: 4 }}>
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

                {/* 안전 거리 확보 후 삭제 버튼 배치 */}
                <div style={{ paddingTop: 16, borderTop: "1px dashed #D9DEDA" }}>
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
                <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
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
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ textAlign: "center", padding: "6px 0 10px" }}>
              <p style={{ fontSize: 17, fontWeight: 700, color: "#626A6E", margin: 0 }}>
                어르신이 남겨주신 소중한 하루 이야기입니다 🌷
              </p>
            </div>

            {memories.length === 0 ? (
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
                  홈 화면의 "오늘의 기억"에서 이야기를 남겨보세요!
                </div>
              </div>
            ) : (
              memories.map((item) => (
                <div
                  key={item.id}
                  style={{
                    background: "#FFFFFF",
                    border: "2px solid #EEDBB2",
                    borderRadius: 20,
                    padding: "18px 18px 14px",
                    boxShadow: "0 4px 14px rgba(0,0,0,0.04)",
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                  }}
                >
                  {/* 날짜 */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 16, fontWeight: 800, color: "#92400E" }}>
                      {item.date_label}
                    </span>
                    <button
                      onClick={() => handleOpenDetail(item)}
                      style={{
                        background: "#F8FAF9",
                        border: "1.5px solid #D9DEDA",
                        borderRadius: 10,
                        padding: "4px 8px",
                        fontSize: 13,
                        fontWeight: 800,
                        color: "#626A6E",
                        cursor: "pointer",
                      }}
                    >
                      상세 보기 ▶
                    </button>
                  </div>

                  {/* 제목 */}
                  <div
                    onClick={() => handleOpenDetail(item)}
                    style={{
                      fontSize: 19,
                      fontWeight: 900,
                      color: "#252A2D",
                      cursor: "pointer",
                    }}
                  >
                    {item.title}
                  </div>

                  {/* 내용 */}
                  <p
                    onClick={() => handleOpenDetail(item)}
                    style={{
                      fontSize: 17,
                      fontWeight: 700,
                      color: "#4A5568",
                      lineHeight: 1.45,
                      margin: 0,
                      cursor: "pointer",
                      wordBreak: "keep-all",
                    }}
                  >
                    “{item.summary}”
                  </p>

                  {/* 하단 다시 듣기 버튼 */}
                  <div style={{ paddingTop: 6, borderTop: "1px solid #F1F5F3" }}>
                    <button
                      onClick={() => handleSpeakMemory(item)}
                      aria-label={`${item.title} 다시 듣기`}
                      style={{
                        width: "100%",
                        height: 46,
                        borderRadius: 14,
                        background: playingId === item.id ? "#D1EBE0" : "#E7F4EC",
                        border: "1.5px solid #26734D",
                        color: "#1F5D40",
                        fontSize: 16,
                        fontWeight: 800,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        cursor: "pointer",
                      }}
                    >
                      <span>🔊</span>
                      <span>{playingId === item.id ? "멈추기" : "다시 듣기"}</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* ── 3. 하단 네비게이션 4개 메뉴 ── */}
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
