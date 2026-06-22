-- ============================================================
-- Migration 001 — Add all missing columns and tables
-- Run in Supabase Dashboard → SQL Editor
-- Safe to run multiple times (uses IF NOT EXISTS / DO blocks)
-- ============================================================

-- ── profiles: missing columns ────────────────────────────────

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS has_pets          boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS has_water_softener boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS has_dryer         boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS has_fireplace     boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS city              text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS state             text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS car_year          text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS car_make          text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS current_mileage   int;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_oil_change_mileage int;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS oil_change_interval int DEFAULT 5000;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS preferred_oil_shop text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS preferred_oil_shop_phone text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS pool_type         text;   -- 'above-ground' | 'in-ground'
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS trash_day         int;    -- 0=Sun … 6=Sat
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS recycling_day     int;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS trash_done_week   text;   -- "2025-W23"
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_status text DEFAULT 'inactive';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_customer_id text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_subscription_id text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_subscribed     boolean GENERATED ALWAYS AS (subscription_status = 'active') STORED;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS points            int DEFAULT 0;

-- ── task_completions: add unique constraint if missing ────────
-- Allows upsert on (user_id, task_id)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'task_completions_user_id_task_id_key'
  ) THEN
    ALTER TABLE task_completions ADD CONSTRAINT task_completions_user_id_task_id_key
      UNIQUE (user_id, task_id);
  END IF;
END $$;

-- ── points_ledger ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS points_ledger (
  id          text PRIMARY KEY,           -- client-generated UUID
  user_id     uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type        text NOT NULL,              -- 'task_complete' | 'lesson_complete' | 'signup' | etc.
  points      int NOT NULL,
  label       text,
  ref_id      text,
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE points_ledger ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users manage own points ledger"
  ON points_ledger FOR ALL USING (auth.uid() = user_id);

-- ── push_subscriptions ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  subscription text NOT NULL,             -- JSON string from PushManager.subscribe()
  created_at   timestamptz DEFAULT now(),
  UNIQUE (user_id)
);

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users manage own push subscription"
  ON push_subscriptions FOR ALL USING (auth.uid() = user_id);

-- Service-role can read all (for cron sends)
CREATE POLICY IF NOT EXISTS "Service role reads push subscriptions"
  ON push_subscriptions FOR SELECT USING (true);

-- ── community_tips ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS community_tips (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id     text NOT NULL,
  tip_text    text NOT NULL,
  location    text,
  user_id     uuid REFERENCES profiles(id) ON DELETE SET NULL,
  approved    boolean DEFAULT false,      -- admin approves before showing
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE community_tips ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Anyone can submit a tip"
  ON community_tips FOR INSERT WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Approved tips are publicly visible"
  ON community_tips FOR SELECT USING (approved = true);

-- ── rewards: update tier constraint to match current code ─────
-- Current code uses 'gc10' and 'gc25', old schema had 'tier1'/'tier2'
ALTER TABLE rewards DROP CONSTRAINT IF EXISTS rewards_tier_check;
ALTER TABLE rewards ADD CONSTRAINT rewards_tier_check
  CHECK (tier IN ('tier1', 'tier2', 'gc10', 'gc25'));

ALTER TABLE rewards DROP CONSTRAINT IF EXISTS rewards_status_check;
ALTER TABLE rewards ADD CONSTRAINT rewards_status_check
  CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'sent', 'pending_manual'));

ALTER TABLE rewards ADD COLUMN IF NOT EXISTS tremendous_order_id text;
ALTER TABLE rewards ADD COLUMN IF NOT EXISTS tremendous_error    text;

-- Drop the one-per-tier unique constraint (Tremendous allows multiple redemptions)
ALTER TABLE rewards DROP CONSTRAINT IF EXISTS rewards_user_id_tier_key;

-- ── indexes ───────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_task_completions_user ON task_completions (user_id);
CREATE INDEX IF NOT EXISTS idx_points_ledger_user ON points_ledger (user_id);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user ON push_subscriptions (user_id);
CREATE INDEX IF NOT EXISTS idx_community_tips_task ON community_tips (task_id, approved);
