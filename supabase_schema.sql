-- ==============================================================================
-- 🌸 시니어 헬퍼 (Senior Helper) - Supabase 데이터베이스 스키마 및 스토리지 설정
-- ==============================================================================

-- 1. 사용자 프로필 테이블 (profiles)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nickname TEXT NOT NULL DEFAULT '김영희',
  character_mode TEXT NOT NULL DEFAULT 'grandson' CHECK (character_mode IN ('grandson', 'granddaughter', 'boy', 'girl')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS 활성화
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read for profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Allow public insert for profiles" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update for profiles" ON public.profiles FOR UPDATE USING (true);

-- 2. 나의 기억 저장 테이블 (memories)
CREATE TABLE IF NOT EXISTS public.memories (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  date TEXT NOT NULL,
  date_label TEXT,
  title TEXT NOT NULL,
  question TEXT NOT NULL,
  input_type TEXT NOT NULL CHECK (input_type IN ('voice', 'text')),
  original_text TEXT NOT NULL,
  display_text TEXT NOT NULL,
  summary TEXT,
  character_mode TEXT DEFAULT 'grandson',
  audio_path TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 인덱스 (사용자별 최신순 빠른 정렬 조회)
CREATE INDEX IF NOT EXISTS idx_memories_user_created ON public.memories (user_id, created_at DESC);

-- RLS 활성화
ALTER TABLE public.memories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read memories" ON public.memories FOR SELECT USING (true);
CREATE POLICY "Allow public insert memories" ON public.memories FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update memories" ON public.memories FOR UPDATE USING (true);
CREATE POLICY "Allow public delete memories" ON public.memories FOR DELETE USING (true);

-- 3. 두뇌운동 기록 테이블 (brain_training_logs)
CREATE TABLE IF NOT EXISTS public.brain_training_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  training_type TEXT NOT NULL,
  level INT NOT NULL DEFAULT 1,
  duration_seconds INT NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT true,
  score INT DEFAULT 100,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_brain_logs_user ON public.brain_training_logs (user_id, created_at DESC);

ALTER TABLE public.brain_training_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read brain logs" ON public.brain_training_logs FOR SELECT USING (true);
CREATE POLICY "Allow public insert brain logs" ON public.brain_training_logs FOR INSERT WITH CHECK (true);

-- 4. AI 손자/손녀 대화 기록 테이블 (ai_conversations)
CREATE TABLE IF NOT EXISTS public.ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  character_mode TEXT NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_conversations_user ON public.ai_conversations (user_id, created_at DESC);

ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read ai conversations" ON public.ai_conversations FOR SELECT USING (true);
CREATE POLICY "Allow public insert ai conversations" ON public.ai_conversations FOR INSERT WITH CHECK (true);

-- 5. 생활 도움 기기 분석 기록 테이블 (appliance_help_logs)
-- 주의: 개인정보 보호를 위해 사진 원본은 영구 저장하지 않고 최소 결과만 보관합니다.
CREATE TABLE IF NOT EXISTS public.appliance_help_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  device_name TEXT NOT NULL,
  question TEXT,
  instructions JSONB NOT NULL DEFAULT '[]'::jsonb,
  model_name TEXT DEFAULT 'meta-llama/Llama-3.2-11B-Vision-Instruct',
  success BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_appliance_help_user ON public.appliance_help_logs (user_id, created_at DESC);

ALTER TABLE public.appliance_help_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read appliance logs" ON public.appliance_help_logs FOR SELECT USING (true);
CREATE POLICY "Allow public insert appliance logs" ON public.appliance_help_logs FOR INSERT WITH CHECK (true);

-- 6. 음성 파일 저장용 Supabase Storage 버킷 생성 안내
-- Supabase 대시보드 Storage 메뉴에서 아래 버킷을 Public으로 생성하거나 아래 SQL을 실행합니다:
INSERT INTO storage.buckets (id, name, public)
VALUES ('memory-audio', 'memory-audio', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Allow public upload to memory-audio"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'memory-audio');

CREATE POLICY "Allow public read from memory-audio"
ON storage.objects FOR SELECT
USING (bucket_id = 'memory-audio');

CREATE POLICY "Allow public delete from memory-audio"
ON storage.objects FOR DELETE
USING (bucket_id = 'memory-audio');
