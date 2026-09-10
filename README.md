# Friends of Biodiversity — Uganda Biodiversity Fund 🌿

The **Green Card membership app** of the Uganda Biodiversity Fund (UBF): a
progressive web app (PWA) where members join, pay, learn, post, message each
other and follow UBF's conservation impact — and where UBF staff run the whole
programme from a built-in admin console.

**Live site:** served by the configured deployment from `fob-8-sprint` for the Sprint 8 release.

## Sprint 8 product architecture

**UBF** — the institution → **Friends of Biodiversity** — the membership movement → **Green Card** — your membership → **FoB App** — your digital relationship → **Citizen Science** — your opportunity to contribute biodiversity intelligence → **Conservation Intelligence** — the institutional data product.

Lead message: **Become part of Uganda's biodiversity intelligence network.**

The member journey is designed as: **Care → Join → Learn → Observe → Contribute evidence → UBF verifies → Better biodiversity understanding → Better institutional information → Better conservation decisions.**

The platform deliberately serves three markets: **Citizens** (Protect what you love), **Institutions** (Put biodiversity into practice), and **Technical buyers** (Better biodiversity evidence for better decisions).

## What the app does

### For visitors (marketing site)
- Hero slideshow, programme windows and themes
- **"What you're protecting"** conservation gallery
- Green Card tiers with linked conservation propositions
- How to Pay — Stanbic / MTN MoMo / Airtel
- Guided enrollment wizard with email verification
- Sprint 8 product hierarchy, market pathways, tier progression, badges, storytelling formats, Uganda Biodiversity Pulse and accountability trust engine

### For members
- Home, learning, chats, alerts and profile app shell
- Green Card membership and renewal experience
- Citizen Science observation workflow
- Conservation identity badges
- Sprint 8 feature workspace for observations, intelligence products and membership

### For institutions and technical buyers
- Institutional partnership pathway
- Conservation Intelligence catalogue
- Structured intelligence enquiries
- Data-pack, research and monitoring positioning

### For admins
- Overview KPIs & revenue-by-tier
- Member approval & verification
- Renewals, content, Wall of Fame, announcements and reports
- Payment details, conservation gallery, ads, events and fundraisers
- Audit log
- Sprint 8 growth/intelligence cockpit

## Architecture

| Layer | Technology |
|---|---|
| Front end | Vanilla HTML/CSS/JS single-page app (`index.html`, `styles.css`, `app.js`) |
| Backend | Supabase — PostgreSQL, Realtime, Storage, Auth |
| Hosting | Configured deployment target using `fob-8-sprint` for Sprint 8 |
| PWA | `manifest.json` + `sw.js` with versioned network-first code cache |

## Deployment

Deploy from **`fob-8-sprint`**. The Sprint 8 service worker cache is now `fob-app-v12` and injects the runtime, Auth bridge, visible feature layer, strategic product layer and interactive Pulse filter layer. After the deployment updates, hard-refresh once (`Ctrl+Shift+R`) so the new worker can install.

## Data integrity

Public impact metrics are rendered from published UBF programme records. Missing figures remain unreported rather than being invented. Uganda Biodiversity Pulse uses live biodiversity evidence where available; Region and Threat are shown as planned dimensions until those fields are populated in the source data.

## Repository layout

```
index.html
styles.css
app.js
sw.js
manifest.json
sprint8-runtime.js
sprint8-auth-profile.js
sprint8-ui.js
sprint8-strategy.js
sprint8-pulse-filters.js
supabase/migrations/*
docs/*
```

---

Maintained by the Uganda Biodiversity Fund · info@ugandabiodiversityfund.org · www.ugandabiodiversityfund.org
