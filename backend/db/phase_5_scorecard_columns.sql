-- Migration script for Phase 5: Scorecard generation
-- Run this in your Supabase SQL Editor

ALTER TABLE sessions 
ADD COLUMN IF NOT EXISTS error_analysis JSONB,
ADD COLUMN IF NOT EXISTS comprehensive_summary TEXT,
ADD COLUMN IF NOT EXISTS filler_total INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS transcript JSONB DEFAULT '[]'::jsonb;

-- Force API schema reload
NOTIFY pgrst, 'reload schema';
