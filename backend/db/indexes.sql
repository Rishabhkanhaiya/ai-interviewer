-- =============================================================================
-- AI Mock Interview Platform — Performance Indexes
-- Run AFTER schema.sql in Supabase SQL Editor
-- =============================================================================

-- =============================================================================
-- USERS
-- =============================================================================

-- Fast login lookup by email
CREATE INDEX IF NOT EXISTS idx_users_email
    ON users(email);

-- Fast referred_by chain queries
CREATE INDEX IF NOT EXISTS idx_users_referred_by
    ON users(referred_by);

-- Fast college-based analytics
CREATE INDEX IF NOT EXISTS idx_users_college
    ON users(college);

-- Fast graduation year filter
CREATE INDEX IF NOT EXISTS idx_users_grad_year
    ON users(graduation_year);


-- =============================================================================
-- PACKS
-- =============================================================================

-- Fetch active packs for a user fast
CREATE INDEX IF NOT EXISTS idx_packs_user_id
    ON packs(user_id);

-- Check remaining rounds quickly
CREATE INDEX IF NOT EXISTS idx_packs_user_rounds
    ON packs(user_id, rounds_used, rounds_total);


-- =============================================================================
-- SESSIONS
-- =============================================================================

-- Most frequent query: list sessions by user sorted by date
CREATE INDEX IF NOT EXISTS idx_sessions_user_id
    ON sessions(user_id);

CREATE INDEX IF NOT EXISTS idx_sessions_user_started
    ON sessions(user_id, started_at DESC);

-- Pack usage tracking
CREATE INDEX IF NOT EXISTS idx_sessions_pack_id
    ON sessions(pack_id);

-- Company + round type filtering (dashboard analytics)
CREATE INDEX IF NOT EXISTS idx_sessions_company
    ON sessions(company);

-- Status filtering (active sessions for rate limiting)
CREATE INDEX IF NOT EXISTS idx_sessions_status
    ON sessions(status);

-- Admin: flag gaming sessions
CREATE INDEX IF NOT EXISTS idx_sessions_gaming_flagged
    ON sessions(is_gaming_flagged)
    WHERE is_gaming_flagged = TRUE;

-- Composite: fast scorecard list for a user
CREATE INDEX IF NOT EXISTS idx_sessions_user_status_score
    ON sessions(user_id, status, overall_score);


-- =============================================================================
-- SESSION_ANSWERS
-- =============================================================================

-- Load all answers for a session (scorecard page)
CREATE INDEX IF NOT EXISTS idx_session_answers_session_id
    ON session_answers(session_id);

-- Order answers by question number
CREATE INDEX IF NOT EXISTS idx_session_answers_session_qnum
    ON session_answers(session_id, question_number ASC);


-- =============================================================================
-- PAYMENTS
-- =============================================================================

-- User payment history
CREATE INDEX IF NOT EXISTS idx_payments_user_id
    ON payments(user_id);

-- Razorpay webhook deduplication (most critical — must be unique)
CREATE UNIQUE INDEX IF NOT EXISTS idx_payments_razorpay_payment_id
    ON payments(razorpay_payment_id);

-- Order lookup
CREATE INDEX IF NOT EXISTS idx_payments_order_id
    ON payments(razorpay_order_id);


-- =============================================================================
-- AFFILIATES
-- =============================================================================

-- Code validation at checkout (unauthenticated lookup)
CREATE INDEX IF NOT EXISTS idx_affiliates_code
    ON affiliates(code);

-- User's own affiliate record
CREATE INDEX IF NOT EXISTS idx_affiliates_user_id
    ON affiliates(user_id);


-- =============================================================================
-- AFFILIATE_PAYOUTS
-- =============================================================================

-- List all pending payouts for an affiliate
CREATE INDEX IF NOT EXISTS idx_affiliate_payouts_affiliate_id
    ON affiliate_payouts(affiliate_id);

-- Admin: all pending payouts across all affiliates
CREATE INDEX IF NOT EXISTS idx_affiliate_payouts_status
    ON affiliate_payouts(status)
    WHERE status = 'pending';

-- Join with payments table
CREATE INDEX IF NOT EXISTS idx_affiliate_payouts_payment_id
    ON affiliate_payouts(payment_id);


-- =============================================================================
-- ANALYTICS VIEWS (optional but useful)
-- =============================================================================

-- View: per-user session stats (used by dashboard)
CREATE OR REPLACE VIEW user_session_stats WITH (security_invoker = true) AS
SELECT
    user_id,
    COUNT(*)                                          AS total_sessions,
    COUNT(*) FILTER (WHERE status = 'completed')     AS completed_sessions,
    ROUND(AVG(overall_score) FILTER (WHERE overall_score IS NOT NULL)) AS avg_score,
    SUM(duration_seconds)                            AS total_duration_seconds,
    MAX(started_at)                                  AS last_session_at
FROM sessions
GROUP BY user_id;

-- View: affiliate leaderboard (top earners)
CREATE OR REPLACE VIEW affiliate_leaderboard WITH (security_invoker = true) AS
SELECT
    a.code,
    u.name,
    a.total_referrals,
    a.total_earned_paise,
    a.total_paid_paise,
    (a.total_earned_paise - a.total_paid_paise) AS pending_paise
FROM affiliates a
JOIN users u ON a.user_id = u.id
ORDER BY a.total_earned_paise DESC
LIMIT 100;

-- View: business metrics (used by admin dashboard)
CREATE OR REPLACE VIEW business_metrics WITH (security_invoker = true) AS
SELECT
    (SELECT COUNT(*) FROM users)                       AS total_users,
    (SELECT COUNT(*) FROM sessions)                    AS total_sessions,
    (SELECT COUNT(*) FROM sessions WHERE status = 'completed') AS completed_sessions,
    (SELECT COALESCE(SUM(amount_paise), 0) FROM payments WHERE status = 'completed') AS total_revenue_paise,
    (SELECT COUNT(*) FROM sessions WHERE is_gaming_flagged = TRUE) AS flagged_sessions,
    (SELECT COALESCE(SUM(amount_paise), 0) FROM affiliate_payouts WHERE status = 'pending') AS pending_payouts_paise;
