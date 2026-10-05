import React from "react";

export type NavScreen = "home" | "game" | "memory" | "guide";

interface BottomNavBarProps {
  currentScreen: NavScreen;
  onNavigateHome: () => void;
  onNavigateGame: () => void;
  onNavigateMemory: () => void;
  onNavigateGuide: () => void;
}

/**
 * ─── BottomNavBar ────────────────────────────────────────────────────────────
 * 시니어 친화적 하단 고정 메뉴바 (하단 독 스타일)
 * - 🏠 홈
 * - 🧠 두뇌 운동
 * - 🌷 나의 기억
 * - 📷 생활 도움
 */
export function BottomNavBar({
  currentScreen,
  onNavigateHome,
  onNavigateGame,
  onNavigateMemory,
  onNavigateGuide,
}: BottomNavBarProps) {
  const tabs = [
    {
      id: "home" as const,
      label: "홈",
      icon: "🏠",
      onClick: onNavigateHome,
      ariaLabel: "홈 화면",
    },
    {
      id: "game" as const,
      label: "두뇌 운동",
      icon: "🧠",
      onClick: onNavigateGame,
      ariaLabel: "두뇌 운동 화면으로 이동",
    },
    {
      id: "memory" as const,
      label: "나의 기억",
      icon: "🌷",
      onClick: onNavigateMemory,
      ariaLabel: "나의 기억 화면으로 이동",
    },
    {
      id: "guide" as const,
      label: "생활 도움",
      icon: "📷",
      onClick: onNavigateGuide,
      ariaLabel: "생활 도움 카메라 화면으로 이동",
    },
  ];

  return (
    <nav
      style={{
        height: 72,
        background: "#FFFFFF",
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        borderTop: "1.5px solid #EFEAE0",
        boxShadow: "0 -4px 20px rgba(0, 0, 0, 0.07)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-around",
        flexShrink: 0,
        position: "relative",
        zIndex: 20,
        padding: "4px 8px 6px",
      }}
      aria-label="하단 주 메뉴"
    >
      {tabs.map((tab) => {
        const isActive = currentScreen === tab.id;
        return (
          <button
            key={tab.id}
            onClick={tab.onClick}
            aria-label={tab.ariaLabel}
            aria-current={isActive ? "page" : undefined}
            style={{
              flex: 1,
              height: "100%",
              background: "transparent",
              border: "none",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 3,
              cursor: "pointer",
              padding: "4px 0",
              borderRadius: 16,
              transition: "transform 0.15s ease, background 0.15s ease",
            }}
          >
            {/* 아이콘 컨테이너 */}
            <div
              style={{
                width: 38,
                height: 32,
                borderRadius: 12,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: isActive ? "#E8F5E9" : "transparent",
                transform: isActive ? "scale(1.08)" : "scale(1)",
                transition: "all 0.15s ease",
              }}
            >
              <span
                style={{
                  fontSize: 22,
                  lineHeight: 1,
                  filter: isActive
                    ? "drop-shadow(0 2px 4px rgba(27, 94, 32, 0.2))"
                    : "none",
                }}
              >
                {tab.icon}
              </span>
            </div>

            {/* 텍스트 라벨 */}
            <span
              style={{
                fontSize: 13.5,
                fontWeight: isActive ? 900 : 700,
                color: isActive ? "#1B5E20" : "#626A6E",
                letterSpacing: "-0.2px",
                lineHeight: 1.2,
                transition: "color 0.15s ease",
              }}
            >
              {tab.label}
            </span>

            {/* 활성 상태 미니 인디케이터 점 */}
            {isActive && (
              <span
                style={{
                  position: "absolute",
                  bottom: 4,
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  background: "#1B5E20",
                }}
              />
            )}
          </button>
        );
      })}
    </nav>
  );
}
