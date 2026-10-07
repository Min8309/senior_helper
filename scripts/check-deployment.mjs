import { readFileSync } from 'node:fs'
import { loadEnv } from 'vite'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

export function validateEnvironment(env) {
  const url = env.VITE_SUPABASE_URL?.trim() || ''
  const key = env.VITE_SUPABASE_ANON_KEY?.trim() || ''
  if (Boolean(url) !== Boolean(key)) throw new Error('Supabase URL과 공개 키를 함께 설정하세요.')
  const https = (value, name) => {
    let parsed
    try { parsed = new URL(value) } catch { throw new Error(`${name}에는 전체 HTTPS 주소를 설정하세요.`) }
    if (parsed.protocol !== 'https:' || parsed.username || parsed.password) {
      throw new Error(`${name}에는 인증 정보가 없는 HTTPS 주소를 설정하세요.`)
    }
  }
  if (url) https(url, 'VITE_SUPABASE_URL')
  if (key) {
    let role
    try { role = JSON.parse(Buffer.from(key.split('.')[1] || '', 'base64url').toString()).role } catch {}
    if (key.startsWith('sb_secret_') || role === 'service_role') {
      throw new Error('Supabase 비밀 키는 브라우저에 배포할 수 없습니다. 공개 anon/publishable 키를 사용하세요.')
    }
  }
  const webhook = env.VITE_N8N_ANALYZE_WEBHOOK?.trim()
  if (webhook) https(webhook, 'VITE_N8N_ANALYZE_WEBHOOK')
}

export function validateAssets(root) {
  for (const file of ['img/boy.mp4', 'img/girl.mp4', 'src/assets/cozy_room_bg.jpg']) {
    const bytes = readFileSync(resolve(root, file))
    if (bytes.subarray(0, 128).toString().startsWith('version https://git-lfs.github.com/spec/v1')) {
      throw new Error(`${file}: 실제 파일 대신 Git LFS 포인터가 있습니다. git lfs pull을 실행하세요.`)
    }
    const valid = file.endsWith('.mp4')
      ? bytes.subarray(4, 8).toString() === 'ftyp'
      : bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff
    if (!valid) throw new Error(`${file}: 미디어 파일이 손상되었거나 형식이 올바르지 않습니다.`)
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    const env = { ...loadEnv("production", process.cwd(), "VITE_"), ...process.env }
    validateEnvironment(env)
    validateAssets(process.cwd())
    console.log('배포 환경변수와 필수 영상·배경 파일 확인 완료')
    if (!env.VITE_SUPABASE_URL) console.log('Supabase 미설정: 기억은 이 브라우저에 저장됩니다.')
    if (!env.VITE_N8N_ANALYZE_WEBHOOK) console.log('사진 분석 서버 미설정: 촬영은 가능하지만 AI 분석은 연결되지 않습니다.')
  } catch (error) {
    console.error(error.message)
    process.exitCode = 1
  }
}
