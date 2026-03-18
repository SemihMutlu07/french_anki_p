-- Sprint 5: Allow authenticated users to read aggregate data for class dashboard.
-- These policies enable reading other users' progress data (anonymized in queries).
-- Run this in the Supabase SQL editor.

-- Allow any authenticated user to read progress records (for class aggregates).
-- The class dashboard only shows aggregate data — no individual identities exposed.
create policy "Authenticated users can read all progress for aggregates"
  on progress for select
  using (auth.role() = 'authenticated');

-- Allow any authenticated user to read listening attempt counts (for class accuracy).
create policy "Authenticated users can read listening attempts for aggregates"
  on listening_attempts for select
  using (auth.role() = 'authenticated');

-- Allow any authenticated user to read gender quiz attempt counts (for class accuracy).
create policy "Authenticated users can read gender quiz attempts for aggregates"
  on gender_quiz_attempts for select
  using (auth.role() = 'authenticated');
