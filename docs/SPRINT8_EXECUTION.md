# Sprint 8 — Execution & rollout status

## Status

Sprint 8 is implemented on `fob-8-sprint` as a progressive enhancement of the legacy vanilla-JS SPA.

## Visible product work

- Product hierarchy: UBF → Friends of Biodiversity → Green Card → FoB App → Citizen Science → Conservation Intelligence.
- Network narrative led by **Become part of Uganda's biodiversity intelligence network.**
- Citizen, institution and technical-buyer market paths.
- Student → Silver → Gold → Platinum → Diamond progression: Participate → Support → Engage → Partner → Lead.
- Conservation identity badges.
- Five recurring editorial/story formats.
- Uganda Biodiversity Pulse with live evidence metrics and interactive Year/Ecosystem/Species filtering.
- Accountability trust engine using published programme metrics with update date/source language.
- Conservation Intelligence product catalogue and institutional enquiry path.
- Green Card and Citizen Science feature workspace.
- Staff intelligence cockpit.

## Backend foundation

The live Supabase project contains the Sprint 8 domain tables/views and RLS foundation, including profiles, memberships, payment transactions, observation quality, institutions, institutional leads, data products, analytics and accountability metrics.

## Data integrity

The public UI does not fabricate missing impact metrics. Where UBF has not yet published a value, the UI shows an unreported state. Region and Threat remain planned Pulse dimensions until those fields are captured in the source data.

## Deployment

The intended release branch is `fob-8-sprint`. The PWA service worker cache is versioned so a new deployment invalidates the prior application shell. After deployment, perform a hard refresh (`Ctrl+Shift+R`) once so the updated worker can install and claim the page.

`main` remains the protected baseline for this sprint and has not been modified by this work.
