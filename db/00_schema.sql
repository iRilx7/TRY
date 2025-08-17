-- 00_schema.sql (Pro)
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
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$ begin new.updated_at = now(); return new; end $$;
drop trigger if exists trg_touch_novels on public.novels;
create trigger trg_touch_novels before update on public.novels
for each row execute function public.touch_updated_at();
drop trigger if exists trg_touch_chapters on public.chapters;
create trigger trg_touch_chapters before update on public.chapters
for each row execute function public.touch_updated_at();
