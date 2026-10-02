// AI 손자·손녀 응답 생성 및 의도 분석 서비스
export interface AiAnswerResult {
  answer: string;
  isApplianceQuestion: boolean;
  suggestedActionLabel?: string;
}

// 가전제품 관련 키워드 목록
const APPLIANCE_KEYWORDS = [
  "에어컨", "리모컨", "세탁기", "전자레인지", "티비", "tv", "TV", "텔레비전",
  "보일러", "밥솥", "청소기", "선풍기", "인덕션", "가스레인지", "냉장고",
  "전원", "온도", "탈수", "취사", "난방", "온수", "채널", "볼륨", "사용법", "켜", "꺼", "어떻게 해",
];

export function getAiGrandchildAnswer(
  question: string,
  characterMode: "boy" | "girl"
): AiAnswerResult {
  const trimmed = question.trim();
  const lower = trimmed.toLowerCase();

  // 1. 전자기기/가전제품 관련 질문 감지
  const isAppliance = APPLIANCE_KEYWORDS.some((kw) => lower.includes(kw));

  if (isAppliance) {
    if (characterMode === "boy") {
      return {
        answer: "할머니, 제가 알려드릴게요! 리모컨이나 기기 사진을 찍어서 보여주시면 바로 켜는 방법을 설명해 드릴게요.",
        isApplianceQuestion: true,
        suggestedActionLabel: "📷 사진 찍어 보여주기",
      };
    } else {
      return {
        answer: "할머니, 걱정 마세요! 기기나 리모컨 사진을 찰칵 찍어주시면 제가 버튼 누르는 법을 하나씩 알려드릴게요.",
        isApplianceQuestion: true,
        suggestedActionLabel: "📷 사진 찍어 보여주기",
      };
    }
  }

  // 2. 날씨 관련
  if (lower.includes("날씨") || lower.includes("비") || lower.includes("추워") || lower.includes("더워")) {
    if (characterMode === "boy") {
      return {
        answer: "오늘 날씨는 아주 맑고 화창해요! 가벼운 외투 입으시고 따뜻한 햇살 받으며 산책 다녀오세요 😊",
        isApplianceQuestion: false,
      };
    } else {
      return {
        answer: "오늘 하늘이 정말 맑고 예뻐요! 바람이 살짝 불 수 있으니 따뜻하게 챙겨 입으시고 조심히 다녀오세요 💖",
        isApplianceQuestion: false,
      };
    }
  }

  // 3. 밥/식사 관련
  if (lower.includes("밥") || lower.includes("식사") || lower.includes("아침") || lower.includes("점심") || lower.includes("저녁") || lower.includes("약")) {
    if (characterMode === "boy") {
      return {
        answer: "식사는 맛있게 챙겨 드셨어요? 따뜻한 물도 한 잔 꼭 드시고, 드시는 약 있으시면 잊지 말고 챙겨 드세요!",
        isApplianceQuestion: false,
      };
    } else {
      return {
        answer: "할머니, 식사 거르지 마시고 꼭꼭 씹어서 든든하게 챙겨 드세요! 건강이 최고예요 💕",
        isApplianceQuestion: false,
      };
    }
  }

  // 4. 두뇌운동/게임 관련
  if (lower.includes("두뇌") || lower.includes("운동") || lower.includes("게임") || lower.includes("공부") || lower.includes("기억")) {
    if (characterMode === "boy") {
      return {
        answer: "오늘 5분 두뇌 운동하러 가볼까요? 차근차근 손가락을 움직이면 머리가 아주 상쾌해져요!",
        isApplianceQuestion: false,
      };
    } else {
      return {
        answer: "저랑 같이 재미있는 두뇌 퀴즈 풀어요! 실수해도 괜찮으니 편안하게 놀러 가봐요 🌷",
        isApplianceQuestion: false,
      };
    }
  }

  // 5. 일반/기타 따뜻한 대화
  if (characterMode === "boy") {
    return {
      answer: "할머니, 말씀해 주셔서 감사해요! 제가 항상 곁에서 도와드릴 테니 무엇이든 편하게 물어보세요 😊",
      isApplianceQuestion: false,
    };
  } else {
    return {
      answer: "할머니 목소리 들으니 정말 기뻐요! 궁금하신 점이나 필요한 게 있으시면 언제든 저를 불러주세요 💖",
      isApplianceQuestion: false,
    };
  }
}
