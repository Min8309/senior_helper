
// ─── 3D Claymorphic Brain Icon (오늘의 두뇌 운동) ──────────────────────────────
// 부드러운 핑크빛 점토 재질의 둥근 뇌 형태 + 위에 얹힌 작은 노란 점토 별
export function ClayBrainIcon({ size = 48 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 56 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.18))", flexShrink: 0 }}
      aria-label="두뇌 운동 아이콘"
    >
      <defs>
        {/* 점토 뇌 본체 그라데이션 (매트 핑크) */}
        <linearGradient id="clayBrainGrad" x1="14" y1="12" x2="42" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F472B6" />
          <stop offset="55%" stopColor="#EC4899" />
          <stop offset="100%" stopColor="#DB2777" />
        </linearGradient>

        {/* 뇌 하이라이트 (소프트 점토 광택) */}
        <linearGradient id="clayBrainHighlight" x1="18" y1="14" x2="26" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FDF2F8" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#F472B6" stopOpacity="0" />
        </linearGradient>

        {/* 노란 점토 별 그라데이션 */}
        <linearGradient id="clayStarGrad" x1="36" y1="4" x2="50" y2="20" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FDE047" />
          <stop offset="70%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
      </defs>

      {/* 1. 뇌 본체 (통통한 3D 클레이 베이스) */}
      <rect x="10" y="16" width="36" height="30" rx="15" fill="url(#clayBrainGrad)" />
      
      {/* 좌측 엽 (도톰한 볼륨) */}
      <circle cx="18" cy="24" r="10" fill="url(#clayBrainGrad)" />
      <circle cx="18" cy="34" r="9" fill="url(#clayBrainGrad)" />

      {/* 우측 엽 (도톰한 볼륨) */}
      <circle cx="38" cy="24" r="10" fill="url(#clayBrainGrad)" />
      <circle cx="38" cy="34" r="9" fill="url(#clayBrainGrad)" />

      {/* 상단 엽 중앙 볼륨 */}
      <circle cx="28" cy="20" r="10" fill="url(#clayBrainGrad)" />

      {/* 2. 클레이 뇌 주름 음영 (부드럽게 눌린 자국) */}
      <path
        d="M28 16V44"
        stroke="#BE185D"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeOpacity="0.75"
      />
      <path
        d="M17 24C21 24 23 27 28 27"
        stroke="#BE185D"
        strokeWidth="3"
        strokeLinecap="round"
        strokeOpacity="0.65"
      />
      <path
        d="M16 35C21 35 23 33 28 35"
        stroke="#BE185D"
        strokeWidth="3"
        strokeLinecap="round"
        strokeOpacity="0.65"
      />
      <path
        d="M39 24C35 24 33 27 28 27"
        stroke="#BE185D"
        strokeWidth="3"
        strokeLinecap="round"
        strokeOpacity="0.65"
      />
      <path
        d="M40 35C35 35 33 33 28 35"
        stroke="#BE185D"
        strokeWidth="3"
        strokeLinecap="round"
        strokeOpacity="0.65"
      />

      {/* 3. 점토 특유의 볼륨감 있는 상단 소프트 하이라이트 */}
      <ellipse cx="20" cy="19" rx="6" ry="3.5" fill="url(#clayBrainHighlight)" />
      <ellipse cx="36" cy="19" rx="5" ry="3" fill="url(#clayBrainHighlight)" />

      {/* 4. 우측 상단에 얹혀 있는 귀여운 3D 점토 노란 별 & 반짝이는 작은 스파클들 */}
      <g style={{ filter: "drop-shadow(0 2px 4px rgba(180,83,9,0.35))" }}>
        <path
          d="M42 6L44.2 11.2L49.5 11.8L45.4 15.5L46.6 21L42 18.2L37.4 21L38.6 15.5L34.5 11.8L39.8 11.2L42 6Z"
          fill="url(#clayStarGrad)"
        />
        {/* 별 하이라이트 */}
        <circle cx="41.5" cy="11.5" r="1.8" fill="#FEF08A" />
      </g>
      {/* 좌측 상단 반짝이는 작은 노란 스파클 */}
      <path
        d="M12 11 Q12 15 16 15 Q12 15 12 19 Q12 15 8 15 Q12 15 12 11Z"
        fill="#FDE047"
        style={{ filter: "drop-shadow(0 1px 3px rgba(245,158,11,0.6))" }}
      />
      {/* 우측 하단 반짝이는 작은 노란 스파클 */}
      <path
        d="M46 38 Q46 41 49 41 Q46 41 46 44 Q46 41 43 41 Q46 41 46 38Z"
        fill="#FDE047"
        style={{ filter: "drop-shadow(0 1px 3px rgba(245,158,11,0.6))" }}
      />
    </svg>
  );
}

