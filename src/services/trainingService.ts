import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { BrainTrainingLog } from "../types/memory";
import { getCurrentUserId, getAuthenticatedUserId } from "./userService";

const LOCAL_STORAGE_KEY = "senior_helper_training_logs_v1";

/**
 * 로컬 캐시에서 두뇌운동 기록 조회
 */
function getLocalTrainingLogs(): BrainTrainingLog[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/**
 * 로컬 캐시에 두뇌운동 기록 저장
 */
function saveLocalTrainingLog(log: BrainTrainingLog) {
  try {
    const list = getLocalTrainingLogs();
    const updated = [log, ...list];
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated.slice(0, 50)));
  } catch {}
}

/**
 * ── 1. 두뇌운동 완료 기록 저장 (Requirement 7) ───────────────────────────
 * - 두뇌운동을 완료했을 때만 기록을 저장합니다.
 * - Supabase brain_training_logs 테이블에 INSERT
 * - 오프라인/미설정 시 localStorage에 안전하게 보관
 */
export async function saveTrainingLog(
  log: Omit<BrainTrainingLog, "id" | "user_id" | "created_at"> & {
    id?: string;
    user_id?: string;
    created_at?: string;
  }
): Promise<BrainTrainingLog> {
  const userId = log.user_id || getCurrentUserId();
  const id = log.id || crypto.randomUUID();
  const createdAt = log.created_at || new Date().toISOString();

  const record: BrainTrainingLog = {
    id,
    user_id: userId,
    training_type: log.training_type,
    level: log.level,
    duration_seconds: log.duration_seconds,
    completed: log.completed,
    score: log.score ?? 100,
    created_at: createdAt,
  };

  // 로컬 캐시 즉시 저장
  saveLocalTrainingLog(record);

  if (!isSupabaseConfigured || !supabase) {
    return record;
  }

  try {
    const authenticatedId = await getAuthenticatedUserId();
    if (!authenticatedId) return record;
    const { error } = await supabase.from("brain_training_logs").insert({
      id: record.id,
      user_id: authenticatedId,
      training_type: record.training_type,
      level: record.level,
      duration_seconds: record.duration_seconds,
      completed: record.completed,
      score: record.score,
      created_at: record.created_at,
    });

    if (error) {
      console.warn("Supabase 두뇌운동 로그 저장 실패, 로컬에 저장됨:", error.message);
    }
  } catch (err) {
    console.warn("두뇌운동 로그 원격 저장 예외:", err);
  }

  return record;
}
