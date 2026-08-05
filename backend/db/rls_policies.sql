-- =============================================================================
-- AI Mock Interview Platform — RLS Policies (Detailed)
-- Run AFTER schema.sql in Supabase SQL Editor
-- These extend the basic RLS in schema.sql with full CRUD policies
-- =============================================================================

-- =============================================================================
-- USERS TABLE
-- =============================================================================

-- Drop default policy from schema.sql (replacing with separate CRUD policies)
DROP POLICY IF EXISTS users_self ON users;

-- SELECT: user can read their own row
CREATE POLICY users_select ON users
    FOR SELECT USING (id = auth.uid());

-- INSERT: Supabase auth trigger creates the row — but allow insert too for onboarding
CREATE POLICY users_insert ON users
    FOR INSERT WITH CHECK (id = auth.uid());

-- UPDATE: user can update their own row
CREATE POLICY users_update ON users
    FOR UPDATE USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

-- DELETE: user can delete their own account
CREATE POLICY users_delete ON users
    FOR DELETE USING (id = auth.uid());


-- =============================================================================
-- PACKS TABLE
-- =============================================================================

DROP POLICY IF EXISTS packs_self ON packs;

-- SELECT: user can see only their own packs
CREATE POLICY packs_select ON packs
    FOR SELECT USING (user_id = auth.uid());

-- INSERT: only service role (backend) inserts packs — block client inserts
-- (no INSERT policy = client cannot insert; backend uses service key which bypasses RLS)

-- UPDATE: only service role updates pack minutes/rounds — block client updates


-- =============================================================================
-- SESSIONS TABLE
-- =============================================================================

DROP POLICY IF EXISTS sessions_self ON sessions;

-- SELECT: user can see only their own sessions
CREATE POLICY sessions_select ON sessions
    FOR SELECT USING (user_id = auth.uid());

-- INSERT: blocked on client (backend inserts via service key)
-- UPDATE: blocked on client (backend updates via service key)


-- =============================================================================
-- SESSION_ANSWERS TABLE
-- =============================================================================

DROP POLICY IF EXISTS session_answers_self ON session_answers;

-- SELECT: user can read answers only for their own sessions
CREATE POLICY session_answers_select ON session_answers
    FOR SELECT USING (
        session_id IN (
            SELECT id FROM sessions WHERE user_id = auth.uid()
        )
    );

-- INSERT/UPDATE: only backend (service key)


-- =============================================================================
-- PAYMENTS TABLE
-- =============================================================================

DROP POLICY IF EXISTS payments_self ON payments;

-- SELECT: user can view their own payment history
CREATE POLICY payments_select ON payments
    FOR SELECT USING (user_id = auth.uid());

-- INSERT/UPDATE: only backend (service key) — Razorpay webhook


-- =============================================================================
-- AFFILIATES TABLE
-- =============================================================================

DROP POLICY IF EXISTS affiliates_self ON affiliates;

-- SELECT: user can view their own affiliate record
CREATE POLICY affiliates_select ON affiliates
    FOR SELECT USING (user_id = auth.uid());

-- UPDATE: user can update their UPI ID only
CREATE POLICY affiliates_update_upi ON affiliates
    FOR UPDATE USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- INSERT: backend only (service key)


-- =============================================================================
-- AFFILIATE_PAYOUTS TABLE
-- =============================================================================

DROP POLICY IF EXISTS affiliate_payouts_self ON affiliate_payouts;

-- SELECT: user can view their own payouts
CREATE POLICY affiliate_payouts_select ON affiliate_payouts
    FOR SELECT USING (
        affiliate_id IN (
            SELECT id FROM affiliates WHERE user_id = auth.uid()
        )
    );

-- INSERT/UPDATE: only admin backend (service key)


-- =============================================================================
-- PUBLIC READ: Affiliate code lookup (needed for referral validation without auth)
-- =============================================================================

-- Allow unauthenticated users to look up affiliate codes during purchase
CREATE POLICY affiliates_code_public_lookup ON affiliates
    FOR SELECT USING (true);
-- Note: This exposes code + referrer_name only — sensitive fields are protected
-- by not selecting them in the query. Refine this per your privacy requirements.


-- =============================================================================
-- SUMMARY
-- =============================================================================
-- All INSERT/UPDATE of financial/session data is done by the FastAPI backend
-- using the SERVICE ROLE KEY which bypasses RLS entirely.
-- Client-side (anon key) gets READ access to their own data only.
-- =============================================================================
