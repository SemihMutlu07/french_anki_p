-- Sprint 3: Sentence practice attempts table
-- Run this in the Supabase SQL editor.

create table if not exists sentence_attempts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id),
  card_id text not null,
  type text not null check (type in ('qa', 'translate', 'fill_blank', 'listen_respond')),
  correct boolean not null,
  created_at timestamptz default now()
);

alter table sentence_attempts enable row level security;

create policy "Users can insert own sentence attempts"
  on sentence_attempts for insert
  with check (auth.uid() = user_id);

create policy "Users can read own sentence attempts"
  on sentence_attempts for select
  using (auth.uid() = user_id);
