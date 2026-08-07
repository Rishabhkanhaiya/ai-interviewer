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
