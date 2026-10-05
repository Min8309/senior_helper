import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { UserProfile, CharacterMode } from "../types/memory";

const USER_ID_KEY = "senior_user_id";
const USER_NAME_KEY = "senior_user_name";
const CHARACTER_MODE_KEY = "senior_character_mode";

/**
 * 고유 사용자 ID 획득 (Supabase Auth 사용자 또는 고유 영구 로컬 사용자 ID)
 */
export function getCurrentUserId(): string {
  try {
    let id = localStorage.getItem(USER_ID_KEY);
    if (!id) {
      id = "user_" + Date.now().toString(36) + "_" + Math.random().toString(36).substring(2, 7);
      localStorage.setItem(USER_ID_KEY, id);
    }
    return id;
  } catch {
    return "user_default_senior";
  }
}

/**
 * 사용자 닉네임 가져오기
 */
export function getCurrentNickname(): string {
  try {
    return localStorage.getItem(USER_NAME_KEY) || "김영희";
  } catch {
    return "김영희";
  }
}

/**
 * 사용자 캐릭터 모드 가져오기
 */
export function getCurrentCharacterMode(): CharacterMode {
  try {
    return (localStorage.getItem(CHARACTER_MODE_KEY) as CharacterMode) || "boy";
  } catch {
    return "boy";
  }
}

/**
 * 사용자 프로필 로드 (Supabase 연동 + 로컬 스토리지 동기화)
 */
export async function loadUserProfile(): Promise<UserProfile> {
  const userId = getCurrentUserId();
  const defaultProfile: UserProfile = {
    id: userId,
    nickname: getCurrentNickname(),
    character_mode: getCurrentCharacterMode(),
  };

  if (!isSupabaseConfigured || !supabase) {
    return defaultProfile;
  }

  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      console.warn("프로필 로드 실패, 로컬 데이터 사용:", error.message);
      return defaultProfile;
    }

    if (data) {
      if (data.nickname) localStorage.setItem(USER_NAME_KEY, data.nickname);
      if (data.character_mode) localStorage.setItem(CHARACTER_MODE_KEY, data.character_mode);
      return {
        id: data.id,
        nickname: data.nickname,
        character_mode: data.character_mode,
        created_at: data.created_at,
        updated_at: data.updated_at,
      };
    } else {
      // 프로필이 없으면 신규 프로필 생성 (Upsert)
      await supabase.from("profiles").insert([
        {
          id: userId,
          nickname: defaultProfile.nickname,
          character_mode: defaultProfile.character_mode,
        },
      ]);
    }
  } catch (err) {
    console.warn("프로필 Supabase 동기화 에러:", err);
  }

  return defaultProfile;
}

/**
 * 사용자 프로필 저장/업데이트
 */
export async function saveUserProfile(
  nickname: string,
  characterMode: CharacterMode
): Promise<void> {
  const userId = getCurrentUserId();
  try {
    localStorage.setItem(USER_NAME_KEY, nickname);
    localStorage.setItem(CHARACTER_MODE_KEY, characterMode);
  } catch {}

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from("profiles").upsert(
        {
          id: userId,
          nickname,
          character_mode: characterMode,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );
    } catch (err) {
      console.warn("Supabase 프로필 업데이트 실패:", err);
    }
  }
}
