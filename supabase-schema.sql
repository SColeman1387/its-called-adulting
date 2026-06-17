-- ============================================================
-- It's Called Adulting — Supabase Schema
-- Run this in your Supabase SQL editor (Dashboard → SQL Editor)
-- ============================================================

-- ── Profiles ──────────────────────────────────────────────────
-- One row per user. Extends auth.users (managed by Supabase Auth).
create table if not exists profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  display_name  text,
  email         text,
  role          text not null default 'user' check (role in ('user', 'admin')),

  -- Onboarding answers (mirrors localStorage profile)
  home_type     text,   -- 'apartment' | 'rent-house' | 'own-house'
  has_car       boolean default false,
  has_pool      boolean default false,
  has_yard      boolean default false,
  setup_complete boolean default false,

  -- Referral
  referral_code text unique,          -- their own shareable code (e.g. "SHEA42")
  referred_by   uuid references profiles(id),  -- who invited them

  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- Auto-create a profile row whenever a new user signs up
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
declare
  new_code text;
begin
  -- Generate a short unique referral code
  new_code := upper(substring(md5(new.id::text) from 1 for 6));
  insert into profiles (id, email, referral_code)
  values (new.id, new.email, new_code);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();


-- ── Tool completions ──────────────────────────────────────────
-- Tracks which tools a user has marked as acquired
create table if not exists tool_acquisitions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references profiles(id) on delete cascade,
  tool_id     text not null,            -- matches TOOLS[].id in toolkit.ts
  acquired_at timestamptz default now(),
  unique(user_id, tool_id)
);


-- ── Task completions ──────────────────────────────────────────
-- Mirrors localStorage ica_completions but persisted server-side
create table if not exists task_completions (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references profiles(id) on delete cascade,
  task_id         text not null,
  completed_at    timestamptz default now(),
  mileage_at_time int
);


-- ── Weekly lessons ────────────────────────────────────────────
create table if not exists lesson_records (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references profiles(id) on delete cascade,
  week_key    text not null,            -- "2025-W23"
  task_id     text not null,
  response    text check (response in ('learned', 'knew-it')),
  viewed_at   timestamptz default now(),
  unique(user_id, week_key)
);


-- ── Referrals ─────────────────────────────────────────────────
-- Tracks referral events for rewards credit
create table if not exists referrals (
  id            uuid primary key default gen_random_uuid(),
  referrer_id   uuid not null references profiles(id) on delete cascade,
  referred_id   uuid not null references profiles(id) on delete cascade,
  created_at    timestamptz default now(),
  rewarded      boolean default false,  -- true once reward credit is applied
  unique(referred_id)                   -- can only be referred once
);


-- ── Rewards ───────────────────────────────────────────────────
create table if not exists rewards (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references profiles(id) on delete cascade,
  tier          text not null check (tier in ('tier1', 'tier2')),
  -- tier1 = 6 tools acquired, tier2 = all 12 tools + 6+ months
  reward_choice text,   -- 'drill' | 'jump-pack' | 'tire-inflator' | 'multi-tool'
  status        text not null default 'pending'
                  check (status in ('pending', 'processing', 'shipped', 'delivered')),
  -- Shipping info (collected at redemption)
  ship_name     text,
  ship_address  text,
  ship_city     text,
  ship_state    text,
  ship_zip      text,
  ship_phone    text,
  tracking_number text,
  notes         text,   -- admin notes
  created_at    timestamptz default now(),
  updated_at    timestamptz default now(),
  -- One redemption per tier per user
  unique(user_id, tier)
);


-- ── Parent ↔ Child links ───────────────────────────────────────
create table if not exists parent_links (
  id          uuid primary key default gen_random_uuid(),
  parent_id   uuid not null references profiles(id) on delete cascade,
  child_id    uuid not null references profiles(id) on delete cascade,
  status      text not null default 'pending'
                check (status in ('pending', 'accepted', 'declined')),
  invite_token text unique,  -- used in the share link
  created_at  timestamptz default now(),
  unique(parent_id, child_id)
);


-- ── Row-Level Security ────────────────────────────────────────
alter table profiles          enable row level security;
alter table tool_acquisitions enable row level security;
alter table task_completions  enable row level security;
alter table lesson_records    enable row level security;
alter table referrals         enable row level security;
alter table rewards           enable row level security;
alter table parent_links      enable row level security;

-- Profiles: users can read/update their own row; admins can read all
create policy "Users can view own profile"
  on profiles for select using (auth.uid() = id);
create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

-- Tool acquisitions: own rows only
create policy "Users manage own tool acquisitions"
  on tool_acquisitions for all using (auth.uid() = user_id);

-- Task completions: own rows only
create policy "Users manage own task completions"
  on task_completions for all using (auth.uid() = user_id);

-- Lesson records: own rows only
create policy "Users manage own lesson records"
  on lesson_records for all using (auth.uid() = user_id);

-- Referrals: referrer and referred can read their own rows
create policy "Users can view own referrals"
  on referrals for select
  using (auth.uid() = referrer_id or auth.uid() = referred_id);

-- Rewards: users can create and view their own; admins update
create policy "Users can view own rewards"
  on rewards for select using (auth.uid() = user_id);
create policy "Users can create own rewards"
  on rewards for insert with check (auth.uid() = user_id);

-- Parent links: both parent and child can see their links
create policy "Users can view own parent links"
  on parent_links for select
  using (auth.uid() = parent_id or auth.uid() = child_id);
create policy "Parent can create link"
  on parent_links for insert with check (auth.uid() = parent_id);
create policy "Child can accept/decline"
  on parent_links for update using (auth.uid() = child_id);

-- Parents can view their linked child's profile (read-only)
create policy "Parents can view linked child profiles"
  on profiles for select
  using (
    exists (
      select 1 from parent_links
      where parent_id = auth.uid()
        and child_id = profiles.id
        and status = 'accepted'
    )
  );

-- Parents can view linked child's tool acquisitions
create policy "Parents can view linked child tool acquisitions"
  on tool_acquisitions for select
  using (
    exists (
      select 1 from parent_links
      where parent_id = auth.uid()
        and child_id = tool_acquisitions.user_id
        and status = 'accepted'
    )
  );

-- Parents can view linked child's task completions
create policy "Parents can view linked child task completions"
  on task_completions for select
  using (
    exists (
      select 1 from parent_links
      where parent_id = auth.uid()
        and child_id = task_completions.user_id
        and status = 'accepted'
    )
  );
