// 시니어 기억 저장소 로컬 스토리지 & 향후 API/n8n 연동 서비스 모듈
import { MemoryItem } from "../types/memory"

const STORAGE_KEY = "senior_helper_memories_v3"

// 어르신 음성 구어체를 단정하고 정중한 display_text로 다듬는 헬퍼
export function formatDisplayText(text: string): string {
  const trimmed = text.trim()
  if (!trimmed) return ""

  let formatted = trimmed

  // 일기/음성 끝맺음 다듬기 (~했어 -> ~했어요, ~봤어 -> ~봤어요 등)
  if (formatted.endsWith("했어")) {
    formatted = formatted.slice(0, -2) + "했어요"
  } else if (formatted.endsWith("걸었어")) {
    formatted = formatted.slice(0, -3) + "함께 걸었어요"
  } else if (formatted.endsWith("갔어")) {
    formatted = formatted.slice(0, -2) + "갔어요"
  } else if (formatted.endsWith("먹었어")) {
    formatted = formatted.slice(0, -3) + "먹었어요"
  } else if (formatted.endsWith("만났어")) {
    formatted = formatted.slice(0, -3) + "만났어요"
  } else if (formatted.endsWith("보았어") || formatted.endsWith("봤어")) {
    formatted = formatted.replace(/(보았어|봤어)$/, "보았어요")
  } else if (formatted.endsWith("좋았어")) {
    formatted = formatted.slice(0, -3) + "좋았어요"
  }

  // 마침표 없으면 추가
  if (
    !formatted.endsWith(".") &&
    !formatted.endsWith("!") &&
    !formatted.endsWith("?")
  ) {
    formatted += "."
  }

  return formatted
}

// 텍스트 내용 기반 제목 자동 생성 헬퍼
export function generateMemoryTitle(text: string): string {
  const t = text.toLowerCase()
  if (
    t.includes("산책") ||
    t.includes("공원") ||
    t.includes("걸었") ||
    t.includes("걷")
  ) {
    return "🌳 공원 산책"
  }
  if (
    t.includes("밥") ||
    t.includes("식사") ||
    t.includes("저녁") ||
    t.includes("점심") ||
    t.includes("음식") ||
    t.includes("맛있")
  ) {
    return "🍲 맛있는 식사"
  }
  if (
    t.includes("가족") ||
    t.includes("딸") ||
    t.includes("아들") ||
    t.includes("손자") ||
    t.includes("손녀")
  ) {
    return "❤️ 가족과 함께"
  }
  if (
    t.includes("친구") ||
    t.includes("동무") ||
    t.includes("만남") ||
    t.includes("커피") ||
    t.includes("카페")
  ) {
    return "☕ 반가운 만남"
  }
  if (
    t.includes("병원") ||
    t.includes("약") ||
    t.includes("의사") ||
    t.includes("건강")
  ) {
    return "🏥 건강 챙기기"
  }
  if (
    t.includes("시장") ||
    t.includes("마트") ||
    t.includes("장보기") ||
    t.includes("장")
  ) {
    return "🛒 시장 나들이"
  }
  return "🌷 오늘의 이야기"
}

export interface DeletedMemory {
  id: string
  audio_path?: string
  user_id?: string
}
interface MemoryState {
  items: MemoryItem[]
  deleted: DeletedMemory[]
}
const STATE_KEY = "senior_helper_memory_state_v4"

function readState(): MemoryState {
  const raw = localStorage.getItem(STATE_KEY)
  if (raw) {
    const state = JSON.parse(raw) as MemoryState
    if (!Array.isArray(state.items) || !Array.isArray(state.deleted))
      throw new Error("기억 저장소를 읽을 수 없습니다.")
    return state
  }
  const legacy = JSON.parse(
    localStorage.getItem(STORAGE_KEY) || "[]",
  ) as MemoryItem[]
  if (!Array.isArray(legacy)) throw new Error("기억 저장소를 읽을 수 없습니다.")
  const seen = new Set<string>()
  const items = legacy.map((item) => {
    const id = seen.has(item.id) ? crypto.randomUUID() : item.id
    seen.add(id)
    return { ...item, id, sync_pending: true }
  })
  const migrated = { items, deleted: [] }
  writeState(migrated)
  return migrated
}
function writeState(state: MemoryState) {
  // 저장 용량 초과 등은 호출자에게 전달해 성공으로 오인하지 않도록 합니다.
  localStorage.setItem(STATE_KEY, JSON.stringify(state))
}

export const memoryStorage = {
  getMemories(): MemoryItem[] {
    return readState().items
  },
  getDeleted(): DeletedMemory[] {
    return readState().deleted
  },
  replaceMemories(items: MemoryItem[]) {
    writeState({ ...readState(), items })
  },
  putMemory(item: MemoryItem) {
    const state = readState()
    state.items = [
      item,
      ...state.items.filter((existing) => existing.id !== item.id),
    ]
    writeState(state)
    return item
  },
  saveMemory(item: Omit<MemoryItem, "id" | "created_at">): MemoryItem {
    const text = item.display_text || formatDisplayText(item.original_text)
    return this.putMemory({
      ...item,
      id: crypto.randomUUID(),
      display_text: text,
      summary: text,
      created_at: new Date().toISOString(),
      sync_pending: true,
    })
  },
  updateMemory(id: string, updates: Partial<MemoryItem>): boolean {
    const item = this.getMemories().find((item) => item.id === id)
    if (!item) return false
    this.putMemory({
      ...item,
      ...updates,
      id,
      updated_at: new Date().toISOString(),
      sync_pending: true,
    })
    return true
  },
  deleteMemory(id: string, audioPath?: string): boolean {
    const state = readState()
    const item = state.items.find((item) => item.id === id)
    if (!item) return false
    state.items = state.items.filter((item) => item.id !== id)
    state.deleted = [
      ...state.deleted.filter((item) => item.id !== id),
      { id, user_id: item.user_id, audio_path: audioPath || item.audio_path },
    ]
    writeState(state)
    return true
  },
  acknowledgeDelete(id: string) {
    const state = readState()
    state.deleted = state.deleted.filter((item) => item.id !== id)
    writeState(state)
  },
}
