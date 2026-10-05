import { supabase, isSupabaseConfigured, getAudioStoragePublicUrl } from "../lib/supabase";
import { MemoryItem } from "../types/memory";
import { memoryStorage } from "./memoryStorage";
import { getCurrentUserId } from "./userService";

/**
 * Data URL을 Blob으로 변환하는 유틸리티
 */
function dataUrlToBlob(dataUrl: string): Blob | null {
  try {
    const arr = dataUrl.split(",");
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : "audio/webm";
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  } catch (err) {
    console.warn("Data URL을 Blob으로 변환 실패:", err);
    return null;
  }
}

/**
 * ── 1. 기억 목록 불러오기 (Requirement 6) ─────────────────────────────────────────
 * - 현재 사용자 user_id 기준으로 조회
 * - 정렬: created_at DESC (최신 기록이 최상단)
 * - Supabase와 LocalStorage 양방향 동기화
 */
export async function getMemories(): Promise<MemoryItem[]> {
  const userId = getCurrentUserId();
  const localList = memoryStorage.getMemories();

  if (!isSupabaseConfigured || !supabase) {
    return localList;
  }

  try {
    const { data, error } = await supabase
      .from("memories")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Supabase memories 조회 오류, 로컬 캐시 사용:", error.message);
      return localList;
    }

    if (data && data.length > 0) {
      const remoteMemories: MemoryItem[] = data.map((row: any) => {
        // 음성 파일 공개 URL 연결
        let audioUrl = row.audio_data_url;
        if (row.audio_path) {
          const publicUrl = getAudioStoragePublicUrl(row.audio_path);
          if (publicUrl) audioUrl = publicUrl;
        }

        return {
          id: row.id,
          user_id: row.user_id,
          date: row.date,
          date_label: row.date_label || row.date,
          title: row.title,
          question: row.question,
          input_type: row.input_type as "voice" | "text",
          original_text: row.original_text,
          display_text: row.display_text,
          summary: row.summary || row.display_text,
          character_mode: row.character_mode || "grandson",
          audio_path: row.audio_path,
          audio_data_url: audioUrl,
          created_at: row.created_at,
          updated_at: row.updated_at,
        };
      });

      // 로컬 스토리지 캐시 동기화
      try {
        localStorage.setItem("senior_helper_memories_v3", JSON.stringify(remoteMemories));
      } catch {}

      return remoteMemories;
    } else if (localList.length > 0) {
      // Supabase에는 아직 없고 로컬에만 있는 경우, 로컬 데이터 원격 마이그레이션 백그라운드 시도
      migrateLocalMemoriesToSupabase(localList, userId).catch(() => {});
      return localList;
    }
  } catch (err) {
    console.warn("기억 목록 조회 예외, 로컬 캐시 반환:", err);
  }

  return localList;
}

/**
 * ── 2. 기억 저장하기 (Requirement 3, 4, 5) ──────────────────────────────────────
 * - 글쓰기 기억: memories INSERT
 * - 음성 기억: 원본 음성 -> Supabase Storage (memory-audio/) + 메타데이터 -> memories INSERT
 */
