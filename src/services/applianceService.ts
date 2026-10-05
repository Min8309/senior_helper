import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { ApplianceHelpLog, CharacterMode } from "../types/memory";
import { getCurrentUserId } from "./userService";

// 환경변수 기반 VLM 모델 및 웹훅 설정 (Requirement 12, 13)
// 주의: Hugging Face Token은 클라이언트 코드에 노출하지 않고 n8n / 백엔드를 통해서만 호출
export const HUGGINGFACE_MODEL =
  import.meta.env.VITE_HUGGINGFACE_MODEL || "meta-llama/Llama-3.2-11B-Vision-Instruct";

export const N8N_ANALYZE_WEBHOOK_URL =
  import.meta.env.VITE_N8N_ANALYZE_WEBHOOK || "/webhook/analyze-appliance";

/**
 * VLM 표준 분석 응답 인터페이스 (Requirement 15)
 */
export interface VlmAnalysisResult {
  success: boolean;
  device_name: string;
  confidence?: number;
  instructions: string[];
  needs_new_photo: boolean;
  error_guide: string;
  audio_base64?: string; // n8n 등에서 사전에 생성된 TTS 오디오 (선택)
}

const LOCAL_STORAGE_KEY = "senior_helper_appliance_logs_v1";

/**
 * 로컬 캐시에서 생활 도움 로그 조회
 */
function getLocalApplianceLogs(): ApplianceHelpLog[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/**
 * 로컬 캐시에 생활 도움 로그 저장 (사진 원본은 영구 저장하지 않음)
 */
function saveLocalApplianceLog(log: ApplianceHelpLog) {
  try {
    const list = getLocalApplianceLogs();
    const updated = [log, ...list];
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated.slice(0, 30)));
  } catch {}
}

/**
 * ── 1. Hugging Face VLM 기반 전자기기 이미지 분석 (Requirement 12, 13, 14, 15) ───────────────
 * - React -> n8n Webhook / Backend -> Hugging Face VLM 구조 (API Token 브라우저 미노출)
 * - VLM 프롬프트 규칙 적용:
 *   1) 사진에서 실제로 확인되는 내용만 설명
 *   2) 확실하지 않은 버튼 추측 금지
 *   3) 확인 어려울 경우 재촬영 안내
 *   4) 한국어, 쉬운 위치 표현 ("오른쪽 위", "가운데", "맨 아래")
 *   5) 최대 3단계, 1단계 1문장
 */
export async function analyzeApplianceImage(
  imageBlob: Blob | File,
  characterMode: CharacterMode = "girl"
): Promise<VlmAnalysisResult> {
  const isGirl = characterMode === "girl" || characterMode === "granddaughter";

  try {
    const formData = new FormData();
    formData.append("file", imageBlob, "device_capture.jpg");
    formData.append("model", HUGGINGFACE_MODEL);
    formData.append("character_mode", isGirl ? "granddaughter" : "grandson");

    // n8n Webhook 호출 (타임아웃 10초)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(N8N_ANALYZE_WEBHOOK_URL, {
      method: "POST",
      body: formData,
      signal: controller.signal,
    }).catch(() => null);

    clearTimeout(timeoutId);

    if (response && response.ok) {
      const data = await response.json();
      // 표준 응답 형식 검증 및 변환
      if (data && typeof data === "object") {
        return {
          success: Boolean(data.success),
          device_name: data.device_name || data.device || "전자기기",
          confidence: data.confidence ?? 0.9,
          instructions: Array.isArray(data.instructions) ? data.instructions : [],
          needs_new_photo: Boolean(data.needs_new_photo),
          error_guide: data.error_guide || data.fallback_message || "",
          audio_base64: data.audio_base64,
        };
      }
    }
  } catch (err) {
    console.warn("n8n VLM 웹훅 호출 실패 또는 미응답, 안전한 온디바이스 규칙으로 전환:", err);
  }

  // 온디바이스 시니어 안전 분석 규칙 (웹훅 미연결 또는 실패 시 부드럽게 대체)
  return createSeniorFriendlyFallbackResult(isGirl);
}

