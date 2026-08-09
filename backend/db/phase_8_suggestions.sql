-- Phase 8: User Suggestions
-- Creates a table for users to submit topic suggestions.

CREATE TABLE IF NOT EXISTS public.user_suggestions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    topic TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'new',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE public.user_suggestions ENABLE ROW LEVEL SECURITY;

-- Allow users to insert their own suggestions
CREATE POLICY "Users can insert their own suggestions"
    ON public.user_suggestions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Allow users to view their own suggestions
CREATE POLICY "Users can view their own suggestions"
    ON public.user_suggestions FOR SELECT
    USING (auth.uid() = user_id);
