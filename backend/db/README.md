# Database Setup — Run Order

Go to **Supabase Dashboard → SQL Editor → New query**, then run these files **in this exact order**:

## Step 1 — `schema.sql`
Creates all 7 tables + basic RLS enable:
- `users`
- `packs`
- `sessions`
- `session_answers`
- `payments`
- `affiliates`
- `affiliate_payouts`

## Step 2 — `rls_policies.sql`
Detailed Row Level Security policies:
- Users can only read/write their own rows
- Backend (service key) bypasses RLS for financial writes
- Public affiliate code lookup (for unauthenticated checkout)

## Step 3 — `indexes.sql`
Performance indexes + analytics views:
- Composite indexes for dashboard queries
- Unique index on `razorpay_payment_id` (webhook dedup)
- Partial indexes for `pending` payouts and `flagged` sessions
- 3 analytics views: `user_session_stats`, `affiliate_leaderboard`, `business_metrics`

## Step 4 — `auth_trigger.sql`
- Auto-creates `public.users` row when user signs up via OTP
- Creates `resumes` storage bucket with per-user RLS
- **REQUIRED** — without this, first login will fail

---

## How to run

1. Open [Supabase Dashboard](https://app.supabase.com)
2. Select your project: `svqiyxjbfxllkbzvcpyq`
3. Go to **SQL Editor** → **New query**
4. Paste content of each `.sql` file → click **Run**
5. Confirm with: `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';`

Expected tables: `affiliate_payouts`, `affiliates`, `packs`, `payments`, `session_answers`, `sessions`, `users`
