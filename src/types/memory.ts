// 시니어 기억 저장소 데이터 타입 정의 (Requirement 7)
export type CharacterMode = "boy" | "girl" | "granddaughter" | "grandson";

export interface MemoryItem {
  id: string; // 예: "memory_20261002_001"
  date: string; // "2026-10-02"
  date_label: string; // "10월 2일 금요일"
  title: string; // "🌳 공원 산책"
  question: string; // "오늘 가장 좋았던 일은 뭐였어요?"
  input_type: "voice" | "text"; // 기록 유형 ("voice": 음성 기록, "text": 글 기록)
  original_text: string; // 어르신이 말씀하시거나 직접 입력하신 원문
  display_text: string; // 화면에 표시될 정돈된 문장
  summary?: string; // 기존 호환용 요약 문장
  character_mode: CharacterMode; // 기록 당시 캐릭터 ("granddaughter" | "girl" | "grandson" | "boy")
  audio_data_url?: string; // 실제 녹음된 음성 오디오 데이터 (Data URL)
  created_at: string; // ISO 8601 타임스탬프 ("2026-10-02T18:30:00")
  tags?: string[]; // 향후 검색 및 카테고리 확장을 위한 태그
}

