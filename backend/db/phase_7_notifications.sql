-- ── 8. In-App Notifications ───────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS in_app_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE, -- NULL means global notification (all users)
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    link TEXT,
    type TEXT DEFAULT 'system',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for querying notifications
CREATE INDEX IF NOT EXISTS idx_in_app_notifications_user_id ON in_app_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_in_app_notifications_created_at ON in_app_notifications(created_at DESC);

CREATE TABLE IF NOT EXISTS in_app_notification_reads (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    notification_id UUID REFERENCES in_app_notifications(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (user_id, notification_id)
);

-- Enable RLS
ALTER TABLE in_app_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE in_app_notification_reads ENABLE ROW LEVEL SECURITY;

-- Users can read global notifications (user_id is null) or their own
CREATE POLICY notifications_read_policy ON in_app_notifications
    FOR SELECT USING (user_id IS NULL OR user_id = auth.uid());

-- Users can insert and read their own read receipts
CREATE POLICY notification_reads_policy_select ON in_app_notification_reads
    FOR SELECT USING (user_id = auth.uid());
    
CREATE POLICY notification_reads_policy_insert ON in_app_notification_reads
    FOR INSERT WITH CHECK (user_id = auth.uid());
