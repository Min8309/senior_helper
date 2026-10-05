import { createClient, SupabaseClient } from "@supabase/supabase-js";

// 환경변수에서 Supabase 설정 가져오기 (시크릿 키 절대 노출 금지)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith("http") &&
  supabaseAnonKey.length > 10
);

let supabaseInstance: SupabaseClient | null = null;

if (isSupabaseConfigured) {
  try {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
    console.info("🌸 [Supabase] 연결 완료: 원격 클라우드 동기화 활성화");
  } catch (err) {
    console.warn("⚠️ [Supabase] 초기화 오류, 오프라인 로컬 저장소 모드로 작동합니다:", err);
  }
} else {
  console.info(
    "💡 [Supabase] .env에 VITE_SUPABASE_URL과 VITE_SUPABASE_ANON_KEY가 설정되지 않아 로컬 오프라인(LocalStorage) 모드로 동작합니다."
  );
}

export const supabase = supabaseInstance;

/**
 * Supabase Storage 버킷에서 음성 파일의 공개 URL을 얻거나 생성하는 헬퍼
 */
export function getAudioStoragePublicUrl(audioPath: string): string | null {
  if (!supabase || !audioPath) return null;
  // 만약 이미 full url인 경우 그대로 반환
  if (audioPath.startsWith("http://") || audioPath.startsWith("https://")) {
    return audioPath;
  }
  const { data } = supabase.storage.from("memory-audio").getPublicUrl(audioPath);
  return data?.publicUrl || null;
}
