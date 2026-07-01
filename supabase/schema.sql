-- ═══════════════════════════════════════════════════════
--  LazyPost — Complete Database Schema
--  Run this entire file in Supabase SQL Editor (once)
-- ═══════════════════════════════════════════════════════

-- ── Extensions ──────────────────────────────────────────
create extension if not exists "pgcrypto";

-- ── Enums ───────────────────────────────────────────────
do $$ begin
  create type user_role as enum ('super_admin', 'admin', 'user');
exception when duplicate_object then null; end $$;

do $$ begin
  create type post_status as enum ('draft', 'scheduled', 'publishing', 'published', 'failed', 'cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type post_type as enum ('regular', 'thread', 'viral', 'ai_generated', 'viral_video');
exception when duplicate_object then null; end $$;

do $$ begin
  create type subscription_status as enum ('active', 'canceled', 'past_due', 'trialing', 'expired', 'incomplete');
exception when duplicate_object then null; end $$;

do $$ begin
  create type payment_provider as enum ('stripe', 'paynow');
exception when duplicate_object then null; end $$;

do $$ begin
  create type payment_status as enum ('pending', 'completed', 'failed', 'refunded', 'expired');
exception when duplicate_object then null; end $$;

do $$ begin
  create type billing_cycle as enum ('monthly', 'yearly');
exception when duplicate_object then null; end $$;

-- ── Plans ────────────────────────────────────────────────
create table if not exists public.plans (
  id                      text primary key,          -- 'free' | 'starter' | 'pro' | 'agency'
  name                    text not null,
  description             text,
  price_monthly_usd       numeric(10,2) not null default 0,
  price_yearly_usd        numeric(10,2) not null default 0,
  price_monthly_zwg       numeric(10,2) not null default 0,
  price_yearly_zwg        numeric(10,2) not null default 0,
  stripe_price_id_monthly text,
  stripe_price_id_yearly  text,
  features                text[]    not null default '{}',
  limits                  jsonb     not null default '{}',
  is_active               boolean   not null default true,
  sort_order              integer   not null default 0,
  created_at              timestamptz not null default now()
);

-- Seed plans (idempotent)
insert into public.plans (id, name, description, price_monthly_usd, price_yearly_usd,
  price_monthly_zwg, price_yearly_zwg, features, limits, sort_order)
values
  ('free', 'Free', 'Get a feel for LazyPost', 0, 0, 0, 0,
   array['5 posts per month','Manual posting','Basic dashboard','1 Twitter account'],
   '{"posts_per_month":5,"twitter_accounts":1,"ai_generations":0,"team_members":1,
     "auto_post":false,"ai_generate":false,"viral_post":false,"engagement":false,
     "analytics":"basic","viral_video":false}'::jsonb,
   0),
  ('starter', 'Starter', 'For creators getting serious', 9, 84, 324, 3024,
   array['50 posts per month','Post scheduling','AI content hints (10/mo)','Basic analytics','7-day free trial'],
   '{"posts_per_month":50,"twitter_accounts":1,"ai_generations":10,"team_members":1,
     "auto_post":true,"ai_generate":true,"viral_post":false,"engagement":false,
     "analytics":"standard","viral_video":false}'::jsonb,
   1),
  ('pro', 'Pro', 'For power users & influencers', 29, 276, 1044, 9936,
   array['Unlimited posts','Full AI generation','Viral post optimizer','Auto-engagement','Advanced analytics','3 Twitter accounts'],
   '{"posts_per_month":-1,"twitter_accounts":3,"ai_generations":-1,"team_members":1,
     "auto_post":true,"ai_generate":true,"viral_post":true,"engagement":true,
     "analytics":"advanced","viral_video":false}'::jsonb,
   2),
  ('agency', 'Agency', 'For agencies & power brands', 99, 948, 3564, 34128,
   array['Everything in Pro','10 Twitter accounts','5 team members','Viral video generation','Enterprise analytics','Priority support'],
   '{"posts_per_month":-1,"twitter_accounts":10,"ai_generations":-1,"team_members":5,
     "auto_post":true,"ai_generate":true,"viral_post":true,"engagement":true,
     "analytics":"enterprise","viral_video":true}'::jsonb,
   3)
on conflict (id) do update set
  name                    = excluded.name,
  description             = excluded.description,
  price_monthly_usd       = excluded.price_monthly_usd,
  price_yearly_usd        = excluded.price_yearly_usd,
  price_monthly_zwg       = excluded.price_monthly_zwg,
  price_yearly_zwg        = excluded.price_yearly_zwg,
  features                = excluded.features,
  limits                  = excluded.limits,
  sort_order              = excluded.sort_order;

