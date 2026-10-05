// 음성 녹음 및 STT 음성인식 전담 서비스 모듈

export interface VoiceRecordResult {
  audioBlob?: Blob;
  audioDataUrl?: string;
  transcript: string;
}

class VoiceRecordService {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private recognition: any = null;
  private transcriptAccumulated = "";
  private stream: MediaStream | null = null;

  // 음성 녹음 + 음성인식(STT) 시작
  async recordVoice(onTranscriptUpdate?: (text: string) => void): Promise<boolean> {
    this.audioChunks = [];
    this.transcriptAccumulated = "";

    try {
      // 1. 마이크 오디오 스트림 획득
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        this.mediaRecorder = new MediaRecorder(this.stream);

        this.mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            this.audioChunks.push(event.data);
          }
        };

        this.mediaRecorder.start();
      }

      // 2. Web Speech API (실시간 STT)
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.lang = "ko-KR";
        this.recognition.continuous = true;
        this.recognition.interimResults = true;

        this.recognition.onresult = (event: any) => {
          let current = "";
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            current += event.results[i][0].transcript;
          }
          this.transcriptAccumulated = current;
          if (onTranscriptUpdate) {
            onTranscriptUpdate(current);
          }
        };

        this.recognition.onerror = () => {};
        this.recognition.start();
      }

      return true;
    } catch (err) {
      console.warn("오디오 녹음 시작 오류 (권한 또는 브라우저 정책):", err);
      // 마이크 권한 실패 시에도 Web Speech API 단독 시도
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        try {
          this.recognition = new SpeechRecognition();
          this.recognition.lang = "ko-KR";
          this.recognition.onresult = (event: any) => {
            const current = event.results[0][0].transcript;
            this.transcriptAccumulated = current;
            if (onTranscriptUpdate) onTranscriptUpdate(current);
          };
          this.recognition.start();
          return true;
        } catch {
          return false;
        }
      }
      return false;
    }
  }

  // 녹음 종료 및 오디오 + 텍스트 결과 반환
  stopRecording(): Promise<VoiceRecordResult> {
    return new Promise((resolve) => {
      // STT 중지
      if (this.recognition) {
        try {
          this.recognition.stop();
        } catch {}
      }

      // MediaRecorder 중지
      if (this.mediaRecorder && this.mediaRecorder.state !== "inactive") {
        this.mediaRecorder.onstop = () => {
          const audioBlob = new Blob(this.audioChunks, { type: "audio/webm;codecs=opus" });
          
          // Data URL 생성 (로컬 재생용)
          const reader = new FileReader();
          reader.onloadend = () => {
            const audioDataUrl = reader.result as string;
            this.cleanupStream();
            resolve({
              audioBlob,
              audioDataUrl,
              transcript: this.transcriptAccumulated.trim(),
            });
          };
          reader.onerror = () => {
            this.cleanupStream();
            resolve({
              audioBlob,
              transcript: this.transcriptAccumulated.trim(),
            });
          };
          reader.readAsDataURL(audioBlob);
        };

        try {
          this.mediaRecorder.stop();
        } catch {
          this.cleanupStream();
          resolve({ transcript: this.transcriptAccumulated.trim() });
        }
      } else {
        this.cleanupStream();
        resolve({
          transcript: this.transcriptAccumulated.trim(),
        });
      }
    });
  }

  // 오디오 Blob 또는 음성 입력을 텍스트로 변환 (Requirement 9: speechToText)
  // 향후 백엔드/n8n Whisper 또는 STT API 연동 지점
  async speechToText(audioBlob?: Blob): Promise<string> {
    if (this.transcriptAccumulated.trim()) {
      return this.transcriptAccumulated.trim();
    }
    // 향후 n8n / 서버 STT 웹훅 호출 예시:
    // if (audioBlob && N8N_STT_WEBHOOK_URL) {
    //   const formData = new FormData();
    //   formData.append("audio", audioBlob, "voice.webm");
    //   const res = await fetch(N8N_STT_WEBHOOK_URL, { method: "POST", body: formData });
    //   const data = await res.json();
    //   return data.text;
    // }
    return this.transcriptAccumulated.trim();
  }

  // 취소
  cancelRecording() {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {}
    }
    if (this.mediaRecorder && this.mediaRecorder.state !== "inactive") {
      try {
        this.mediaRecorder.stop();
      } catch {}
    }
    this.cleanupStream();
    this.audioChunks = [];
    this.transcriptAccumulated = "";
  }

  private cleanupStream() {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
  }
}

export const voiceRecordService = new VoiceRecordService();

// Requirement 9: 별도 service 함수로 분리하여 내보내기
export const recordVoice = (onTranscriptUpdate?: (text: string) => void) =>
  voiceRecordService.recordVoice(onTranscriptUpdate);
export const stopRecording = () => voiceRecordService.stopRecording();
export const speechToText = (audioBlob?: Blob) => voiceRecordService.speechToText(audioBlob);
export const cancelRecording = () => voiceRecordService.cancelRecording();