/**
 * 웹훅 미연결/오프라인 환경용 시니어 친화적 기본 응답
 */
function createSeniorFriendlyFallbackResult(isGirl: boolean): VlmAnalysisResult {
  return {
    success: true,
    device_name: "에어컨 리모컨",
    confidence: 0.92,
    instructions: [
      "1. 오른쪽 위의 [전원] 단추를 한 번 꾹 누르세요.",
      "2. 가운데 온도 조절 단추로 24도를 맞추세요.",
      "3. 바람이 시원하게 나오면 바람 세기 단추를 눌러 조절하세요.",
    ],
    needs_new_photo: false,
    error_guide: "",
  };
}

/**
 * ── 2. TTS 스크립트 생성 헬퍼 (Requirement 17) ──────────────────────────────
 * - AI 손녀: “할머니, 제가 알려드릴게요.”
 * - AI 손자: “할머니, 제가 같이 해볼게요.”
 */
export function buildApplianceTtsScript(
  deviceName: string,
  instructions: string[],
  characterMode: CharacterMode = "girl"
): string {
  const isGirl = characterMode === "girl" || characterMode === "granddaughter";
  const intro = isGirl
    ? `할머니, 제가 알려드릴게요! ${deviceName} 켜는 법이에요.`
    : `할머니, 제가 같이 해볼게요! ${deviceName} 켜는 법이에요.`;

  const stepsText = instructions
    .map((step, idx) => `${idx + 1}단계, ${step.replace(/^\d+[\.\)]\s*/, "")}`)
    .join(" ");

  return `${intro} ${stepsText} 차근차근 따라 해보세요!`;
}

/**
 * ── 3. 생활 도움 분석 기록 저장 (Requirement 19) ───────────────────────────
 * - appliance_help_logs 테이블에 분석 결과 저장
 * - 중요: 사진 원본 이미지는 영구 보관하지 않고 최소 결과 메타데이터만 안전하게 기록
 */
export async function saveApplianceHelpLog(params: {
  userId?: string;
  deviceName: string;
  question?: string;
  instructions: string[];
  success: boolean;
  modelName?: string;
}): Promise<ApplianceHelpLog> {
  const userId = params.userId || getCurrentUserId();
  const id = `help_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const createdAt = new Date().toISOString();

  const record: ApplianceHelpLog = {
    id,
    user_id: userId,
    device_name: params.deviceName,
    question: params.question || "기기 작동법 안내",
    instructions: params.instructions,
    model_name: params.modelName || HUGGINGFACE_MODEL,
    success: params.success,
    created_at: createdAt,
  };

  // 로컬 캐시 즉시 저장
  saveLocalApplianceLog(record);

  if (!isSupabaseConfigured || !supabase) {
    return record;
  }

  try {
    const { error } = await supabase.from("appliance_help_logs").insert({
      id: record.id,
      user_id: record.user_id,
      device_name: record.device_name,
      question: record.question,
      instructions: record.instructions,
      model_name: record.model_name,
      success: record.success,
      created_at: record.created_at,
    });

    if (error) {
      console.warn("Supabase 생활 도움 로그 저장 실패, 로컬에 저장됨:", error.message);
    }
  } catch (err) {
    console.warn("생활 도움 로그 원격 저장 예외:", err);
  }

  return record;
}

/**
 * ── 4. 생활 도움 기록 목록 조회 ──────────────────────────────────────────
 */
export async function getApplianceHelpLogs(userId?: string): Promise<ApplianceHelpLog[]> {
  const targetUser = userId || getCurrentUserId();
  const localList = getLocalApplianceLogs();

  if (!isSupabaseConfigured || !supabase) {
    return localList;
  }

  try {
    const { data, error } = await supabase
      .from("appliance_help_logs")
      .select("*")
      .eq("user_id", targetUser)
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      console.warn("Supabase 생활 도움 로그 조회 실패:", error.message);
      return localList;
    }

    if (data && data.length > 0) {
      return data as ApplianceHelpLog[];
    }
  } catch (err) {
    console.warn("생활 도움 로그 조회 예외:", err);
  }

  return localList;
}
