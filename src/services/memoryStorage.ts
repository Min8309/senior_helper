// 시니어 기억 저장소 로컬 스토리지 & 향후 API/n8n 연동 서비스 모듈
import { MemoryItem } from "../types/memory";

const STORAGE_KEY = "senior_helper_memories_v2";

// 초기 샘플 기억 데이터
const INITIAL_MEMORIES: MemoryItem[] = [
  {
    id: "memory_sample_3",
    date: "2026-10-02",
    date_label: "10월 2일 금요일",
    title: "🌳 공원 산책",
    question: "오늘 가장 좋았던 일은 뭐였어요?",
    input_type: "voice",
    original_text: "오늘 공원에서 친구를 만나서 같이 걸었어.",
    summary: "오늘 공원에서 친구를 만나 함께 걸었어요.",
    character_mode: "boy",
    created_at: "2026-10-02T09:30:00",
  },
  {
    id: "memory_sample_2",
    date: "2026-10-01",
    date_label: "10월 1일 목요일",
    title: "🍲 가족과 저녁",
    question: "오늘 누구와 이야기했어요?",
    input_type: "text",
    original_text: "딸이 집에 와서 같이 맛있는 저녁을 먹었단다.",
    summary: "딸이 집에 와서 같이 저녁을 먹었어요.",
    character_mode: "girl",
    created_at: "2026-10-01T19:20:00",
  },
  {
    id: "memory_sample_1",
    date: "2026-09-30",
    date_label: "9월 30일 수요일",
    title: "☕ 친구와 만남",
    question: "오늘 맛있게 드신 음식은 뭐예요?",
    input_type: "voice",
    original_text: "오랜 친구와 동네 카페에서 따뜻한 커피를 마셨지.",
    summary: "오랜 친구와 커피를 마셨어요.",
    character_mode: "boy",
    created_at: "2026-09-30T15:00:00",
  },
];

export const memoryStorage = {
  // 모든 기억 목록 가져오기 (기본: 최신순)
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

  // 새 기억 저장 (최신 기록이 맨 위로)
  saveMemory(item: Omit<MemoryItem, "id" | "created_at">): MemoryItem {
    const list = this.getMemories();
    const newItem: MemoryItem = {
      ...item,
      id: `memory_${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    const updated = [newItem, ...list];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
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
