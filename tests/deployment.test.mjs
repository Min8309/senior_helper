import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { validateAssets, validateEnvironment } from '../scripts/check-deployment.mjs'

test('Deployment allows local mode and public Supabase keys but rejects partial and secret configuration', () => {
  assert.doesNotThrow(() => validateEnvironment({}))
  const publicEnv = { VITE_SUPABASE_URL: 'https://example.supabase.co', VITE_SUPABASE_ANON_KEY: 'sb_publishable_example', VITE_N8N_ANALYZE_WEBHOOK: 'https://example.org/webhook/analyze' }
  assert.doesNotThrow(() => validateEnvironment(publicEnv))
  assert.throws(() => validateEnvironment({ VITE_SUPABASE_URL: publicEnv.VITE_SUPABASE_URL }), /함께/)
  assert.throws(() => validateEnvironment({ ...publicEnv, VITE_SUPABASE_ANON_KEY: 'sb_secret_example' }), /비밀 키/)
  const token = `header.${Buffer.from(JSON.stringify({ role: 'service_role' })).toString('base64url')}.signature`
  assert.throws(() => validateEnvironment({ ...publicEnv, VITE_SUPABASE_ANON_KEY: token }), /비밀 키/)
  assert.throws(() => validateEnvironment({ ...publicEnv, VITE_N8N_ANALYZE_WEBHOOK: 'http://example.org/webhook' }), /HTTPS/)
  assert.throws(() => validateEnvironment({ ...publicEnv, VITE_N8N_ANALYZE_WEBHOOK: '/webhook/analyze' }), /HTTPS/)
})

test('Required production media is real binary data and LFS pointers cannot pass deployment', () => {
  assert.doesNotThrow(() => validateAssets(process.cwd()))
  const root = mkdtempSync(join(tmpdir(), 'senior-deploy-'))
  try {
    mkdirSync(join(root, 'img'))
    writeFileSync(join(root, 'img/boy.mp4'), 'version https://git-lfs.github.com/spec/v1\noid sha256:fake\nsize 100\n')
    assert.throws(() => validateAssets(root), /LFS 포인터/)
    writeFileSync(join(root, 'img/boy.mp4'), '<html>Not a video</html>')
    assert.throws(() => validateAssets(root), /형식/)
  } finally { rmSync(root, { recursive: true, force: true }) }
})
