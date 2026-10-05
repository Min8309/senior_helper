import React from "react";

/**
 * ─── CozySunlitBackdrop ──────────────────────────────────────────────────────
 * 시니어 사용자의 인지적 안정감과 편안함을 위한 잔잔하고 따뜻한 배경 컴포넌트
 * - 아침 창문으로 비쳐 들어오는 부드러운 햇살 (Golden Sunbeams)
 * - 공기 중에 부드럽게 흩날리는 따뜻한 햇살 입자 (Floating Warm Dust Motes)
 * - 아늑한 방 안의 창틀과 화분 실루엣 (Cozy Room & Window Silhouettes)
 * - 포근한 웜톤(베이지/피치/골든 선셋) 그라데이션 베이스
 */
export function CozySunlitBackdrop() {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
        zIndex: 0,
      }}
      aria-hidden="true"
    >
      <style>{`
        @keyframes sunRayDrift {
          0% { opacity: 0.55; transform: rotate(-2deg) scale(1); }
          50% { opacity: 0.85; transform: rotate(1deg) scale(1.03); }
          100% { opacity: 0.55; transform: rotate(-2deg) scale(1); }
        }
        @keyframes moteFloat1 {
          0% { transform: translateY(0px) translateX(0px); opacity: 0.4; }
          50% { transform: translateY(-16px) translateX(6px); opacity: 0.85; }
          100% { transform: translateY(0px) translateX(0px); opacity: 0.4; }
        }
        @keyframes moteFloat2 {
          0% { transform: translateY(0px) translateX(0px); opacity: 0.35; }
          50% { transform: translateY(-22px) translateX(-8px); opacity: 0.8; }
          100% { transform: translateY(0px) translateX(0px); opacity: 0.35; }
        }
        @keyframes sunGlowPulse {
          0% { transform: scale(1); opacity: 0.45; }
          50% { transform: scale(1.1); opacity: 0.7; }
          100% { transform: scale(1); opacity: 0.45; }
        }
      `}</style>

      {/* 1. 따스한 햇살 베이스 그라데이션 (아침 햇살 웜톤) */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(172deg, #FFFDF8 0%, #FFF8EA 26%, #FEF2DB 62%, #FDE9D0 100%)",
        }}
      />

      {/* 2. 상단 좌측 따뜻한 태양광 발광체 (Radial Sunlight Flare) */}
      <div
        style={{
          position: "absolute",
          top: -60,
          left: -60,
          width: 280,
          height: 280,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(254, 215, 120, 0.48) 0%, rgba(253, 230, 138, 0.25) 45%, rgba(255, 255, 255, 0) 75%)",
          animation: "sunGlowPulse 6s ease-in-out infinite",
        }}
      />

      {/* 3. 햇살 광선 및 방 안 창문/식물 실루엣 SVG */}
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 390 844"
        fill="none"
        preserveAspectRatio="xMidYMin slice"
        style={{ position: "absolute", inset: 0 }}
      >
        <defs>
          {/* 부드러운 대각선 햇살 그라데이션 1 */}
          <linearGradient id="sunBeam1" x1="0" y1="0" x2="360" y2="520" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FEF08A" stopOpacity="0.32" />
            <stop offset="40%" stopColor="#FDE68A" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
          </linearGradient>

          {/* 대각선 햇살 그라데이션 2 */}
          <linearGradient id="sunBeam2" x1="30" y1="0" x2="390" y2="600" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFBEB" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#FEF3C7" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#D97706" stopOpacity="0" />
          </linearGradient>

          {/* 창틀 은은한 라인 그라데이션 */}
          <linearGradient id="windowFrameGrad" x1="0" y1="0" x2="180" y2="240" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#D97706" stopOpacity="0.04" />
          </linearGradient>

          {/* 화초 실루엣 그라데이션 */}
          <linearGradient id="plantLeafGrad" x1="310" y1="20" x2="390" y2="150" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#10B981" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#047857" stopOpacity="0.06" />
          </linearGradient>
        </defs>

        {/* ── 창가에서 쏟아지는 사선 햇살 빔 (Sunbeams) ── */}
        <g style={{ animation: "sunRayDrift 8s ease-in-out infinite" }}>
          {/* 광선 1 */}
          <polygon
            points="0,0 120,0 290,460 170,460"
            fill="url(#sunBeam1)"
          />
          {/* 광선 2 */}
          <polygon
            points="50,0 180,0 380,480 270,480"
            fill="url(#sunBeam2)"
          />
          {/* 광선 3 (부드러운 하단 연장) */}
          <polygon
            points="140,0 240,0 390,320 310,320"
            fill="url(#sunBeam1)"
            opacity="0.65"
          />
        </g>

        {/* ── 상단 창틀 아치 및 격자 실루엣 (Cozy Window) ── */}
        <g opacity="0.45">
          {/* 아치 창문 외곽 라인 */}
          <path
            d="M 12 18 C 12 8, 22 2, 34 2 L 150 2 C 162 2, 172 8, 172 18 L 172 110 L 12 110 Z"
            stroke="url(#windowFrameGrad)"
            strokeWidth="2.5"
            strokeDasharray="4 3"
          />
          {/* 격자 살 */}
          <line x1="92" y1="2" x2="92" y2="110" stroke="url(#windowFrameGrad)" strokeWidth="2" strokeDasharray="4 3" />
          <line x1="12" y1="56" x2="172" y2="56" stroke="url(#windowFrameGrad)" strokeWidth="2" strokeDasharray="4 3" />
        </g>

        {/* ── 우측 상단 잔잔한 화초 실루엣 (Cozy Room Houseplant) ── */}
        <g opacity="0.55">
          {/* 나뭇잎 1 */}
          <path
            d="M 390 35 C 360 40, 342 62, 345 85 C 362 82, 385 65, 390 35 Z"
            fill="url(#plantLeafGrad)"
          />
          {/* 나뭇잎 2 */}
          <path
            d="M 390 75 C 365 72, 348 95, 352 115 C 372 110, 386 95, 390 75 Z"
            fill="url(#plantLeafGrad)"
          />
          {/* 나뭇잎 3 (작은 잎) */}
          <path
            d="M 370 20 C 352 26, 346 42, 355 52 C 368 46, 372 32, 370 20 Z"
            fill="url(#plantLeafGrad)"
          />
          {/* 줄기 */}
          <path
            d="M 390 25 Q 365 70 390 125"
            stroke="url(#plantLeafGrad)"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </g>

        {/* ── 떠다니는 따뜻한 햇살 입자들 (Sun Motes & Sparkles) ── */}
        {/* 파티클 1 */}
        <circle cx="85" cy="140" r="3.5" fill="#FDE047" opacity="0.6" style={{ animation: "moteFloat1 4.5s ease-in-out infinite" }} />
        <circle cx="95" cy="148" r="2" fill="#FBBF24" opacity="0.45" />

        {/* 파티클 2 */}
        <circle cx="210" cy="190" r="4" fill="#FDE047" opacity="0.55" style={{ animation: "moteFloat2 5.5s ease-in-out infinite" }} />

        {/* 햇살 별빛 ✦ (상단) */}
        <g transform="translate(68, 70)" style={{ animation: "moteFloat1 6s ease-in-out infinite" }}>
          <path
            d="M 0 -7 Q 1 -1 7 0 Q 1 1 0 7 Q -1 1 -7 0 Q -1 -1 0 -7 Z"
            fill="#F59E0B"
            opacity="0.55"
          />
        </g>

        {/* 햇살 별빛 ✦ (중간) */}
        <g transform="translate(260, 240)" style={{ animation: "moteFloat2 7s ease-in-out infinite" }}>
          <path
            d="M 0 -6 Q 1 -1 6 0 Q 1 1 0 6 Q -1 1 -6 0 Q -1 -1 0 -6 Z"
            fill="#F59E0B"
            opacity="0.45"
          />
        </g>

        {/* 하단 잔잔한 방바닥 온기 그라데이션 */}
        <ellipse cx="195" cy="830" rx="220" ry="80" fill="url(#sunBeam1)" opacity="0.3" />
      </svg>
    </div>
  );
}