// ─── 3D Claymorphic Retro Mic Icon (손자/손녀에게 물어보기) ───────────────────
// 둥글게 깎인 레트로 스탠드 마이크 3D 클레이 아이콘
export function ClayRetroMicIcon({ size = 48 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 56 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.18))", flexShrink: 0 }}
      aria-label="손자 손녀에게 물어보기 마이크 아이콘"
    >
      <defs>
        {/* 마이크 캡슐 그라데이션 (따뜻한 퍼플/크림 점토) */}
        <linearGradient id="clayMicCapsule" x1="20" y1="8" x2="36" y2="34" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#DDD6FE" />
          <stop offset="45%" stopColor="#C4B5FD" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>

        {/* 마이크 바디 그라데이션 */}
        <linearGradient id="clayMicBody" x1="18" y1="20" x2="38" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#A78BFA" />
          <stop offset="100%" stopColor="#6D28D9" />
        </linearGradient>

        {/* 스탠드 & 받침대 골드/크롬 그라데이션 */}
        <linearGradient id="clayMicStand" x1="24" y1="36" x2="32" y2="52" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="60%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#B45309" />
        </linearGradient>
      </defs>

      {/* 1. 마이크 하단 원형 점토 스탠드 받침대 */}
      <ellipse cx="28" cy="48" rx="14" ry="4.5" fill="url(#clayMicStand)" />
      {/* 스탠드 기둥 (통통한 원통) */}
      <rect x="25.5" y="36" width="5" height="12" rx="2.5" fill="url(#clayMicStand)" />

      {/* 2. 마이크 U자형 홀더 (도톰한 클레이 곡선) */}
      <path
        d="M17 22C17 31 39 31 39 22"
        stroke="url(#clayMicStand)"
        strokeWidth="4"
        strokeLinecap="round"
      />

      {/* 3. 마이크 캡슐 (통통하고 둥근 3D 클레이 마이크 헤드) */}
      <rect x="21" y="10" width="14" height="22" rx="7" fill="url(#clayMicCapsule)" />

      {/* 마이크 중앙 띠 */}
      <rect x="20.5" y="19" width="15" height="3" rx="1.5" fill="#7C3AED" />

      {/* 마이크 음각 그릴 패턴 (도톰한 점토 슬릿) */}
      <line x1="24" y1="14" x2="32" y2="14" stroke="#6D28D9" strokeWidth="1.8" strokeLinecap="round" strokeOpacity="0.7" />
      <line x1="24" y1="17" x2="32" y2="17" stroke="#6D28D9" strokeWidth="1.8" strokeLinecap="round" strokeOpacity="0.7" />
      <line x1="24" y1="24" x2="32" y2="24" stroke="#6D28D9" strokeWidth="1.8" strokeLinecap="round" strokeOpacity="0.7" />
      <line x1="24" y1="27" x2="32" y2="27" stroke="#6D28D9" strokeWidth="1.8" strokeLinecap="round" strokeOpacity="0.7" />

      {/* 부드러운 볼륨 하이라이트 */}
      <ellipse cx="24" cy="13" rx="2" ry="4" fill="#FFFFFF" fillOpacity="0.6" />

      {/* 말풍선 사운드 웨이브 (친근한 음성 표현) */}
      <path
        d="M43 14C45 16.5 45 20.5 43 23"
        stroke="#FDE047"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M47 11C50 15 50 22 47 26"
        stroke="#F59E0B"
        strokeWidth="2.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ─── 3D Claymorphic Tulip Flower Pot Icon (오늘의 기억) ────────────────────────
