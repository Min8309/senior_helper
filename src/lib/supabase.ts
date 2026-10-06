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
    console.info("🌸 [Supabase] 설정 확인: 인증 후 클라우드 동기화를 시도합니다");
  } catch (err) {
    console.warn("⚠️ [Supabase] 초기화 오류, 오프라인 로컬 저장소 모드로 작동합니다:", err);
  }
} else {
  console.info(
    "💡 [Supabase] .env에 VITE_SUPABASE_URL과 VITE_SUPABASE_ANON_KEY가 설정되지 않아 로컬 오프라인(LocalStorage) 모드로 동작합니다."
  );
}

export const supabase = supabaseInstance;

/** 비공개 음성 파일의 단기 재생 URL. 기존 공개 URL은 재사용하지 않습니다. */
export async function getAudioStorageUrl(audioPath: string): Promise<string | undefined> {
  if (!supabase || !audioPath || /^https?:/i.test(audioPath)) return undefined;
  const { data, error } = await supabase.storage.from("memory-audio").createSignedUrl(audioPath, 300);
  if (error) throw error;
  return data?.signedUrl;
}
