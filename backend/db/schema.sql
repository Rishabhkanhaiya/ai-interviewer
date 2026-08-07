-- =============================================================================
-- AI Mock Interview Platform — Database Schema
-- Run this entire file in your Supabase SQL Editor (Dashboard → SQL Editor)
-- =============================================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- ── 1. Users ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email            TEXT UNIQUE NOT NULL,
    name             TEXT,
    college          TEXT,
    graduation_year  INT,
    target_companies TEXT[],
    created_at       TIMESTAMPTZ DEFAULT now(),
    referred_by      UUID REFERENCES users(id)
);

-- Index for common lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);


-- ── 2. Packs ──────────────────────────────────────────────────────────────────
-- 'placement_499' = 10 rounds / 200 min | 'topup_199' = 5 rounds / 100 min
CREATE TABLE IF NOT EXISTS packs (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id        UUID REFERENCES users(id) NOT NULL,
    pack_type      TEXT NOT NULL CHECK (pack_type IN ('placement_499', 'topup_199')),
    rounds_total   INT NOT NULL,
    rounds_used    INT DEFAULT 0,
    minutes_total  INT NOT NULL,
    minutes_used   INT DEFAULT 0,
    payment_id     TEXT,
    affiliate_code TEXT,
    created_at     TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_packs_user_id ON packs(user_id);


-- ── 3. Sessions ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sessions (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID REFERENCES users(id) NOT NULL,
    pack_id             UUID REFERENCES packs(id) NOT NULL,
    company             TEXT NOT NULL,
    role                TEXT NOT NULL,
    round_type          TEXT NOT NULL CHECK (round_type IN ('hr', 'technical', 'managerial')),
    language_pref       TEXT DEFAULT 'hinglish' CHECK (language_pref IN ('english', 'hinglish', 'hindi')),
    resume_text         TEXT,
    status              TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
    started_at          TIMESTAMPTZ DEFAULT now(),
    ended_at            TIMESTAMPTZ,
    duration_seconds    INT,
    overall_score       INT,
    star_score          INT,
    technical_score     INT,
    communication_score INT,
    confidence_score    INT,
    wpm_avg             INT,
    filler_count        INT,
    pause_count         INT,
    is_gaming_flagged   BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_pack_id ON sessions(pack_id);


-- ── 4. Session Answers ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS session_answers (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id            UUID REFERENCES sessions(id) NOT NULL,
    question_number       INT NOT NULL,
    question_text         TEXT NOT NULL,
    answer_transcript     TEXT,
    answer_duration_seconds INT,
    wpm                   INT,
    filler_words          JSONB,   -- e.g. {"basically": 3, "um": 2}
    pause_timestamps      JSONB,   -- e.g. [{"start_ms": 4200, "duration_ms": 3100}]
    star_s                INT,     -- 0–5
    star_t                INT,
    star_a                INT,
    star_r                INT,
    answer_score          INT,     -- 0–10
    ai_feedback           TEXT,
    confidence_avg        FLOAT,
    language_mix          JSONB,   -- e.g. {"english": 0.72, "hindi": 0.28}
    created_at            TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_session_answers_session_id ON session_answers(session_id);


-- ── 5. Payments ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payments (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id              UUID REFERENCES users(id) NOT NULL,
    razorpay_payment_id  TEXT UNIQUE NOT NULL,
    razorpay_order_id    TEXT,
    amount_paise         INT NOT NULL,
    status               TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed')),
    affiliate_code       TEXT,
    pack_id              UUID REFERENCES packs(id),
    created_at           TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_razorpay_payment_id ON payments(razorpay_payment_id);


-- ── 6. Affiliates ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS affiliates (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID REFERENCES users(id) NOT NULL UNIQUE,
    code                TEXT UNIQUE NOT NULL,
    upi_id              TEXT,
    total_referrals     INT DEFAULT 0,
    total_earned_paise  INT DEFAULT 0,
    total_paid_paise    INT DEFAULT 0,
    created_at          TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_affiliates_code ON affiliates(code);
CREATE INDEX IF NOT EXISTS idx_affiliates_user_id ON affiliates(user_id);


-- ── 7. Affiliate Payouts ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS affiliate_payouts (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    affiliate_id UUID REFERENCES affiliates(id) NOT NULL,
    payment_id   UUID REFERENCES payments(id) NOT NULL,
    amount_paise INT NOT NULL,
    status       TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid')),
    paid_at      TIMESTAMPTZ,
    created_at   TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_affiliate_payouts_affiliate_id ON affiliate_payouts(affiliate_id);


-- =============================================================================
-- Row Level Security (RLS) Policies
-- Enable RLS on all user-facing tables, then add policies
-- =============================================================================

-- Enable RLS
ALTER TABLE users              ENABLE ROW LEVEL SECURITY;
ALTER TABLE packs              ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions           ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_answers    ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments           ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliates         ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_payouts  ENABLE ROW LEVEL SECURITY;

-- Users: can only see/update their own row
CREATE POLICY users_self ON users
    USING (id = auth.uid());

-- Packs: can only see their own packs
CREATE POLICY packs_self ON packs
    USING (user_id = auth.uid());

-- Sessions: can only see their own sessions
CREATE POLICY sessions_self ON sessions
    USING (user_id = auth.uid());

-- Session answers: can only see answers for their own sessions
CREATE POLICY session_answers_self ON session_answers
    USING (
        session_id IN (
            SELECT id FROM sessions WHERE user_id = auth.uid()
        )
    );

-- Payments: can only see their own payments
CREATE POLICY payments_self ON payments
    USING (user_id = auth.uid());

-- Affiliates: can only see their own affiliate record
CREATE POLICY affiliates_self ON affiliates
    USING (user_id = auth.uid());

-- Affiliate payouts: can only see their own payouts
CREATE POLICY affiliate_payouts_self ON affiliate_payouts
    USING (
        affiliate_id IN (
            SELECT id FROM affiliates WHERE user_id = auth.uid()
        )
    );


-- =============================================================================
-- Service Role Bypass Note
-- =============================================================================
-- The FastAPI backend uses the SERVICE ROLE KEY (not anon key).
-- Service role bypasses all RLS — this is intentional and correct.
-- Never expose the service role key to the frontend.
-- =============================================================================
-- Phase 31-60 Schema Updates

-- 1. Push Subscriptions Table
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) NOT NULL,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. User Streaks & Retention
ALTER TABLE users ADD COLUMN IF NOT EXISTS current_streak INT DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS longest_streak INT DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_practice_date DATE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS best_score INT DEFAULT 0;

-- 3. B2B Colleges
CREATE TABLE IF NOT EXISTS colleges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  package_tier TEXT DEFAULT 'starter',
  max_students INT DEFAULT 100,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE users ADD COLUMN IF NOT EXISTS college_id UUID REFERENCES colleges(id);

-- 4. Fraud Detection Flags
ALTER TABLE payments ADD COLUMN IF NOT EXISTS ip_address TEXT;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS ip_address TEXT;
ALTER TABLE affiliate_payouts ADD COLUMN IF NOT EXISTS is_flagged BOOLEAN DEFAULT false;
ALTER TABLE affiliate_payouts ADD COLUMN IF NOT EXISTS flag_reason TEXT;

