-- 01_policies.sql
-- Enable Row Level Security and add policies

-- Enable RLS
alter table public.novels   enable row level security;
alter table public.chapters enable row level security;
alter table public.admins   enable row level security;
alter table public.reading_progress enable row level security;
alter table public.bookmarks enable row level security;
alter table public.likes     enable row level security;
alter table public.comments  enable row level security;

-- Admins table: only admins can read it (optional)
create policy if not exists admins_can_read_admins on public.admins
  for select using (exists (select 1 from public.admins a where a.user_id = auth.uid()));

-- Public read for novels/chapters (site is public)
create policy if not exists novels_public_read on public.novels
  for select using (true);
create policy if not exists chapters_public_read on public.chapters
  for select using (true);

-- Admin-only write for novels
create policy if not exists novels_admin_insert on public.novels
  for insert with check (exists (select 1 from public.admins where user_id = auth.uid()));
create policy if not exists novels_admin_update on public.novels
  for update using (exists (select 1 from public.admins where user_id = auth.uid()));
create policy if not exists novels_admin_delete on public.novels
  for delete using (exists (select 1 from public.admins where user_id = auth.uid()));

-- Admin-only write for chapters
create policy if not exists chapters_admin_insert on public.chapters
  for insert with check (exists (select 1 from public.admins where user_id = auth.uid()));
create policy if not exists chapters_admin_update on public.chapters
  for update using (exists (select 1 from public.admins where user_id = auth.uid()));
create policy if not exists chapters_admin_delete on public.chapters
  for delete using (exists (select 1 from public.admins where user_id = auth.uid()));

-- Reading progress: user can read/write only their own
create policy if not exists progress_select_own on public.reading_progress
  for select using (auth.uid() = user_id);
create policy if not exists progress_insert_own on public.reading_progress
  for insert with check (auth.uid() = user_id);
create policy if not exists progress_update_own on public.reading_progress
  for update using (auth.uid() = user_id);
create policy if not exists progress_delete_own on public.reading_progress
  for delete using (auth.uid() = user_id);

-- Bookmarks: own rows only
create policy if not exists bookmarks_select_own on public.bookmarks
  for select using (auth.uid() = user_id);
create policy if not exists bookmarks_write_own on public.bookmarks
  for insert with check (auth.uid() = user_id);
create policy if not exists bookmarks_update_own on public.bookmarks
  for update using (auth.uid() = user_id);
create policy if not exists bookmarks_delete_own on public.bookmarks
  for delete using (auth.uid() = user_id);

-- Likes: own rows only
create policy if not exists likes_select_own on public.likes
  for select using (auth.uid() = user_id);
create policy if not exists likes_write_own on public.likes
  for insert with check (auth.uid() = user_id);
create policy if not exists likes_delete_own on public.likes
  for delete using (auth.uid() = user_id);

-- Comments: anyone can read; only owner can write/update/delete theirs
create policy if not exists comments_public_read on public.comments
  for select using (true);
create policy if not exists comments_write_own on public.comments
  for insert with check (auth.uid() = user_id);
create policy if not exists comments_update_own on public.comments
  for update using (auth.uid() = user_id);
create policy if not exists comments_delete_own on public.comments
  for delete using (auth.uid() = user_id);