export async function saveMemory(
  item: Omit<MemoryItem, "id" | "created_at">,
  audioBlob?: Blob
): Promise<MemoryItem> {
  const userId = getCurrentUserId();
  const id = `memory_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const nowIso = new Date().toISOString();

  let audioPath: string | undefined = undefined;
  let finalAudioDataUrl = item.audio_data_url;

  // 1) 음성 파일 Storage 업로드 처리 (Part A #4)
  if (item.input_type === "voice") {
    let blobToUpload = audioBlob;
    if (!blobToUpload && item.audio_data_url) {
      blobToUpload = dataUrlToBlob(item.audio_data_url) || undefined;
    }

    if (blobToUpload && isSupabaseConfigured && supabase) {
      try {
        const filePath = `${userId}/${id}_${Date.now()}.webm`;
        const { error: uploadErr } = await supabase.storage
          .from("memory-audio")
          .upload(filePath, blobToUpload, {
            contentType: "audio/webm",
            upsert: true,
          });

        if (!uploadErr) {
          audioPath = filePath;
          const publicUrl = getAudioStoragePublicUrl(filePath);
          if (publicUrl) {
            finalAudioDataUrl = publicUrl;
          }
        } else {
          console.warn("Supabase Storage 음성 업로드 실패, 로컬 오디오 사용:", uploadErr.message);
        }
      } catch (err) {
        console.warn("Storage 업로드 예외:", err);
      }
    }
  }

  const newMemory: MemoryItem = {
    ...item,
    id,
    user_id: userId,
    audio_path: audioPath,
    audio_data_url: finalAudioDataUrl,
    created_at: nowIso,
    updated_at: nowIso,
  };

  // 2) 로컬 스토리지에 즉시 동기화 저장 (오프라인 및 즉각적 UI 갱신 보장)
  memoryStorage.saveMemory({
    ...item,
    audio_data_url: finalAudioDataUrl,
  });

  // 3) Supabase DB memories 테이블에 INSERT
  if (isSupabaseConfigured && supabase) {
    try {
      const { error: dbErr } = await supabase.from("memories").insert([
        {
          id: newMemory.id,
          user_id: userId,
          date: newMemory.date,
          date_label: newMemory.date_label,
          title: newMemory.title,
          question: newMemory.question,
          input_type: newMemory.input_type,
          original_text: newMemory.original_text,
          display_text: newMemory.display_text,
          summary: newMemory.summary,
          character_mode: newMemory.character_mode,
          audio_path: newMemory.audio_path || null,
          created_at: newMemory.created_at,
          updated_at: newMemory.updated_at,
        },
      ]);

      if (dbErr) {
        console.warn("Supabase memories INSERT 실패:", dbErr.message);
      }
    } catch (err) {
      console.warn("Supabase 저장 처리 중 오류:", err);
    }
  }

  return newMemory;
}

/**
 * ── 3. 기억 수정하기 ─────────────────────────────────────────────────────────────
 */
export async function updateMemory(id: string, updates: Partial<MemoryItem>): Promise<boolean> {
  // 로컬 업데이트
  const localSuccess = memoryStorage.updateMemory(id, updates);

  if (isSupabaseConfigured && supabase) {
    try {
      const dbUpdates: Record<string, any> = {
        updated_at: new Date().toISOString(),
      };
      if (updates.display_text !== undefined) dbUpdates.display_text = updates.display_text;
      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.summary !== undefined) dbUpdates.summary = updates.summary;

      await supabase.from("memories").update(dbUpdates).eq("id", id);
    } catch (err) {
      console.warn("Supabase memories 수정 실패:", err);
    }
  }

  return localSuccess;
}

/**
 * ── 4. 기억 삭제하기 (Requirement 23: 개인정보 삭제 보장) ──────────────────────
 */
export async function deleteMemory(id: string, audioPath?: string): Promise<boolean> {
  // 로컬 삭제
  const localSuccess = memoryStorage.deleteMemory(id);

  if (isSupabaseConfigured && supabase) {
    try {
      // 1) DB 레코드 삭제
      await supabase.from("memories").delete().eq("id", id);

      // 2) 음성 파일이 있는 경우 Storage에서도 함께 삭제
      if (audioPath) {
        await supabase.storage.from("memory-audio").remove([audioPath]);
      }
    } catch (err) {
      console.warn("Supabase memories 삭제 실패:", err);
    }
  }

  return localSuccess;
}

/**
 * 로컬 캐시의 기억들을 Supabase로 일괄 백업하는 도우미
 */
async function migrateLocalMemoriesToSupabase(items: MemoryItem[], userId: string) {
  if (!isSupabaseConfigured || !supabase) return;
  try {
    const rows = items.map((item) => ({
      id: item.id,
      user_id: userId,
      date: item.date,
      date_label: item.date_label,
      title: item.title,
      question: item.question,
      input_type: item.input_type,
      original_text: item.original_text,
      display_text: item.display_text,
      summary: item.summary,
      character_mode: item.character_mode,
      created_at: item.created_at,
    }));
    await supabase.from("memories").upsert(rows, { onConflict: "id" });
  } catch (err) {
    console.debug("로컬 마이그레이션 건너뜀:", err);
  }
}
