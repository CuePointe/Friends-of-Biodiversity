# Friends of Biodiversity — Uganda Biodiversity Fund 🌿

The **Green Card membership app** of the Uganda Biodiversity Fund (UBF): a
progressive web app (PWA) where members join, pay, learn, post, message each
other and follow UBF's conservation impact — and where UBF staff run the whole
programme from a built-in admin console.

**Live site:** served by GitHub Pages from the `main` branch of this repository.

---

## What the app does

### For visitors (marketing site)
- Hero slideshow, programme windows and themes
- **"What you're protecting"** conservation gallery (endangered species & places)
- Green Card tiers with linked species ("You help protect …")
- **How to Pay** — Stanbic / MTN MoMo / Airtel with step-by-step guides and an
  admin-editable "Where your money goes" impact panel
- Guided 5-step enrollment wizard with email verification (6-digit code)

### For members (full-screen app mode)
Signing in hides the marketing site and opens an app shell — compact header,
bottom tabs (**Home · Learn · Chats · Alerts · Profile**), compose button:
- **Home** — community digest feed (titles + authors, tap to open), sort,
  pinned posts, Sponsored campaign cards
- **Learn** — the Learning Exchange content library (grid/list)
- **Chats** — private member-to-member messages with unread badges
- **Alerts** — clickable notifications that deep-link to the exact item
- **Profile** — Green Card certificate & PDF receipt, impact badges,
  tier changes (with history), events & RSVP, fundraisers, interests,
  password, sign out
- Membership **renewals**: lapsed members get a banner + alert and renew in-app

### For admins (console)
Overview KPIs & revenue-by-tier, member approval & verification, renewals,
content library, Wall of Fame, announcements, financial reports, payment
details, conservation gallery, **ad campaigns with scheduling + view/click
metrics**, events, fundraisers & donation confirmation, audit log, password.
Open the in-app **📖 Admin Guide** panel for step-by-step instructions.

---

## Architecture

| Layer | Technology |
|---|---|
| Front end | Vanilla HTML/CSS/JS single-page app (`index.html`, `styles.css`, `app.js`) |
| Backend | [Supabase](https://supabase.com) — PostgreSQL, Realtime, Storage, Auth (email OTP) |
| Hosting | GitHub Pages (static, from `main`) |
| PWA | `manifest.json` + `sw.js` (network-first code, cache-first images) |

## Images — two systems (important)

1. **Repo image files** (this repository): hero slides (`slide-N.jpg` originals
   **and** `slideNsm.jpg` 900px mobile versions — keep both), logos, favicons.
   Upload via GitHub → *Add file → Upload files* (drag & drop, never "Create
   new file").
2. **Admin-panel uploads** (Supabase Storage): gallery photos/videos, payment
   logos, welcome media, post attachments, profile photos. No GitHub needed.

## Deploying changes

Upload changed files to the **`main` branch**, then hard-refresh
(Ctrl+Shift+R). The service worker fetches fresh HTML/CSS/JS on every load;
images may need one extra refresh after a cache-version bump.

## Repository layout

```
index.html      All markup: marketing site, app shell, admin console, modals
styles.css      Full design system (canopy green #0B2618 · gold #C8A84B)
app.js          All logic: views, feed, chats, admin, Supabase calls
sw.js           Service worker (offline cache)
manifest.json   PWA install metadata
llms.txt / robots.txt / sitemap.xml   SEO & AI discoverability
slide-*.jpg / slideNsm.jpg            Hero slideshow (desktop / mobile)
```

---

Maintained by the Uganda Biodiversity Fund ·
info@ugandabiodiversityfund.org · www.ugandabiodiversityfund.org
