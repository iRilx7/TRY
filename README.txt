
NovelHub — fixed + interactive
==============================

What changed
------------
1) **Auth works** (email/password). Buttons now call Supabase and show messages.
2) **Admin gate**: only users in `public.admins` can open admin.html. Others are redirected.
3) **CRUD**: Admin can create/update novels and chapters. Chapters list is interactive and loadable.
4) **Covers upload**: Upload to `covers/` bucket, auto-fills the public URL.
5) **Genre & author filters**: Home page shows author (click to filter) and a genre badge (click to filter).
6) **Reader**: Prev/Next, sticky ToC, better navigation.
7) **Admin link** appears only for real admins.
8) **Slugs**: auto-generated from title; novels `upsert` by slug.

Required DB change (adds genre)
-------------------------------
Run this one-time migration in Supabase SQL editor:

```sql
alter table public.novels add column if not exists genre text default 'General';
create index if not exists idx_novels_genre on public.novels(genre);
```

(Your existing RLS remains valid.)

Storage
-------
Create a **public** bucket named `covers` and you're done.

Where to put keys
-----------------
`js/supabaseClient.js` already contains your Project URL + anon key:
URL = https://pfjbwjpgwscolqiqtyxt.supabase.co
KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBmamJ3anBnd3Njb2xxaXF0eXh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0MTg5NDgsImV4cCI6MjA3MDk5NDk0OH0.D1H1O9E8pb_tzL4XXg_yC4yrbXwyuYwV5YEH-PXYVEo

Deploy
------
Drag these files to your static host (Netlify/Vercel/GitHub Pages). Make sure the domain is allowed in Supabase auth settings.

