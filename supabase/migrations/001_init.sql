-- ============================================================
-- FR Tutor — Full Database Schema
-- Run this ONCE in Supabase SQL Editor before first deploy.
-- ============================================================

-- ─── 1. Progress table (core FSRS spaced repetition) ────────

create table if not exists progress (
  id             uuid default gen_random_uuid() primary key,
  user_id        uuid not null references auth.users(id) on delete cascade,
  card_id        text not null,
  course         text not null,
  unit           int  not null,
  known          boolean not null,
  review_count   int  not null default 1,
  next_review_at timestamptz not null,
  last_seen_at   timestamptz not null,
  created_at     timestamptz default now(),
  -- FSRS state columns
  s              float8,  -- stability (days until 90% retrievability)
  d              float8,  -- difficulty (0-10)
  r              float8,  -- retrievability (0-1)
  unique (user_id, card_id)
);

alter table progress enable row level security;

-- Users can read/write their own rows
create policy "Users can manage own progress"
  on progress for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Class dashboard: any authenticated user can read aggregates
create policy "Authenticated users can read all progress for aggregates"
  on progress for select
  using (auth.role() = 'authenticated');

-- Index for common queries
create index if not exists idx_progress_user_id on progress(user_id);
create index if not exists idx_progress_user_card on progress(user_id, card_id);
create index if not exists idx_progress_user_course_unit on progress(user_id, course, unit);
create index if not exists idx_progress_last_seen on progress(last_seen_at desc);

-- ─── 2. Listening quiz attempts ─────────────────────────────

create table if not exists listening_attempts (
  id         uuid default gen_random_uuid() primary key,
  user_id    uuid not null references auth.users(id) on delete cascade,
  card_id    text not null,
  correct    boolean not null,
  created_at timestamptz default now()
);

alter table listening_attempts enable row level security;

create policy "Users can insert own listening attempts"
  on listening_attempts for insert
  with check (auth.uid() = user_id);

create policy "Users can read own listening attempts"
  on listening_attempts for select
  using (auth.uid() = user_id);

-- Class dashboard aggregate read
create policy "Authenticated users can read listening attempts for aggregates"
  on listening_attempts for select
  using (auth.role() = 'authenticated');

create index if not exists idx_listening_user on listening_attempts(user_id);

-- ─── 3. Gender quiz attempts ────────────────────────────────

create table if not exists gender_quiz_attempts (
  id         uuid default gen_random_uuid() primary key,
  user_id    uuid not null references auth.users(id) on delete cascade,
  card_id    text not null,
  correct    boolean not null,
  created_at timestamptz default now()
);

alter table gender_quiz_attempts enable row level security;

create policy "Users can insert own gender quiz attempts"
  on gender_quiz_attempts for insert
  with check (auth.uid() = user_id);

create policy "Users can read own gender quiz attempts"
  on gender_quiz_attempts for select
  using (auth.uid() = user_id);

-- Class dashboard aggregate read
create policy "Authenticated users can read gender quiz attempts for aggregates"
  on gender_quiz_attempts for select
  using (auth.role() = 'authenticated');

create index if not exists idx_gender_quiz_user on gender_quiz_attempts(user_id);

-- ─── 4. Sentence practice attempts ─────────────────────────

create table if not exists sentence_attempts (
  id         uuid default gen_random_uuid() primary key,
  user_id    uuid not null references auth.users(id) on delete cascade,
  card_id    text not null,
  type       text not null check (type in ('qa', 'translate', 'fill_blank', 'listen_respond')),
  correct    boolean not null,
  created_at timestamptz default now()
);

alter table sentence_attempts enable row level security;

create policy "Users can insert own sentence attempts"
  on sentence_attempts for insert
  with check (auth.uid() = user_id);

create policy "Users can read own sentence attempts"
  on sentence_attempts for select
  using (auth.uid() = user_id);

create index if not exists idx_sentence_user on sentence_attempts(user_id);
