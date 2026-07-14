# Citizen Science — User Guide

**Friends of Biodiversity · Uganda Biodiversity Fund**

This feature turns every member into a field observer. Each wildlife sighting they log
becomes one row of open biodiversity data — and thousands of those rows become a dataset
that EIA consultancies, researchers and conservation NGOs can actually use. This guide
explains it for **members**, **administrators**, and **your target buyers**.

---

## 1. What it is, in one line

> Members photograph what they see in the wild → the app records the species, GPS location
> and date → those records plot on a map and export as a species list for any project site.

Nobody "logs in as a bird." A member **reports** an animal they saw. That report is the data.

---

## 2. For members — how to log a sighting

1. Open your **Profile** tab and find the green **🔬 Citizen Science** panel.
2. Tap **🔍 Log a sighting**.
3. **Add a photo** — the app opens your camera or gallery.
4. **Pick the species** — the options are drawn straight from the Conservation Gallery
   (so admins control the species list simply by managing that gallery).
5. The app **auto-fills** your GPS location, the date/time, and your name. You type nothing.
6. Add an optional note (e.g. *"two adults near the river"*) and tap **✓ Submit sighting**.

> **Location off?** If the phone can't share GPS, the sighting still saves — but it won't
> appear on the map until location is available. The screen tells the member this honestly.

### The reward — Citizen Scientist badge
- **1 sighting** → 🔭 *Observer* badge.
- **10 verified sightings** → 🔬 *Citizen Scientist* badge (shown on their profile).
- The progress bar in the Citizen Science panel shows how close they are.

Only **admin-verified** sightings count toward the badge — this keeps the data credible.

---

## 3. For members & admins — the Sightings map

Tap **🗺 Sightings map** in the Citizen Science panel.

- Every located sighting is a **coloured dot** (🔴 birds · 🟢 mammals · 🔵 amphibians).
- **Tap anywhere** on the map to drop a survey **pin**.
- Drag the **Radius** slider (1–50 km) to draw a circle around that pin.
- The info bar shows how many sightings and how many **distinct species** fall inside it.

The map is fully self-contained — it needs no external map service, so it loads instantly
and works even on a weak connection.

---

## 4. For admins — verifying sightings & selling the data

Go to **Admin → 🔬 Sightings & Data**.

- You'll see every logged sighting with its photo, species, location, member and date.
- Tap **✓ Verify** on genuine ones. Verified sightings power members' badges and make the
  dataset trustworthy. Use **Unverify** to reverse, **Delete** to remove spam.
- The summary strip shows totals: *logged · verified · mapped · distinct species*.

### Exporting an EIA data pack (the revenue step)
1. Open the **🗺 Sightings map** (from any profile — admins see the export button).
2. Tap the project site on the map to drop a pin; set the radius (e.g. 5 km).
3. Tap **⬇ Export species list near pin · EIA data pack**.
4. A **CSV** downloads containing every sighting in that radius:
   `species, lat, lng, observed_at, verified, logged_by, notes`.

That CSV is the product. Every export is recorded in the **Audit Log**.

---

## 5. How this serves your three audiences

| Audience | What they need | How the app delivers it |
|---|---|---|
| **EIA consultancies** | A legally-required list of species near a proposed dam, road or factory | Drop a pin on the site, set a radius, export the species list as a data pack |
| **Researchers** | Georeferenced, dated occurrence records to cite | The same table, filtered by species or area, exported to CSV |
| **Conservation NGOs** | Trends over seasons and hotspots | The map plus repeated exports show change over time |

---

## 6. Honest limits (say these to buyers)

- **The app does not auto-identify species.** The *member* picks the species from the
  gallery. Automatic photo-ID would need an AI model and funding — a later phase.
- **Value compounds with volume and time.** A handful of sightings isn't sellable; a few
  thousand across regions and seasons is. This is an asset you build, not day-one income.
- **Verification matters.** Only verified records should ever back a paid data pack.

---

## 7. Where the data lives

All sightings are stored in the Supabase table `public.sightings`:

| Column | Meaning |
|---|---|
| `species` | Species name (from the gallery) |
| `lat`, `lng` | GPS coordinates (nullable if location was off) |
| `observed_at` | When it was seen |
| `member_id`, `member_name` | Who logged it |
| `photo_url` | Uploaded photo |
| `notes` | Optional free text |
| `verified` | Admin-confirmed flag |

Nothing is ever deleted automatically — the record is the asset.
