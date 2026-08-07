-- Phase 2: run once in Supabase SQL Editor before deploying the affiliate portal.
-- The portal is deliberately a separate application/domain from the student product.

ALTER TABLE affiliates
    ADD COLUMN IF NOT EXISTS affiliate_type TEXT NOT NULL DEFAULT 'campus'
        CHECK (affiliate_type IN ('campus', 'freelancer')),
    ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'approved'
        CHECK (status IN ('approved', 'suspended')),
    ADD COLUMN IF NOT EXISTS monthly_sales INT NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS affiliate_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) UNIQUE,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    marketer_type TEXT NOT NULL,
    platform_links TEXT[] NOT NULL,
    audience_size INT NOT NULL DEFAULT 0,
    promotion_plan TEXT NOT NULL,
    previous_experience TEXT,
    expected_monthly_sales INT NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'approved', 'rejected')),
    rejection_reason TEXT,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_affiliate_applications_status
    ON affiliate_applications(status, created_at);

-- The FastAPI service uses the Supabase service role. These policies are for
-- direct authenticated reads only; never expose a service role key to the portal.
ALTER TABLE affiliate_applications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS affiliate_applications_select_own ON affiliate_applications;
CREATE POLICY affiliate_applications_select_own ON affiliate_applications
    FOR SELECT USING (user_id = auth.uid());
