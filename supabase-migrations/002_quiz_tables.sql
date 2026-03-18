-- Sprint 2: Listening + Gender quiz attempt tables
-- Run this in the Supabase SQL editor.

create table if not exists listening_attempts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id),
  card_id text not null,
  correct boolean not null,
  created_at timestamptz default now()
);

create table if not exists gender_quiz_attempts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id),
  card_id text not null,
  correct boolean not null,
  created_at timestamptz default now()
);

-- RLS: users can only insert/read their own rows
alter table listening_attempts enable row level security;
alter table gender_quiz_attempts enable row level security;

create policy "Users can insert own listening attempts"
  on listening_attempts for insert
  with check (auth.uid() = user_id);

create policy "Users can read own listening attempts"
  on listening_attempts for select
  using (auth.uid() = user_id);

create policy "Users can insert own gender quiz attempts"
  on gender_quiz_attempts for insert
  with check (auth.uid() = user_id);

create policy "Users can read own gender quiz attempts"
  on gender_quiz_attempts for select
  using (auth.uid() = user_id);
