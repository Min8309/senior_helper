import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { AiConversationLog, CharacterMode } from "../types/memory";
import { getCurrentUserId } from "./userService";

const LOCAL_STORAGE_KEY = "senior_helper_ai_conversations_v1";

/**
 * 로컬 캐시에서 AI 대화 기록 조회
 */
function getLocalConversations(): AiConversationLog[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/**
 * 로컬 캐시에 AI 대화 기록 저장
 */
function saveLocalConversation(conv: AiConversationLog) {
  try {
    const list = getLocalConversations();
    const updated = [conv, ...list];
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated.slice(0, 50)));
  } catch {}
}

/**
 * ── 1. AI 손자/손녀 대화 기록 저장 (Requirement 8) ─────────────────────────
 * - AI 대화 기록은 "나의 기억"과 명확히 분리하여 ai_conversations 테이블에 저장
 * - user_id, character_mode, question, answer, created_at
 */
export async function saveConversation(params: {
  userId?: string;
  characterMode: CharacterMode;
  question: string;
  answer: string;
}): Promise<AiConversationLog> {
  const userId = params.userId || getCurrentUserId();
  const id = `conv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const createdAt = new Date().toISOString();

  const record: AiConversationLog = {
    id,
    user_id: userId,
    character_mode: params.characterMode,
    question: params.question,
    answer: params.answer,
    created_at: createdAt,
  };

  // 로컬 캐시 저장
  saveLocalConversation(record);

  if (!isSupabaseConfigured || !supabase) {
    return record;
  }

  try {
    const { error } = await supabase.from("ai_conversations").insert({
      id: record.id,
      user_id: record.user_id,
      character_mode: record.character_mode,
      question: record.question,
      answer: record.answer,
      created_at: record.created_at,
    });

    if (error) {
      console.warn("Supabase 대화 기록 저장 실패, 로컬에 저장됨:", error.message);
    }
  } catch (err) {
    console.warn("대화 기록 원격 저장 예외:", err);
  }

  return record;
}

/**
 * ── 2. AI 대화 기록 조회 ──────────────────────────────────────────────────
 */
export async function getConversations(userId?: string, limit = 20): Promise<AiConversationLog[]> {
  const targetUser = userId || getCurrentUserId();
  const localList = getLocalConversations();

  if (!isSupabaseConfigured || !supabase) {
    return localList;
  }

  try {
    const { data, error } = await supabase
      .from("ai_conversations")
      .select("*")
      .eq("user_id", targetUser)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.warn("Supabase 대화 기록 조회 실패:", error.message);
      return localList;
    }

    if (data && data.length > 0) {
      return data as AiConversationLog[];
    }
  } catch (err) {
    console.warn("대화 기록 조회 예외:", err);
  }

  return localList;
}
