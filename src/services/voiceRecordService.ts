export interface VoiceRecordResult {
  audioBlob?: Blob
  audioDataUrl?: string
  transcript: string
}

class VoiceRecordService {
  private mediaRecorder: MediaRecorder | null = null
  private recognition: any = null
  private stream: MediaStream | null = null
  private transcript = ""
  private chunks: Blob[] = []
  private generation = 0
  private stopping: Promise<VoiceRecordResult> | null = null

  async recordVoice(
    onTranscriptUpdate?: (text: string) => void,
  ): Promise<boolean> {
    this.cancelRecording()
    const generation = this.generation
    this.transcript = ""
    this.chunks = []
    try {
      if (
        navigator.mediaDevices?.getUserMedia &&
        typeof MediaRecorder !== "undefined"
      ) {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        })
        if (generation !== this.generation) {
          stream.getTracks().forEach((track) => track.stop())
          return false
        }
        this.stream = stream
        this.mediaRecorder = new MediaRecorder(stream)
        this.mediaRecorder.ondataavailable = (event) => {
          if (generation === this.generation && event.data.size)
            this.chunks.push(event.data)
        }
        this.mediaRecorder.start()
      }
      const Recognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition
      if (Recognition) {
        this.recognition = new Recognition()
        this.recognition.lang = "ko-KR"
        this.recognition.continuous = true
        this.recognition.interimResults = true
        this.recognition.onresult = (event: any) => {
          if (generation !== this.generation) return
          // continuous 결과 목록 전체를 사용해 이전 확정 문장을 유지합니다.
          this.transcript = Array.from(
            event.results as ArrayLike<any>,
            (result) => result[0].transcript,
          )
            .join(" ")
            .trim()
          onTranscriptUpdate?.(this.transcript)
        }
        this.recognition.onerror = (error: unknown) =>
          console.warn(
            "음성 인식 실패: 직접 입력으로 보완할 수 있습니다.",
            error,
          )
        this.recognition.start()
      }
      return Boolean(this.mediaRecorder || this.recognition)
    } catch (error) {
      console.warn("녹음 시작 실패", error)
      this.cancelRecording()
      return false
    }
  }

  stopRecording(): Promise<VoiceRecordResult> {
    if (this.stopping) return this.stopping
    const generation = this.generation
    const recorder = this.mediaRecorder
    const recognition = this.recognition
    const speechEnded = new Promise<void>((resolve) => {
      if (!recognition) {
        resolve()
        return
      }
      const timer = setTimeout(resolve, 800)
      recognition.onend = () => {
        clearTimeout(timer)
        resolve()
      }
      try {
        recognition.stop()
      } catch {
        clearTimeout(timer)
        resolve()
      }
    })
    const audioStopped = new Promise<Blob | undefined>((resolve) => {
      if (!recorder || recorder.state === "inactive") {
        resolve(undefined)
        return
      }
      recorder.onstop = () =>
        resolve(
          new Blob(this.chunks, {
            type: recorder.mimeType || this.chunks[0]?.type || "audio/webm",
          }),
        )
      recorder.onerror = () => resolve(undefined)
      try {
        recorder.stop()
      } catch {
        resolve(undefined)
      }
    })
    this.stopping = (async () => {
      try {
        const [audio] = await Promise.all([audioStopped, speechEnded])
        if (generation !== this.generation) return { transcript: "" }
        const transcript = this.transcript.trim()
        const dataUrl = audio
          ? await new Promise<string | undefined>((resolve) => {
              const reader = new FileReader()
              reader.onloadend = () =>
                resolve(
                  typeof reader.result === "string" ? reader.result : undefined,
                )
              reader.onerror = () => resolve(undefined)
              reader.readAsDataURL(audio)
            })
          : undefined
        if (generation !== this.generation) return { transcript: "" }
        return { transcript, audioBlob: audio, audioDataUrl: dataUrl }
      } finally {
        if (generation === this.generation) {
          this.cleanupStream()
          this.mediaRecorder = null
          this.recognition = null
        }
        if (generation === this.generation) this.stopping = null
      }
    })()
    return this.stopping
  }

  cancelRecording() {
    this.generation++
    try {
      this.recognition?.abort()
    } catch {
      /* 이미 종료된 인식 */
    }
    try {
      if (this.mediaRecorder?.state !== "inactive") this.mediaRecorder?.stop()
    } catch {
      /* 이미 종료된 녹음 */
    }
    this.cleanupStream()
    this.recognition = null
    this.mediaRecorder = null
    this.transcript = ""
    this.chunks = []
    this.stopping = null
  }
  private cleanupStream() {
    this.stream?.getTracks().forEach((track) => track.stop())
    this.stream = null
  }
}

const service = new VoiceRecordService()
export const recordVoice = (onUpdate?: (text: string) => void) =>
  service.recordVoice(onUpdate)
export const stopRecording = () => service.stopRecording()
export const cancelRecording = () => service.cancelRecording()
