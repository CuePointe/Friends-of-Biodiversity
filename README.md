# Friends of Biodiversity — Uganda Biodiversity Fund

Web application for the UBF Green Card membership programme. Built as a static
site for GitHub Pages, ready for Cloudflare in front and Supabase as the backend.

## File Structure

```
/
├── index.html              ← Main application (single page app)
├── assets/
│   ├── styles.css           ← All styles
│   ├── app.js                ← All application logic & data
│   ├── logos/
│   │   ├── ubf-logo.png       ← Uganda Biodiversity Fund logo ("For now & the future")
│   │   └── fob-logo.png       ← Friends of Biodiversity logo ("Demonstrating care...")
│   └── images/
│       ├── slide-1.jpg … slide-13.jpg  ← Hero slideshow (real UBF/conservation photos)
└── README.md                ← This file
```

## Deploying to GitHub Pages (today)

1. Create a new repository (e.g. `friends-of-biodiversity`).
2. Upload all files **preserving the folder structure above** — the
   `assets/` folder must sit alongside `index.html`.
3. Go to Settings → Pages → Source: select branch `main`, folder `/ (root)`.
4. Your site will be live at `https://<your-org>.github.io/friends-of-biodiversity/`
   within a minute or two.
5. Point your custom domain (e.g. `www.ugandabiodiversityfund.org`) at GitHub
   Pages via a CNAME record, then add a `CNAME` file to the repo root containing
   your domain — or proceed straight to Cloudflare (next section).

## Connecting Cloudflare (for speed / custom domain)

1. Add your domain to Cloudflare and update your domain's nameservers as
   Cloudflare instructs.
2. Create a CNAME DNS record: `www` → `<your-org>.github.io`, proxied (orange cloud) ON.
3. In GitHub repo Settings → Pages, set your custom domain to `www.ugandabiodiversityfund.org`
   and enable "Enforce HTTPS".
4. Cloudflare will now cache and accelerate all static assets (images, CSS, JS)
   automatically — no extra configuration needed for this app.

## Current Data Mode: Browser localStorage (Demo/Launch Mode)

Right now, **all data — members, content, announcements, Wall of Fame, financial
reports, payment details — is stored in each visitor's own browser** via
`localStorage`. This means:

- ✅ The app is **fully functional today** — admins can log in, upload content,
  post announcements, add Wall of Fame champions, and update payment details.
- ✅ Members can register, sign in, view their dashboard, and download certificates.
- ⚠️ **Data does not sync across devices or browsers.** If the Executive Director
  adds an announcement on their laptop, a member on their phone will not see it
  until the same action is repeated on a Supabase-backed version.
- ⚠️ Clearing browser data/cache will reset the local copy of the app's data.

This mode is intentional for **immediate launch** — you can demo the full app,
onboard your team, and start collecting real member sign-ups in the browser
right now while Supabase is connected in parallel.

## Migrating to Supabase (next step — for real multi-user data)

Every place that needs to change is marked with `[SUPABASE]` comments inside
`assets/app.js`. In summary:

1. **Create a Supabase project** at supabase.com (free tier supports up to
   50,000 monthly active users).
2. **Create these tables** (SQL Editor in Supabase dashboard):

```sql
create table members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text unique not null,
  type text, tier text, amount bigint, year int,
  org text, engage text, payref text, tel text,
  role text default 'member', status text default 'active',
  created_at timestamp default now()
);

create table content (
  id uuid primary key default gen_random_uuid(),
  title text, type text, window_name text, theme text,
  desc text, author text, access text default 'member',
  url text, file_path text,
  reactions jsonb default '{"likes":0,"bookmarks":0}',
  created_at timestamp default now()
);

create table comments (
  id uuid primary key default gen_random_uuid(),
  content_id uuid references content(id),
  user_name text, text text, created_at timestamp default now()
);

create table announcements (
  id uuid primary key default gen_random_uuid(),
  type text, title text, body text, created_at timestamp default now()
);

create table fin_reports (
  id uuid primary key default gen_random_uuid(),
  title text, period text, summary text, url text,
  created_at timestamp default now()
);

create table wall_of_fame (
  id uuid primary key default gen_random_uuid(),
  name text, caption text, tier text, year int, photo_url text
);

create table payment_details (
  id int primary key default 1,
  bank text, accno text, branch text, swift text, mtn text, airtel text
);
```

