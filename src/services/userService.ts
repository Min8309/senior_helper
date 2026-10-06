import { supabase } from "../lib/supabase"

const USER_ID_KEY = "senior_user_id"
const fallbackId = crypto.randomUUID()

export function getCurrentUserId(): string {
  try {
    let id = localStorage.getItem(USER_ID_KEY)
    if (!id) {
      id = crypto.randomUUID()
      localStorage.setItem(USER_ID_KEY, id)
    }
    return id
  } catch {
    return fallbackId
  }
}

let authentication: Promise<string | null> | null = null

// Supabase Auth의 서버 발급 ID만 원격 데이터 소유자로 사용합니다.
// 대시보드에서 Anonymous Sign-ins를 활성화하면 별도 가입 없이 사용할 수 있습니다.
export function getAuthenticatedUserId(): Promise<string | null> {
  if (!supabase) return Promise.resolve(null)
  if (!authentication) {
    authentication = (async () => {
      const { data: session, error: sessionError } =
        await supabase.auth.getSession()
      if (sessionError) throw sessionError
      if (session.session) {
        const { data, error } = await supabase.auth.getUser()
        if (error) throw error
        return data.user.id
      }
      const { data, error } = await supabase.auth.signInAnonymously()
      if (error) throw error
      return data.user?.id ?? null
    })()
      .catch((error) => {
        console.warn("클라우드 인증 실패: 기록은 이 기기에 보관합니다.", error)
        return null
      })
      .finally(() => {
        authentication = null
      })
  }
  return authentication
}
