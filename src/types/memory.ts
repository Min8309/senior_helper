// 시니어 기억 저장소 및 활동 로그 데이터 타입 정의 (Part A & B)

export type CharacterMode = "boy" | "girl" | "granddaughter" | "grandson";

/**
 * 1. 나의 기억 기록 아이템 (memories 테이블)
 */
export interface MemoryItem {
  id: string; // 예: "memory_20261005_001"
  user_id?: string; // 사용자 식별 ID
  date: string; // "2026-10-05"
  date_label: string; // "10월 5일 월요일"
  title: string; // "🌳 공원 산책"
  question: string; // "오늘 가장 좋았던 일은 뭐였어요?"
  input_type: "voice" | "text"; // "voice": 음성 기록, "text": 글 기록
  original_text: string; // 어르신이 말씀하시거나 직접 입력하신 원문
  display_text: string; // 화면에 표시될 정돈된 문장
  summary?: string; // 요약 문장
  character_mode: CharacterMode; // 기록 당시 캐릭터 ("granddaughter" | "girl" | "grandson" | "boy")
  audio_path?: string; // Supabase Storage 버킷 내 음성 파일 경로 (예: "memory-audio/user_001/...")
  audio_data_url?: string; // 로컬 오프라인 캐시용 Data URL
  created_at: string; // ISO 8601 타임스탬프
  updated_at?: string;
  tags?: string[];
}

/**
 * 2. 두뇌운동 기록 (brain_training_logs 테이블)
 */
export interface BrainTrainingLog {
  id?: string;
  user_id: string;
  training_type: "number" | "trace" | "color" | "memory" | "match" | string;
  level: number;
  duration_seconds: number;
  completed: boolean;
  score?: number;
  created_at?: string;
}

/**
 * 3. AI 손자/손녀 대화 기록 (ai_conversations 테이블)
 */
export interface AiConversationLog {
  id?: string;
  user_id: string;
  character_mode: CharacterMode;
  question: string;
  answer: string;
  created_at?: string;
}

/**
 * 4. 생활 도움 기기 분석 기록 (appliance_help_logs 테이블)
 * 중요: 사진 원본은 보관하지 않고 최소 결과만 안전하게 기록
 */
export interface ApplianceHelpLog {
  id?: string;
  user_id: string;
  device_name: string;
  question?: string;
  instructions: string[];
  model_name?: string;
  success: boolean;
  created_at?: string;
}

/**
 * 5. 사용자 프로필 (profiles 테이블)
 */
export interface UserProfile {
  id: string;
  nickname: string;
  character_mode: CharacterMode;
  created_at?: string;
  updated_at?: string;
}
