// 시니어 기억 저장소 데이터 타입 정의
export interface MemoryItem {
  id: string;
  date: string; // "2026-10-02"
  date_label: string; // "10월 2일 금요일"
  title: string; // "🌳 공원 산책"
  question: string; // "오늘 가장 좋았던 일은 뭐였어요?"
  input_type: "voice" | "text"; // 기록 유형 ("voice": 음성 기록, "text": 글 기록)
  original_text: string; // 어르신이 말씀하시거나 입력하신 원문
  display_text?: string; // 화면에 표시될 정리된 문장
  summary: string; // 요약/표시 문장
  character_mode: "boy" | "girl"; // 기록 당시 손자/손녀 모드
  audio_data_url?: string; // 실제 녹음된 음성 오디오 데이터 (있을 경우 우선 재생)
  created_at: string; // ISO 8601 타임스탬프
}
