# Friends of Biodiversity — Uganda Biodiversity Fund

A membership & community platform for the **Uganda Biodiversity Fund (UBF)**
"Friends of Biodiversity" Green Card programme — connecting individuals and
institutions that support the protection of Uganda's ecosystems *for now and the
future*.

The app is a fast, installable **Progressive Web App** built with vanilla
HTML / CSS / JavaScript and backed by **Supabase** (PostgreSQL, Realtime,
Storage). No build step, no framework — just static files served over HTTPS.

---

## ✨ Key Features

### Public site
- Hero slideshow of real UBF conservation photography
- Strategic framework: thematic areas & programme windows
- **Green Card membership tiers** (Student → Silver → Gold → Platinum → Diamond)
  with custom nature-progression icons
- **How to Pay** — branded Bank / MTN Mobile Money / Airtel Money options
- Wall of Fame, public announcements, impact statistics
- Searchable Learning Exchange resource library

### Membership
- Online enrollment with a **pending-approval workflow** (admins activate new
  members after verifying payment)
- Login with rate-limiting (lockout after repeated failed attempts) and
  persistent sessions
- **Member dashboard**: tier benefits, unlocked resources, announcements,
  financial reports
- **Digital Green Card certificate** — with the Executive Director's signature,
  an official seal, and date of issue
- Editable profile: avatar, cover wallpaper, bio

### Community (LinkedIn-style)
- **Member posts** with a large composer and a Photo / Video / Document toolbar
- Reactions, comments, and an admin moderation view
- **Discover Members** — a search bar (by member or institution) with Follow
  buttons, ranked by influence (followers)
- Rich member profiles showing contributions, tier, "member since", and bio —
  so members can appreciate a profile before following

### Admin Control Panel
- Member management: search, tier/status filters, pagination, approve & remove
- Content library, Wall of Fame, announcements, financial reports
- Payment details, email-campaign log, slideshow management
- Confirmation prompts on all destructive actions

### Platform
- **Installable PWA** (Android "Add to Home Screen", standalone display,
  full icon set, service worker, offline shell)
- Fully responsive / mobile-first layout
- Realtime sync across all users via Supabase channels
- XSS hardening (HTML escaping + DOMPurify) on all user-generated content

---

## 📁 Project Structure

```
/
├── index.html        ← Single-page application markup
├── styles.css        ← All styles
├── app.js            ← All application logic (Supabase data layer + UI)
├── sw.js             ← Service worker (PWA offline shell)
├── manifest.json     ← PWA manifest (icons, name, theme)
├── SETUP.sql         ← Database schema reference
├── ubf-logo.png / fob-logo.png   ← Brand logos
├── icon-*.png        ← PWA app icons (72 → 512, incl. maskable)
├── favicon*.png
├── slide-1.jpg … slide-17.jpg    ← Hero slideshow imagery
└── README.md         ← This file
```

---

## 🗄️ Backend (Supabase)

The app talks directly to Supabase from the browser using the public anon key.
Core tables:

| Table | Purpose |
|---|---|
| `members` | Member & admin accounts, tier, status, profile (photo, wallpaper, bio, followers) |
| `content` | Learning Exchange resources (+ reactions, comments) |
| `member_posts` | Community posts (text, image, video, document) |
| `post_comments` | Comments on community posts |
| `follows` | Member follow relationships |
| `announcements` | UBF announcements |
| `fin_reports` | Financial / impact reports |
| `wall_of_fame` | Conservation champions |
| `payment_details` | Public bank & Mobile Money details |

**Storage buckets:** `content-files`, `fame-photos` (profile photos, wallpapers,
post media & documents).

The full schema lives in [`SETUP.sql`](./SETUP.sql).

---

## 🚀 Deployment

The app is a static site — deployment is simply publishing the files.

### GitHub Pages
1. Push all files to the repository root (keep the flat structure above).
2. **Settings → Pages → Source:** branch `main`, folder `/ (root)`.
3. Live within a minute at `https://<org>.github.io/<repo>/`.

### Custom domain + Cloudflare (recommended)
1. Add the domain to Cloudflare; point nameservers as instructed.
2. DNS: `CNAME www → <org>.github.io` (proxied / orange-cloud on).
3. GitHub **Settings → Pages → Custom domain:** `www.ugandabiodiversityfund.org`,
   then enable **Enforce HTTPS**.
4. Cloudflare caches and accelerates all static assets automatically.

> **Updating the app:** edit `index.html`, `styles.css`, or `app.js` and commit.
> Supabase schema changes are made in the Supabase dashboard (SQL Editor).

---

## 🔐 Security Roadmap

The platform is functional and live. The following hardening work is planned and
should be completed as a priority:

- **Password hashing** (bcrypt) and login via a secure database function
- **Tighter Row-Level-Security policies** so members can only edit their own
  records and only admins can modify content, payments, and reports
- Restricting public bucket file-listing

> Contributors: do **not** commit Supabase service-role keys or any secrets to
> this repository. Only the public anon key belongs in client code.

---

## 🎨 Brand

- **Uganda Biodiversity Fund** — *For now & the future*
- **Friends of Biodiversity** — *Demonstrating care for Uganda's biodiversity*
- Palette: canopy greens, gold, and tier accent colours (see CSS custom
  properties at the top of `styles.css`).

---

## 👤 Author & Maintainer

**Thomas Otieno** — Data Scientist & SEO Digital Marketer
Design, development, and platform engineering of the Friends of Biodiversity app.

## 📬 Contact

- Technical / codebase: **thomasotieno583@gmail.com**
- General enquiries: **info@ugandabiodiversityfund.org**
- Web: [www.ugandabiodiversityfund.org](https://www.ugandabiodiversityfund.org)

---

© 2026 Uganda Biodiversity Fund. All rights reserved.
