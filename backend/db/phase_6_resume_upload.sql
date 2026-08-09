-- Phase 6: Resume Upload
-- Adds the resume_text column to the users table

ALTER TABLE users ADD COLUMN IF NOT EXISTS resume_text TEXT;