-- ── Profiles ─────────────────────────────────────────────
create table if not exists public.profiles (
  id                    uuid primary key references auth.users(id) on delete cascade,
  email                 text not null,
  full_name             text,
  username              text unique,
  avatar_url            text,
  role                  user_role not null default 'user',
  plan_id               text not null default 'free' references public.plans(id),
  bio                   text,
  timezone              text not null default 'UTC',
  onboarding_completed  boolean not null default false,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

-- ── Subscriptions ────────────────────────────────────────
create table if not exists public.subscriptions (
  id                       uuid primary key default gen_random_uuid(),
  user_id                  uuid not null references public.profiles(id) on delete cascade,
  plan_id                  text not null references public.plans(id),
  status                   subscription_status not null default 'active',
  current_period_start     timestamptz,
  current_period_end       timestamptz,
  stripe_subscription_id   text unique,
  stripe_customer_id       text,
  paynow_poll_url          text,
  billing_cycle            billing_cycle not null default 'monthly',
  cancel_at_period_end     boolean not null default false,
  trial_end                timestamptz,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);

-- ── Twitter Accounts ─────────────────────────────────────
create table if not exists public.twitter_accounts (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references public.profiles(id) on delete cascade,
  twitter_user_id     text not null unique,
  username            text not null,
  display_name        text,
  profile_image_url   text,
  access_token        text not null,
  access_token_secret text,
  refresh_token       text,
  token_expires_at    timestamptz,
  followers_count     integer not null default 0,
  following_count     integer not null default 0,
  tweet_count         integer not null default 0,
  verified            boolean not null default false,
  is_active           boolean not null default true,
  last_synced_at      timestamptz,
  created_at          timestamptz not null default now()
);

-- ── Posts ────────────────────────────────────────────────
create table if not exists public.posts (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null references public.profiles(id) on delete cascade,
  twitter_account_id    uuid references public.twitter_accounts(id) on delete set null,
  content               text not null,
  thread_content        text[],
  media_urls            text[]    not null default '{}',
  hashtags              text[]    not null default '{}',
  status                post_status not null default 'draft',
  post_type             post_type   not null default 'regular',
  scheduled_at          timestamptz,
  published_at          timestamptz,
  twitter_post_id       text,
  error_message         text,
  ai_prompt             text,
  viral_video_prompt    text,
  engagement_stats      jsonb not null default '{"likes":0,"retweets":0,"replies":0,"impressions":0,"bookmarks":0}',
  is_viral_candidate    boolean not null default false,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create index if not exists posts_user_id_idx         on public.posts(user_id);
create index if not exists posts_status_scheduled_idx on public.posts(status, scheduled_at)
  where status = 'scheduled';

-- ── Engagement Rules ─────────────────────────────────────
create table if not exists public.engagement_rules (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null references public.profiles(id) on delete cascade,
  twitter_account_id    uuid not null references public.twitter_accounts(id) on delete cascade,
  is_active             boolean not null default false,
  auto_like             boolean not null default true,
  auto_retweet          boolean not null default false,
  auto_reply            boolean not null default false,
  reply_templates       text[]    not null default '{}',
  target_keywords       text[]    not null default '{}',
  target_hashtags       text[]    not null default '{}',
  excluded_keywords     text[]    not null default '{}',
  daily_like_limit      integer not null default 50,
  daily_retweet_limit   integer not null default 10,
  daily_reply_limit     integer not null default 20,
  engagement_hours      jsonb not null default '{"start":8,"end":22}',
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

-- ── Analytics Snapshots ──────────────────────────────────
create table if not exists public.analytics_snapshots (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid not null references public.profiles(id) on delete cascade,
  twitter_account_id   uuid not null references public.twitter_accounts(id) on delete cascade,
  snapshot_date        date not null,
  followers_count      integer not null default 0,
  following_count      integer not null default 0,
  tweet_count          integer not null default 0,
  impressions          integer not null default 0,
  profile_visits       integer not null default 0,
  mentions             integer not null default 0,
  likes_received       integer not null default 0,
  retweets_received    integer not null default 0,
  replies_received     integer not null default 0,
  created_at           timestamptz not null default now(),
  unique(twitter_account_id, snapshot_date)
);

-- ── Payment Transactions ─────────────────────────────────
create table if not exists public.payment_transactions (
  id                       uuid primary key default gen_random_uuid(),
  user_id                  uuid not null references public.profiles(id) on delete cascade,
  plan_id                  text not null references public.plans(id),
  amount                   numeric(12,2) not null,
  currency                 text not null default 'USD',
  payment_provider         payment_provider not null,
  provider_session_id      text,
  provider_transaction_id  text,
  status                   payment_status not null default 'pending',
  billing_cycle            text,
  metadata                 jsonb not null default '{}',
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);

-- ── User Settings ────────────────────────────────────────
create table if not exists public.user_settings (
  user_id               uuid primary key references public.profiles(id) on delete cascade,
  auto_post_enabled     boolean not null default false,
  auto_post_times       text[]    not null default '{"09:00","12:00","18:00"}',
  timezone              text      not null default 'UTC',
  notification_email    boolean   not null default true,
  notification_browser  boolean   not null default true,
  posting_frequency     text      not null default 'moderate',
  ai_tone               text      not null default 'professional',
  ai_topics             text[]    not null default '{}',
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

-- ── Viral Video Queue ────────────────────────────────────
create table if not exists public.viral_video_queue (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references public.profiles(id) on delete cascade,
  post_id             uuid not null references public.posts(id) on delete cascade,
  prompt              text not null,
  style               text not null default 'dynamic',
  status              text not null default 'pending',
  twitter_media_id    text,
  error_message       text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- ════════════════════════════════════════════════════════
--  Trigger: auto-create profile + subscription on signup
-- ════════════════════════════════════════════════════════
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  -- Insert profile
  insert into public.profiles (id, email, full_name, avatar_url, plan_id)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url',
    'free'
  )
  on conflict (id) do nothing;

  -- Insert default settings
  insert into public.user_settings (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  -- Insert free subscription
  insert into public.subscriptions (user_id, plan_id, status, billing_cycle)
  values (new.id, 'free', 'active', 'monthly')
  on conflict do nothing;

  return new;
end;
$$;

-- Drop and recreate trigger so it's always fresh
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ════════════════════════════════════════════════════════
--  Updated_at trigger (reusable)
-- ════════════════════════════════════════════════════════
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$ declare t text; begin
  foreach t in array array[
    'profiles','subscriptions','posts','engagement_rules',
    'user_settings','viral_video_queue','payment_transactions'
  ] loop
    execute format(
      'drop trigger if exists set_%s_updated_at on public.%s;
       create trigger set_%s_updated_at before update on public.%s
       for each row execute procedure public.set_updated_at();',
      t, t, t, t
    );
  end loop;
end $$;

-- ════════════════════════════════════════════════════════
--  Row-Level Security
-- ════════════════════════════════════════════════════════

-- Enable RLS on all tables
alter table public.plans                enable row level security;
alter table public.profiles             enable row level security;
alter table public.subscriptions        enable row level security;
alter table public.twitter_accounts     enable row level security;
alter table public.posts                enable row level security;
alter table public.engagement_rules     enable row level security;
alter table public.analytics_snapshots  enable row level security;
alter table public.payment_transactions enable row level security;
alter table public.user_settings        enable row level security;
alter table public.viral_video_queue    enable row level security;

-- Helper: is user admin/superadmin?
create or replace function public.is_admin()
returns boolean language sql security definer as $$
  select coalesce(
    (select role in ('admin','super_admin') from public.profiles where id = auth.uid()),
    false
  );
$$;

-- Plans: everyone can read, only superadmin writes
drop policy if exists "plans_read"   on public.plans;
drop policy if exists "plans_admin"  on public.plans;
create policy "plans_read"  on public.plans for select using (true);
create policy "plans_admin" on public.plans for all    using (public.is_admin());

-- Profiles
drop policy if exists "profiles_read_own"   on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;
drop policy if exists "profiles_admin"      on public.profiles;
create policy "profiles_read_own"   on public.profiles for select using (id = auth.uid() or public.is_admin());
create policy "profiles_update_own" on public.profiles for update using (id = auth.uid());
create policy "profiles_admin"      on public.profiles for all    using (public.is_admin());

-- Subscriptions
drop policy if exists "subs_own"   on public.subscriptions;
drop policy if exists "subs_admin" on public.subscriptions;
create policy "subs_own"   on public.subscriptions for select using (user_id = auth.uid() or public.is_admin());
create policy "subs_admin" on public.subscriptions for all    using (public.is_admin());

-- Twitter accounts
drop policy if exists "twitter_own"   on public.twitter_accounts;
drop policy if exists "twitter_admin" on public.twitter_accounts;
create policy "twitter_own"   on public.twitter_accounts for all    using (user_id = auth.uid());
create policy "twitter_admin" on public.twitter_accounts for select using (public.is_admin());

-- Posts
drop policy if exists "posts_own"   on public.posts;
drop policy if exists "posts_admin" on public.posts;
create policy "posts_own"   on public.posts for all    using (user_id = auth.uid());
create policy "posts_admin" on public.posts for select using (public.is_admin());

-- Engagement rules
drop policy if exists "engage_own" on public.engagement_rules;
create policy "engage_own" on public.engagement_rules for all using (user_id = auth.uid());

-- Analytics
drop policy if exists "analytics_own"   on public.analytics_snapshots;
drop policy if exists "analytics_admin" on public.analytics_snapshots;
create policy "analytics_own"   on public.analytics_snapshots for all    using (user_id = auth.uid());
create policy "analytics_admin" on public.analytics_snapshots for select using (public.is_admin());

-- Payments
drop policy if exists "payments_own"   on public.payment_transactions;
drop policy if exists "payments_admin" on public.payment_transactions;
create policy "payments_own"   on public.payment_transactions for select using (user_id = auth.uid());
create policy "payments_admin" on public.payment_transactions for all    using (public.is_admin());

-- Settings
drop policy if exists "settings_own" on public.user_settings;
create policy "settings_own" on public.user_settings for all using (user_id = auth.uid());

-- Video queue
drop policy if exists "video_own" on public.viral_video_queue;
create policy "video_own" on public.viral_video_queue for all using (user_id = auth.uid());

-- ════════════════════════════════════════════════════════
--  Done. Schema is fully set up.
-- ════════════════════════════════════════════════════════
