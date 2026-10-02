// 시니어 기억 저장소 데이터 타입 정의
export interface MemoryItem {
  id: string;
  date: string; // "2026-10-02"
  date_label: string; // "10월 2일 금요일"
  title: string; // "🌳 공원 산책"
  question: string; // "오늘 가장 좋았던 일은 뭐였어요?"
  original_text: string; // 어르신이 말씀하신 원문
  summary: string; // 정리된 기억 문장
  character_mode: "boy" | "girl"; // 기록 당시 손자/손녀 모드
  created_at: string; // ISO 8601 타임스탬프
}
