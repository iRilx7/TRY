-- ==============================
-- NovelHub: One-Paste SQL Setup
-- ==============================
-- Paste this entire script into Supabase SQL Editor and RUN.
-- Then add yourself as admin with the final statement (replace YOUR-UUID).

-- 1) Core Tables
create table if not exists public.novels (
  id bigserial primary key,
  slug text unique not null,
  title text not null,
  author text,
  description text,
  cover_url text,
  tags text[] default '{}',
  is_published boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.chapters (
  id bigserial primary key,
  novel_id bigint not null references public.novels(id) on delete cascade,
  index_in_novel int not null,
  title text not null,
  content text not null,
  is_published boolean default true,
  published_at timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (novel_id, index_in_novel)
);

create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz default now()
);

create table if not exists public.reading_progress (
  user_id uuid not null,
  novel_id bigint not null references public.novels(id) on delete cascade,
  last_chapter_index int not null,
  last_scroll_pct numeric check (last_scroll_pct between 0 and 100),
  updated_at timestamptz default now(),
  primary key (user_id, novel_id)
);

create table if not exists public.bookmarks (
  id bigserial primary key,
  user_id uuid not null,
  chapter_id bigint not null references public.chapters(id) on delete cascade,
  created_at timestamptz default now(),
  unique (user_id, chapter_id)
);

create table if not exists public.likes (
  id bigserial primary key,
  user_id uuid not null,
  chapter_id bigint not null references public.chapters(id) on delete cascade,
  created_at timestamptz default now(),
  unique (user_id, chapter_id)
);

create table if not exists public.comments (
  id bigserial primary key,
  user_id uuid not null,
  chapter_id bigint not null references public.chapters(id) on delete cascade,
  body text not null,
  created_at timestamptz default now()
);

-- Optional helper to update 'updated_at'
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

drop trigger if exists trg_touch_novels on public.novels;
create trigger trg_touch_novels before update on public.novels
for each row execute function public.touch_updated_at();

drop trigger if exists trg_touch_chapters on public.chapters;
create trigger trg_touch_chapters before update on public.chapters
for each row execute function public.touch_updated_at();

-- 2) Enable RLS (Row Level Security)
alter table public.novels             enable row level security;
alter table public.chapters           enable row level security;
alter table public.admins             enable row level security;
alter table public.reading_progress   enable row level security;
alter table public.bookmarks          enable row level security;
alter table public.likes              enable row level security;
alter table public.comments           enable row level security;

-- 3) Policies
-- Admins table: only admins can read (optional, keeps list private)
create policy if not exists admins_can_read on public.admins
for select using (exists (select 1 from public.admins a where a.user_id = auth.uid()));

-- Public read for novels/chapters (site is free to read)
create policy if not exists novels_public_read   on public.novels   for select using (true);
create policy if not exists chapters_public_read on public.chapters for select using (true);

-- Admin-only writes to novels
create policy if not exists novels_admin_insert on public.novels
  for insert with check (exists (select 1 from public.admins where user_id = auth.uid()));
create policy if not exists novels_admin_update on public.novels
  for update using (exists (select 1 from public.admins where user_id = auth.uid()));
create policy if not exists novels_admin_delete on public.novels
  for delete using (exists (select 1 from public.admins where user_id = auth.uid()));

-- Admin-only writes to chapters
create policy if not exists chapters_admin_insert on public.chapters
  for insert with check (exists (select 1 from public.admins where user_id = auth.uid()));
create policy if not exists chapters_admin_update on public.chapters
  for update using (exists (select 1 from public.admins where user_id = auth.uid()));
create policy if not exists chapters_admin_delete on public.chapters
  for delete using (exists (select 1 from public.admins where user_id = auth.uid()));

-- Per-user data: only owner can see/edit their own
create policy if not exists progress_select_own on public.reading_progress
  for select using (auth.uid() = user_id);
create policy if not exists progress_insert_own on public.reading_progress
  for insert with check (auth.uid() = user_id);
create policy if not exists progress_update_own on public.reading_progress
  for update using (auth.uid() = user_id);

create policy if not exists bookmarks_select_own on public.bookmarks
  for select using (auth.uid() = user_id);
create policy if not exists bookmarks_write_own on public.bookmarks
  for insert with check (auth.uid() = user_id);
create policy if not exists bookmarks_delete_own on public.bookmarks
  for delete using (auth.uid() = user_id);

create policy if not exists likes_select_own on public.likes
  for select using (auth.uid() = user_id);
create policy if not exists likes_write_own on public.likes
  for insert with check (auth.uid() = user_id);
create policy if not exists likes_delete_own on public.likes
  for delete using (auth.uid() = user_id);

create policy if not exists comments_public_read on public.comments
  for select using (true);
create policy if not exists comments_write_own on public.comments
  for insert with check (auth.uid() = user_id);
create policy if not exists comments_update_own on public.comments
  for update using (auth.uid() = user_id);
create policy if not exists comments_delete_own on public.comments
  for delete using (auth.uid() = user_id);

-- 4) Storage policies for covers (create a bucket named 'covers' in Storage)
create policy if not exists covers_public_read on storage.objects
for select using (bucket_id = 'covers');
create policy if not exists covers_admin_insert on storage.objects
for insert with check (bucket_id = 'covers' and exists (select 1 from public.admins where user_id = auth.uid()));
create policy if not exists covers_admin_delete on storage.objects
for delete using (bucket_id = 'covers' and exists (select 1 from public.admins where user_id = auth.uid()));

-- 5) Make YOUR account an admin (replace UUID below)
-- Find it in Authentication → Users → copy the "User ID" (UUID)
-- Then run just this line again anytime you want to add another admin.
insert into public.admins (user_id) values ('YOUR-UUID-HERE');
