-- =============================================================================
-- AI Mock Interview Platform — Auth Trigger
-- Run AFTER schema.sql in Supabase SQL Editor
--
-- This auto-creates a row in the public.users table whenever a new user
-- signs up via Supabase Auth (OTP email). Without this, the backend
-- will fail to find the user row on first login.
-- =============================================================================

-- Function: called by the trigger on every new Supabase Auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER                -- Runs as the function owner (postgres), not anon
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.users (id, email, created_at)
    VALUES (
        NEW.id,
        NEW.email,
        NOW()
    )
    ON CONFLICT (id) DO NOTHING;  -- Idempotent: safe to call multiple times

    RETURN NEW;
END;
$$;

-- Trigger: fires after each row insert into auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();


-- =============================================================================
-- ALSO: Supabase Storage bucket for resume uploads
-- =============================================================================

-- Create a private bucket for resume PDFs
INSERT INTO storage.buckets (id, name, public)
VALUES ('resumes', 'resumes', FALSE)
ON CONFLICT (id) DO NOTHING;

-- RLS: authenticated users can upload their own resume
CREATE POLICY resume_upload ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (
        bucket_id = 'resumes'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- RLS: authenticated users can read only their own resumes
CREATE POLICY resume_read ON storage.objects
    FOR SELECT TO authenticated
    USING (
        bucket_id = 'resumes'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- RLS: authenticated users can delete their own resumes
CREATE POLICY resume_delete ON storage.objects
    FOR DELETE TO authenticated
    USING (
        bucket_id = 'resumes'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );


-- =============================================================================
-- VERIFY: Check everything was created correctly
-- =============================================================================
-- Run these SELECTs to confirm:
--
-- SELECT table_name FROM information_schema.tables
--   WHERE table_schema = 'public'
--   ORDER BY table_name;
-- Expected: affiliate_payouts, affiliates, packages, payments, session_answers, sessions, users
--
-- SELECT trigger_name FROM information_schema.triggers
--   WHERE trigger_schema = 'public';
-- Expected: (none here — trigger is on auth.users)
--
-- SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
-- Expected: 1 row
-- =============================================================================
