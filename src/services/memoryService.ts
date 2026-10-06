import { supabase, getAudioStorageUrl } from "../lib/supabase"
import { MemoryItem } from "../types/memory"
import { memoryStorage } from "./memoryStorage"
import { getAuthenticatedUserId } from "./userService"

// 같은 탭에서 저장/조회/삭제가 교차하며 캐시를 덮어쓰지 않도록 직렬화합니다.
let operations: Promise<unknown> = Promise.resolve()
let lastSyncSucceeded = false

export function getMemorySyncStatus(): "local" | "pending" | "synced" {
  if (!supabase) return "local"
  return lastSyncSucceeded &&
    !memoryStorage.getMemories().some((item) => item.sync_pending) &&
    memoryStorage.getDeleted().length === 0
    ? "synced"
    : "pending"
}
function run<T>(action: () => Promise<T>): Promise<T> {
  const result = operations.then(action)
  operations = result.catch(() => {})
  return result
}

function audioBlob(dataUrl: string): Blob {
  const [header, encoded] = dataUrl.split(",")
  const bytes = Uint8Array.from(atob(encoded), (char) => char.charCodeAt(0))
  return new Blob([bytes], {
    type: header.match(/data:([^;]+)/)?.[1] || "audio/webm",
  })
}

async function synchronize(): Promise<string | null> {
  const userId = await getAuthenticatedUserId()
  if (!userId || !supabase) return null
  for (const deleted of memoryStorage.getDeleted()) {
    if (deleted.user_id && deleted.user_id !== userId) continue
    // 파일 삭제 실패 시 재시도할 경로를 잃지 않도록 DB보다 먼저 삭제합니다.
    if (deleted.audio_path) {
      const { error } = await supabase.storage
        .from("memory-audio")
        .remove([deleted.audio_path])
      if (error) throw error
    }
    const { error } = await supabase
      .from("memories")
      .delete()
      .eq("id", deleted.id)
      .eq("user_id", userId)
    if (error) throw error
    memoryStorage.acknowledgeDelete(deleted.id)
  }
  for (const cached of memoryStorage.getMemories()) {
    if (!cached.sync_pending || (cached.user_id && cached.user_id !== userId))
      continue
    let item = { ...cached, user_id: userId }
    // 인증 계정 변경 시 다른 계정으로 재업로드되지 않도록 소유자를 먼저 보관합니다.
    memoryStorage.putMemory(item)
    if (item.audio_data_url?.startsWith("data:") && !item.audio_path) {
      const blob = audioBlob(item.audio_data_url)
      const extension = blob.type.includes("mp4")
        ? "mp4"
        : blob.type.includes("ogg")
          ? "ogg"
          : "webm"
      const path = `${userId}/${item.id}.${extension}`
      const { error } = await supabase.storage
        .from("memory-audio")
        .upload(path, blob, { contentType: blob.type, upsert: true })
      if (error) throw error
      item = { ...item, audio_path: path }
      memoryStorage.putMemory(item)
    }
    const { sync_pending, audio_data_url, tags, ...row } = item
    void sync_pending
    void audio_data_url
    void tags
    const { error } = await supabase
      .from("memories")
      .upsert(row, { onConflict: "id" })
    if (error) throw error
    memoryStorage.putMemory({ ...item, sync_pending: false })
  }
  return userId
}

async function trySync(): Promise<string | null> {
  try {
    const userId = await synchronize()
    lastSyncSucceeded = Boolean(userId)
    return userId
  } catch (error) {
    lastSyncSucceeded = false
    console.warn(
      "클라우드 동기화 실패: 기기 기록을 보존하고 다음 요청에서 재시도합니다.",
      error,
    )
    return null
  }
}

export function getMemories(): Promise<MemoryItem[]> {
  return run(async () => {
    const userId = await trySync()
    if (!userId || !supabase) return memoryStorage.getMemories()
    const { data, error } = await supabase
      .from("memories")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
    if (error) {
      lastSyncSucceeded = false
      console.warn("클라우드 조회 실패", error)
      return memoryStorage.getMemories()
    }
    const deleted = new Set(memoryStorage.getDeleted().map((item) => item.id))
    const preserved = memoryStorage
      .getMemories()
      .filter(
        (item) =>
          item.sync_pending || (item.user_id && item.user_id !== userId),
      )
    const remote = (data as MemoryItem[]).filter(
      (item) => !deleted.has(item.id),
    )
    const merged = new Map<string, MemoryItem>(
      remote.map((item) => [item.id, { ...item, sync_pending: false }]),
    )
    for (const item of preserved) merged.set(item.id, item)
    const items = [...merged.values()].sort((a, b) =>
      b.created_at.localeCompare(a.created_at),
    )
    memoryStorage.replaceMemories(items)
    return Promise.all(
      items
        .filter((item) => !item.user_id || item.user_id === userId)
        .map(async (item) => {
          if (!item.audio_path) return item
          try {
            return {
              ...item,
              audio_data_url: await getAudioStorageUrl(item.audio_path),
            }
          } catch (error) {
            lastSyncSucceeded = false
            console.warn("음성 재생 URL 생성 실패", error)
            return item
          }
        }),
    )
  })
}

export function saveMemory(
  item: Omit<MemoryItem, "id" | "created_at">,
  blob?: Blob,
): Promise<MemoryItem> {
  return run(async () => {
    let audio = item.audio_data_url
    if (blob)
      audio = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = () => reject(reader.error)
        reader.readAsDataURL(blob)
      })
    const saved = memoryStorage.saveMemory({ ...item, audio_data_url: audio })
    await trySync()
    return memoryStorage.getMemories().find((item) => item.id === saved.id)!
  })
}

export function updateMemory(
  id: string,
  updates: Partial<MemoryItem>,
): Promise<boolean> {
  return run(async () => {
    const success = memoryStorage.updateMemory(id, updates)
    if (success) await trySync()
    return success
  })
}

export function deleteMemory(id: string, audioPath?: string): Promise<boolean> {
  return run(async () => {
    const success = memoryStorage.deleteMemory(id, audioPath)
    if (success) await trySync()
    return success
  })
}
