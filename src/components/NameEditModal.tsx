import { useState, useEffect } from "react";

interface NameEditModalProps {
  isOpen: boolean;
  currentName: string;
  onClose: () => void;
  onSave: (newName: string) => void;
}

export function NameEditModal({
  isOpen,
  currentName,
  onClose,
  onSave,
}: NameEditModalProps) {
  const [inputName, setInputName] = useState(currentName);

  useEffect(() => {
    if (isOpen) {
      setInputName(currentName);
    }
  }, [isOpen, currentName]);

  if (!isOpen) return null;

  const handleSave = () => {
    const trimmed = inputName.trim();
    if (trimmed) {
      onSave(trimmed);
      onClose();
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.65)",
        zIndex: 110,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 360,
          background: "#FFFDF7",
          borderRadius: 24,
          border: "3px solid #26734D",
          boxShadow: "0 20px 40px rgba(0,0,0,0.25)",
          padding: "24px 20px",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 32, marginBottom: 4 }}>👋</div>
          <h2 style={{ fontSize: 22, fontWeight: 900, color: "#1F5D40", margin: "0 0 6px" }}>
            어르신의 이름을 알려주세요
          </h2>
          <p style={{ fontSize: 15, fontWeight: 700, color: "#626A6E", margin: 0, lineHeight: 1.4 }}>
            손자·손녀가 정답게 불러드릴 이름을 적어주세요.
          </p>
        </div>

        {/* 이름 입력창 */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={{ fontSize: 14, fontWeight: 800, color: "#26734D" }}>
            이름 또는 부르고 싶은 호칭
          </label>
          <input
            type="text"
            value={inputName}
            onChange={(e) => setInputName(e.target.value)}
            placeholder="예: 김영희, 할머니, 어르신"
            maxLength={10}
            autoFocus
            style={{
              width: "100%",
              height: 56,
              borderRadius: 16,
              border: "2.5px solid #26734D",
              paddingInline: 14,
              fontSize: 20,
              fontWeight: 800,
              color: "#252A2D",
              outline: "none",
              boxSizing: "border-box",
              background: "#FFFFFF",
              textAlign: "center",
            }}
          />
        </div>

        {/* 간편 선택 추천 칩 */}
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#626A6E", marginBottom: 6, textAlign: "center" }}>
            눌러서 바로 고르실 수도 있어요 👇
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center" }}>
            {["김영희", "이순자", "박정숙", "할머니", "할아버지"].map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => setInputName(name)}
                style={{
                  background: inputName === name ? "#E7F4EC" : "#FFFFFF",
                  border: inputName === name ? "2px solid #26734D" : "1.5px solid #D9DEDA",
                  color: inputName === name ? "#26734D" : "#4A5568",
                  padding: "6px 12px",
                  borderRadius: 12,
                  fontSize: 14,
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                {name}
              </button>
            ))}
          </div>
        </div>

        {/* 저장 및 취소 버튼 */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 6 }}>
          <button
            type="button"
            onClick={handleSave}
            disabled={!inputName.trim()}
            style={{
              width: "100%",
              height: 56,
              borderRadius: 16,
              background: inputName.trim() ? "#26734D" : "#CBD5E1",
              border: "none",
              color: "#FFFFFF",
              fontSize: 18,
              fontWeight: 900,
              cursor: inputName.trim() ? "pointer" : "not-allowed",
              boxShadow: inputName.trim() ? "0 4px 14px rgba(38,115,77,0.25)" : "none",
            }}
          >
            💾 이름 저장하기
          </button>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: 15,
              fontWeight: 700,
              color: "#626A6E",
              cursor: "pointer",
              padding: "4px",
            }}
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
}
