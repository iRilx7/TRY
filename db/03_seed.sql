-- 03_seed.sql
-- Optional sample data

insert into public.novels (slug, title, author, description, cover_url)
values ('demo-novel','Demo Novel','System','A short demonstration novel.',
        'https://picsum.photos/seed/novel/400/600')
on conflict (slug) do nothing;

insert into public.chapters (novel_id, index_in_novel, title, content)
select id, 1, 'Chapter 1', '<p>Welcome to Chapter 1. This is demo content.</p>'
from public.novels where slug = 'demo-novel'
on conflict do nothing;

insert into public.chapters (novel_id, index_in_novel, title, content)
select id, 2, 'Chapter 2', '<p>Welcome to Chapter 2. Keep reading!</p>'
from public.novels where slug = 'demo-novel'
on conflict do nothing;