// 둥글고 도톰한 꽃잎의 따뜻한 핑크/코랄 3D 클레이 튤립 + 화분
export function ClayTulipPotIcon({ size = 48 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 56 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.18))", flexShrink: 0 }}
      aria-label="오늘의 기억 튤립 화분 아이콘"
    >
      <defs>
        {/* 튤립 꽃잎 코랄/핑크 그라데이션 */}
        <linearGradient id="clayTulipPetal" x1="16" y1="6" x2="40" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FDA4AF" />
          <stop offset="50%" stopColor="#F43F5E" />
          <stop offset="100%" stopColor="#BE123C" />
        </linearGradient>

        {/* 튤립 중앙 봉오리 그라데이션 */}
        <linearGradient id="clayTulipCenter" x1="24" y1="8" x2="32" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FECDD3" />
          <stop offset="100%" stopColor="#E11D48" />
        </linearGradient>

        {/* 도톰한 점토 잎사귀 그라데이션 */}
        <linearGradient id="clayLeafGrad" x1="14" y1="26" x2="42" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6EE7B7" />
          <stop offset="60%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>

        {/* 테라코타 클레이 화분 그라데이션 */}
        <linearGradient id="clayPotGrad" x1="18" y1="36" x2="38" y2="52" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FED7AA" />
          <stop offset="55%" stopColor="#FB923C" />
          <stop offset="100%" stopColor="#C2410C" />
        </linearGradient>
      </defs>

      {/* 1. 화분 흙 & 도톰한 줄기 */}
      <rect x="26" y="24" width="4" height="15" rx="2" fill="url(#clayLeafGrad)" />

      {/* 2. 도톰한 양쪽 클레이 잎사귀 */}
      <path
        d="M26 32C20 30 15 34 16 38C19 39 24 37 26 34"
        fill="url(#clayLeafGrad)"
      />
      <path
        d="M30 32C36 30 41 34 40 38C37 39 32 37 30 34"
        fill="url(#clayLeafGrad)"
      />

      {/* 3. 튤립 꽃봉오리 (도톰하고 둥근 3D 꽃잎 3장) */}
      {/* 중앙 꽃잎 */}
      <ellipse cx="28" cy="18" rx="8" ry="11" fill="url(#clayTulipCenter)" />

      {/* 좌측 도톰한 둥근 꽃잎 */}
      <path
        d="M27 10C21 11 16 17 18 24C20 28 26 28 27 28C27 23 27 15 27 10Z"
        fill="url(#clayTulipPetal)"
      />
      {/* 우측 도톰한 둥근 꽃잎 */}
      <path
        d="M29 10C35 11 40 17 38 24C36 28 30 28 29 28C29 23 29 15 29 10Z"
        fill="url(#clayTulipPetal)"
      />

      {/* 꽃잎 상단 하이라이트 광택 */}
      <ellipse cx="24" cy="15" rx="2.5" ry="4" fill="#FFFFFF" fillOpacity="0.6" />

      {/* 4. 테라코타 클레이 둥근 화분 */}
      {/* 화분 본체 */}
      <path
        d="M19 40L21.5 50.5C21.8 51.5 22.8 52 23.8 52H32.2C33.2 52 34.2 51.5 34.5 50.5L37 40H19Z"
        fill="url(#clayPotGrad)"
      />
      {/* 화분 둥근 림(입구 테두리) */}
      <rect x="17" y="37" width="22" height="4.5" rx="2.2" fill="#FDBA74" />
      <rect x="18" y="37" width="20" height="2" rx="1" fill="#FFF7ED" fillOpacity="0.75" />
    </svg>
  );
}

// ─── Pencil / Edit Settings Icon (이름 변경 버튼용) ──────────────────────────
export function PencilEditIcon({ size = 18, color = "#1B5E20" }: { size?: number; color?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M16.5 3.5C16.8978 3.10217 17.4374 2.87868 18 2.87868C18.2786 2.87868 18.5544 2.93355 18.8118 3.04015C19.0692 3.14676 19.303 3.30302 19.5 3.5C19.697 3.69698 19.8532 3.93084 19.9598 4.18821C20.0665 4.44558 20.1213 4.72143 20.1213 5C20.1213 5.27857 20.0665 5.55442 19.9598 5.81179C19.8532 6.06916 19.697 6.30302 19.5 6.5L7.5 18.5L3 19.5L4 15L16.5 3.5Z"
        stroke={color}
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M14.5 5.5L18.5 9.5"
        stroke={color}
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  );
}
