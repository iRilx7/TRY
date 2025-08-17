# NovelHub Pro — Webnovel site (GitHub Pages + Supabase) 🇺🇸/🇦🇪

**Features**
- Modern home (hero + Trending + Latest)
- Explore by tags, search, responsive cards
- Reader with TOC, next/prev, font size, dark mode
- Sync reading progress, bookmarks, likes, comments
- Profile (bookmarks & recent)
- Admin CMS (create/update novels, upload covers, add/edit/delete chapters)
- **DEMO Mode**: Works offline without Supabase for instant preview. When you add `js/config.js`, it automatically switches to Supabase.

## Quick Start
1) Upload the **`public/`** folder to GitHub (Pages).
2) It will open in **DEMO mode** (reads from `sample/sample.json`).
3) When ready for real persistence, create Supabase and run SQL in `/db`.
4) Copy `public/js/config.example.js` → `public/js/config.js` and paste your project URL + anon key.
