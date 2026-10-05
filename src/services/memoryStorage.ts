// 시니어 기억 저장소 로컬 스토리지 & 향후 API/n8n 연동 서비스 모듈
import { MemoryItem } from "../types/memory";

const STORAGE_KEY = "senior_helper_memories_v3";

// 어르신 음성 구어체를 단정하고 정중한 display_text로 다듬는 헬퍼
export function formatDisplayText(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return "";

  let formatted = trimmed;

  // 일기/음성 끝맺음 다듬기 (~했어 -> ~했어요, ~봤어 -> ~봤어요 등)
  if (formatted.endsWith("했어")) {
    formatted = formatted.slice(0, -2) + "했어요";
  } else if (formatted.endsWith("걸었어")) {
    formatted = formatted.slice(0, -3) + "함께 걸었어요";
  } else if (formatted.endsWith("갔어")) {
    formatted = formatted.slice(0, -2) + "갔어요";
  } else if (formatted.endsWith("먹었어")) {
    formatted = formatted.slice(0, -3) + "먹었어요";
  } else if (formatted.endsWith("만났어")) {
    formatted = formatted.slice(0, -3) + "만났어요";
  } else if (formatted.endsWith("보았어") || formatted.endsWith("봤어")) {
    formatted = formatted.replace(/(보았어|봤어)$/, "보았어요");
  } else if (formatted.endsWith("좋았어")) {
    formatted = formatted.slice(0, -3) + "좋았어요";
  }

  // 마침표 없으면 추가
  if (!formatted.endsWith(".") && !formatted.endsWith("!") && !formatted.endsWith("?")) {
    formatted += ".";
  }

  return formatted;
}

// 텍스트 내용 기반 제목 자동 생성 헬퍼
export function generateMemoryTitle(text: string): string {
  const t = text.toLowerCase();
  if (t.includes("산책") || t.includes("공원") || t.includes("걸었") || t.includes("걷")) {
    return "🌳 공원 산책";
  }
  if (t.includes("밥") || t.includes("식사") || t.includes("저녁") || t.includes("점심") || t.includes("음식") || t.includes("맛있")) {
    return "🍲 맛있는 식사";
  }
  if (t.includes("가족") || t.includes("딸") || t.includes("아들") || t.includes("손자") || t.includes("손녀")) {
    return "❤️ 가족과 함께";
  }
  if (t.includes("친구") || t.includes("동무") || t.includes("만남") || t.includes("커피") || t.includes("카페")) {
    return "☕ 반가운 만남";
  }
  if (t.includes("병원") || t.includes("약") || t.includes("의사") || t.includes("건강")) {
    return "🏥 건강 챙기기";
  }
  if (t.includes("시장") || t.includes("마트") || t.includes("장보기") || t.includes("장")) {
    return "🛒 시장 나들이";
  }
  return "🌷 오늘의 이야기";
}

// 초기 샘플 기억 데이터 (Requirement 7 & 8 기준)
const INITIAL_MEMORIES: MemoryItem[] = [
  {
    id: "memory_20261002_001",
    date: "2026-10-02",
    date_label: "10월 2일 금요일",
    title: "🌳 공원 산책",
    question: "오늘 가장 좋았던 일은 뭐였어요?",
    input_type: "voice",
    original_text: "오늘 공원에서 친구 만나서 같이 걸었어.",
    display_text: "오늘 공원에서 친구를 만나 함께 걸었어요.",
    summary: "오늘 공원에서 친구를 만나 함께 걸었어요.",
    character_mode: "granddaughter",
    created_at: "2026-10-02T18:30:00",
  },
  {
    id: "memory_20261001_001",
    date: "2026-10-01",
    date_label: "10월 1일 목요일",
    title: "🍲 가족과 저녁",
    question: "오늘 누구와 이야기했어요?",
    input_type: "text",
    original_text: "딸이 집에 와서 같이 저녁을 먹었단다.",
    display_text: "딸이 집에 와서 같이 저녁을 먹었어요.",
    summary: "딸이 집에 와서 같이 저녁을 먹었어요.",
    character_mode: "granddaughter",
    created_at: "2026-10-01T19:20:00",
  },
  {
    id: "memory_20260930_001",
    date: "2026-09-30",
    date_label: "9월 30일 수요일",
    title: "☕ 친구와 만남",
    question: "오늘 맛있게 드신 음식은 뭐예요?",
    input_type: "voice",
    original_text: "오랜 친구와 동네 카페에서 따뜻한 커피를 마셨지.",
    display_text: "오랜 친구와 카페에서 따뜻한 커피를 마셨어요.",
    summary: "오랜 친구와 카페에서 따뜻한 커피를 마셨어요.",
    character_mode: "grandson",
    created_at: "2026-09-30T15:00:00",
  },
];

export const memoryStorage = {
  // 모든 기억 목록 가져오기 (Requirement 9: getMemories)
  getMemories(): MemoryItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_MEMORIES));
        return INITIAL_MEMORIES;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_MEMORIES;
    }
  },

  // 특정 기억 1개 조회
  getMemoryById(id: string): MemoryItem | undefined {
    const list = this.getMemories();
    return list.find((m) => m.id === id);
  },

  // 새 기억 저장 (Requirement 7 & 8: 최신 기록이 맨 위로)
  saveMemory(item: Omit<MemoryItem, "id" | "created_at">): MemoryItem {
    const list = this.getMemories();
    const dateFormatted = item.date.replace(/-/g, "");
    const countToday = list.filter((m) => m.date === item.date).length + 1;
    const countStr = String(countToday).padStart(3, "0");
    const newId = `memory_${dateFormatted}_${countStr}`;

    const displayText = item.display_text || formatDisplayText(item.original_text);

    const newItem: MemoryItem = {
      ...item,
      id: newId,
      display_text: displayText,
      summary: displayText,
      created_at: new Date().toISOString(),
    };

    // 최신 기억을 가장 위에 추가 (Requirement 8)
    const updated = [newItem, ...list];
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn("로컬 저장 오류:", e);
    }
    return newItem;
  },

  // 기억 수정
  updateMemory(id: string, updates: Partial<MemoryItem>): boolean {
    const list = this.getMemories();
    const index = list.findIndex((m) => m.id === id);
    if (index === -1) return false;
    list[index] = { ...list[index], ...updates };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    return true;
  },

  // 기억 삭제
  deleteMemory(id: string): boolean {
    const list = this.getMemories();
    const filtered = list.filter((m) => m.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  },
};

// Requirement 9: 별도 service 함수로 분리하여 내보내기
export const getMemories = () => memoryStorage.getMemories();
export const getMemoryById = (id: string) => memoryStorage.getMemoryById(id);
export const saveMemory = (item: Omit<MemoryItem, "id" | "created_at">) => memoryStorage.saveMemory(item);
export const updateMemory = (id: string, updates: Partial<MemoryItem>) => memoryStorage.updateMemory(id, updates);
export const deleteMemory = (id: string) => memoryStorage.deleteMemory(id);

