-- Migration script for Phase 4: Onboarding & Conduct Tracking
-- Run this in your Supabase SQL Editor

-- Add new columns to the sessions table
ALTER TABLE sessions 
ADD COLUMN IF NOT EXISTS camera_mode TEXT,
ADD COLUMN IF NOT EXISTS presence_change_log JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS conduct_violation_count INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS conduct_log JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS session_end_reason TEXT;