3. **Enable Supabase Auth** (Email/Password provider).
4. **Set up Row Level Security (RLS)** so:
   - Anyone can `SELECT` from `content` where `access='public'`.
   - Authenticated members can `SELECT` content up to their tier rank.
   - Only emails ending in `@ugandabiodiversityfund.org` AND with `role='admin'`
     in `members` can `INSERT`/`UPDATE`/`DELETE` on `content`, `announcements`,
     `wall_of_fame`, `fin_reports`, `payment_details`.
5. **Create Storage buckets**: `content-files`, `fame-photos`, `slides` (all public-read).
6. **Add the Supabase JS client** to `index.html`:
   ```html
   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
   ```
   Initialise near the top of `app.js`:
   ```js
   const supabase = window.supabase.createClient(
     'https://YOUR_PROJECT.supabase.co',
     'YOUR_ANON_PUBLIC_KEY'
   );
   ```
7. Replace each `LS.get(...)` / `LS.set(...)` pair (marked `[SUPABASE]`) with the
   corresponding `supabase.from('table').select()/.insert()/.update()/.delete()`
   calls. The HTML/CSS does not need to change — only the data layer in `app.js`.

## Admin Team Accounts

The following UBF staff emails are pre-authorised for the Admin Control Panel.
Each is seeded automatically on first run with the **default password
`UBF@2026!`** — change this immediately after first login by editing the member
record (or, once Supabase Auth is connected, use the password-reset flow).

| Role | Email |
|---|---|
| Executive Director | i.amani@ugandabiodiversityfund.org |
| Projects Officer | o.atuhaire@ugandabiodiversityfund.org |
| Office Assistant | t.otieno@ugandabiodiversityfund.org |
| Programs Officer | p.musiime@ugandabiodiversityfund.org |
| M&E Officer | d.okullu@ugandabiodiversityfund.org |

Admin sign-in is at the "Sign In / Join" button → "Admin sign in" link. The
system rejects any email that does not end in `@ugandabiodiversityfund.org`
and is not on the authorised list above.

## What Admins Can Do Today (no waiting on Supabase)

- **Members tab**: view all registered members, export to CSV for your records/banking.
- **Content Library**: upload videos, documentaries, podcasts, interviews,
  articles, research — tagged by programme window, thematic area, and access
  tier (Members/Gold+/Platinum+/Public).
- **Wall of Fame**: add real conservation champions with photo + caption + tier
  + year — no placeholders, only what you add.
- **Announcements**: post project updates, events, alerts — optionally trigger
  an email-notification log entry.
- **Financial Reports**: publish quarterly/annual reports with links to your
  audited PDF documents (host PDFs on Google Drive and paste the link).
- **Payment Details**: enter your real bank account and Mobile Money (MTN/Airtel)
  numbers — these immediately appear on the public "How to Pay" section.
- **Email Campaigns**: compose and log campaigns by audience tier (actual
  delivery requires connecting an email provider via Supabase Edge Function —
  see migration guide).
- **Slide Images**: add additional hero slideshow images for the current session.

## Adding Permanent Slide Images

The 13 images currently in `assets/images/slide-1.jpg` … `slide-13.jpg` are
from your uploaded photos. To add more permanently:

1. Add new image files to `assets/images/` (e.g. `slide-14.jpg`).
2. Open `assets/app.js`, find the line:
   ```js
   const SLIDE_IMAGES=Array.from({length:13},(_,i)=>`assets/images/slide-${i+1}.jpg`);
   ```
3. Change `13` to your new total count.
4. Commit and push — the new images appear in the rotation automatically.

## Content Types in Learning Exchange

Per your instruction, "PDF" was removed as a content **type** (it's a file
format, not a content category). The five content types are:

- **Video**
- **Documentary**
- **Podcast**
- **Interview**
- **Article**
- **Research**

Any of these can be delivered as a video file, audio file, document (including
PDF), or external link (YouTube/Vimeo/Drive) — the upload form has both a file
picker and a URL field.

## Support

For technical questions about this codebase: t.otieno@ugandabiodiversityfund.org
General enquiries: info@ugandabiodiversityfund.org
