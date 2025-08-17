# NovelHub — Static Webnovel Site (GitHub Pages + Supabase)

A modern, mobile-first reader like Webnovel/NovelBin, powered by **static HTML/CSS/JS** and **Supabase** (Auth + Postgres + Storage).  
- **Readers:** no account needed to read. Log in to sync progress, bookmarks, likes, and comments across devices.
- **Admin:** upload/edit novels & chapters from a client-only **Admin** page. No server to run.

> This repo is safe to be public. You only use the **anon (public) key** and enforce security via **Row-Level Security (RLS)** policies.

---

## 1) Supabase Setup (once)

1. Create a project at https://supabase.com → copy your **Project URL** and **anon public key**.
2. Go to SQL Editor → run the files in `/db` in order:
   - `00_schema.sql`
   - `01_policies.sql`
   - `02_storage_policies.sql`
   - (Optional) `03_seed.sql` to add a demo novel and two chapters.
3. **Auth** → (optional) set **Allow new users to sign up** = Off (invite-only) or restrict domain. You can invite yourself from the dashboard.
4. **Find your Auth User UUID** (Auth → Users) and add it to the `admins` table:
   ```sql
   insert into public.admins (user_id) values ('YOUR-AUTH-USER-UUID');
   ```
5. **Storage**: Create a bucket named `covers`.

---

## 2) Configure the frontend

Copy `public/js/config.example.js` → `public/js/config.js` and fill in:

```js
export const SUPABASE_URL = "https://YOUR-PROJECT.supabase.co";
export const SUPABASE_ANON_KEY = "YOUR-ANON-PUBLIC-KEY";
```

> It’s normal to commit `config.js` with the anon key in a public repo. RLS keeps writes locked to admins only.

---

## 3) Deploy to GitHub Pages

- Put the **contents of `public/`** at your repo root (or point Pages to `/public`).
- Enable GitHub Pages for the repo.
- Visit: `https://your-username.github.io/your-repo/`

Pages:
- `/index.html` — Library, search, continue-reading
- `/reader.html?novel=slug&ch=1` — Reader
- `/auth.html` — Login/Signup
- `/admin.html` — Admin dashboard (works only for users in `admins`)

---

## 4) Features

- Public reading without login
- Email/password auth (Supabase Auth)
- Save reading progress (chapter + scroll %) per user per novel
- Bookmarks & likes per chapter
- Comments per chapter
- “Continue reading” card on home
- Chapter navigation (Prev/Next)
- Table of Contents (auto)
- Dark mode, font size controls
- Mobile-first responsive design
- Admin can:
  - create/update novels (title/slug/author/description/cover)
  - upload cover image to Supabase Storage
  - add chapters (index, title, content)
  - edit or delete chapters

---

## 5) Security Notes

- Only **admins** (by `auth.uid()` in `public.admins`) can write novels/chapters/covers.
- Readers can write **only their own** progress/bookmarks/likes/comments.
- Never expose the **service role key** in the browser (we don’t).

---

## 6) Customize

- Branding: edit `public/styles.css` and headers.
- SEO: change meta tags in HTML files.
- If chapters are huge, store content in Storage instead of table text. You can add a `storage_path` column and fetch via signed/public URLs.

Enjoy!
