# FR Tutor — Pre-Deploy Checklist

## 1. Supabase Database

| Item | Status | Action |
|------|--------|--------|
| Full migration file | ✅ ready | `supabase/migrations/001_init.sql` — all 4 tables + RLS + indexes |
| `progress` table | ❌ manual | Run 001_init.sql in Supabase SQL Editor. If table already exists from dev, add FSRS columns: `ALTER TABLE progress ADD COLUMN IF NOT EXISTS s float8, ADD COLUMN IF NOT EXISTS d float8, ADD COLUMN IF NOT EXISTS r float8, ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();` |
| `listening_attempts` table | ❌ manual | Created by 001_init.sql |
| `gender_quiz_attempts` table | ❌ manual | Created by 001_init.sql |
| `sentence_attempts` table | ❌ manual | Created by 001_init.sql |
| RLS policies | ✅ ready | Included in migration — own-row + class aggregate read |
| Indexes | ✅ ready | Included in migration — user_id, (user_id, card_id), (user_id, course, unit), last_seen_at |

**Action:** Open Supabase SQL Editor → paste contents of `supabase/migrations/001_init.sql` → Run.

---

## 2. Environment Variables

The app needs exactly **2** env vars:

| Variable | Where | Status |
|----------|-------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Netlify env vars | ❌ set in Netlify dashboard |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Netlify env vars | ❌ set in Netlify dashboard |

- `.env.local.example` exists: ✅
- No server-only secrets needed (no `SUPABASE_SERVICE_ROLE_KEY` used)
- No API keys for audio (uses browser SpeechSynthesis)
- No other env vars referenced in codebase

**Action:** Netlify → Site settings → Environment variables → Add both values from Supabase dashboard (Settings → API).

---

## 3. Auth Callback / Redirect URLs

| Item | Status | Notes |
|------|--------|-------|
| Login redirect URL | ✅ safe | Uses `window.location.origin` — dynamic, not hardcoded |
| Auth callback route | ✅ safe | Uses `request.url` origin — dynamic |
| Supabase redirect allowlist | ❌ manual | Must add production URL |

**Action:** Supabase dashboard → Authentication → URL Configuration → Redirect URLs → Add:
```
https://YOUR-SITE.netlify.app/auth/callback
```
(and any custom domain if configured)

---

## 4. Audio Source

| Item | Status | Notes |
|------|--------|-------|
| Audio engine | ✅ ready | Browser `SpeechSynthesis` API (Web Speech API) |
| API keys needed | ✅ none | Zero external dependencies |
| Slow mode | ✅ ready | `rate: 0.5` controlled via localStorage setting |
| French voice | ✅ ready | `useAudioPlayer` hook finds `fr-FR` or `fr` voice |

No action needed — audio works entirely client-side.

---

## 5. PWA (manifest + service worker)

| Item | Status | Notes |
|------|--------|-------|
| `manifest.json` start_url | ✅ `/` | Relative path, works on any domain |
| `manifest.json` scope | ✅ implicit | Not set = defaults to `/`, correct for root deploy |
| `manifest.json` icons | ✅ ready | 192px, 512px, maskable-512px in `/icons/` |
| `sw.js` | ✅ ready | No hardcoded URLs, all paths relative |
| `offline.html` | ✅ ready | Static fallback page |
| SW registration | ✅ ready | Production-only (`NODE_ENV` check) |
| Install prompt | ✅ ready | After 3 visits, dismissable 7 days |
| Cache headers | ✅ ready | `netlify.toml` sets no-cache for sw.js and manifest.json |

No action needed.

---

## 6. Netlify Config

| Item | Status | Notes |
|------|--------|-------|
| `netlify.toml` exists | ✅ ready | Build command, publish dir, plugin |
| Build command | ✅ `npm run build` | |
| Publish dir | ✅ `.next` | Netlify plugin handles it |
| Next.js plugin | ✅ `@netlify/plugin-nextjs` | Auto-installed by Netlify |
| Node version | ✅ 18 | Set in `[build.environment]` |
| SW/manifest cache headers | ✅ ready | must-revalidate for both |

No action needed — config is complete.

---

## 7. next.config.mjs

| Item | Status | Notes |
|------|--------|-------|
| Output mode | ✅ default | No `output: "export"` — SSR works on Netlify |
| Image domains | ✅ N/A | No external images used (all SVG) |
| Hardcoded URLs | ✅ none | Empty config `{}` |
| Redirects/rewrites | ✅ N/A | None needed |

No action needed.

---

## 8. CORS / Security

| Item | Status | Notes |
|------|--------|-------|
| Hardcoded origins | ✅ none | All URLs use `window.location.origin` or `request.url` |
| Supabase CORS | ✅ auto | Supabase handles CORS for its own API |
| API routes | ✅ safe | Only `/auth/callback` — uses server-side Supabase client |
| RLS enabled | ✅ all tables | Every table has row-level security |

No action needed.

---

## 9. Localhost References

| File | Line | Context | Risk |
|------|------|---------|------|
| `README.md:55` | `http://localhost:3000/auth/callback` | Setup docs only | ✅ none — docs, not code |
| `README.md:64` | `http://localhost:3000` | Dev instructions | ✅ none — docs, not code |

**Zero localhost references in application code.** Only in README developer docs.

---

## Deploy Checklist (in order)

### Before connecting to Netlify:
- [ ] Run `supabase/migrations/001_init.sql` in Supabase SQL Editor
- [ ] If progress table already exists: run the `ALTER TABLE` command from item 1
- [ ] Add production callback URL in Supabase Auth settings

### In Netlify:
- [ ] Connect repo to Netlify (Import from GitHub)
- [ ] Set env vars: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Deploy — build should complete with 20 pages
- [ ] Note the `.netlify.app` URL

### After first deploy:
- [ ] Add the `.netlify.app` URL to Supabase redirect URLs
- [ ] Open site on phone — test magic link login
- [ ] Check PWA install prompt appears after 3 visits
- [ ] Verify audio plays (French TTS)
- [ ] Check /progress, /class, /practice routes load

### Optional (custom domain):
- [ ] Add custom domain in Netlify
- [ ] Add custom domain callback URL in Supabase redirect URLs
- [ ] Update `CNAME` / DNS records
