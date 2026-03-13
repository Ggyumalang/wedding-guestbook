-- 결혼식 정보 테이블
CREATE TABLE public.weddings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  bride_name text NOT NULL,
  groom_name text NOT NULL,
  password text NOT NULL,
  wedding_date timestamp with time zone,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 축의금 접수 내역 테이블
CREATE TABLE public.envelopes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  wedding_id uuid REFERENCES public.weddings(id) ON DELETE CASCADE,
  side text NOT NULL, -- '신랑측', '신부측'
  seq_number integer NOT NULL, -- 봉투 순번
  amount integer NOT NULL,
  meal_tickets integer DEFAULT 0 NOT NULL,
  name text, -- 나중에 입력
  relation text, -- 나중에 입력
  memo text,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  modified_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 수정 시 자동으로 modified_at 을 갱신하는 트리거 함수
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.modified_at = now(); 
   RETURN NEW;
END;
$$ language 'plpgsql';

-- 트리거 추가
CREATE TRIGGER update_envelopes_modtime
BEFORE UPDATE ON public.envelopes
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- RLS 활성화 기본 설정 (필요시 보안 정책 추가)
ALTER TABLE public.weddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.envelopes ENABLE ROW LEVEL SECURITY;

-- 일단 테스트용으로 모든 권한 허용 (나중에 실제 서비스 시 적절한 정책 적용 필요)
CREATE POLICY "Allow all actions for weddings" ON public.weddings FOR ALL USING (true);
CREATE POLICY "Allow all actions for envelopes" ON public.envelopes FOR ALL USING (true);
