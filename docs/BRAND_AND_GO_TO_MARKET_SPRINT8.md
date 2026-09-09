# Friends of Biodiversity — Sprint 8 rollout notes

The Sprint 8 branch is now a visible product release, not only a database foundation.

## User-facing capabilities

- Green Card membership workspace
- Citizen Science observation capture with GPS/evidence fields
- Verified biodiversity observation feed
- Biodiversity Intelligence product catalogue and structured institutional enquiries
- Staff intelligence cockpit for membership, revenue, observations, institutional pipeline, product orders and analytics

## Product story

**Join. Learn. Observe. Contribute. Protect.**

The new layer is additive to the existing SPA. It uses the live Supabase foundation while keeping the current application shell and business flows intact.

## Institutional proposition

Verified community-generated biodiversity evidence can support EIA, research, conservation planning and monitoring. Commercial delivery should be based on verified evidence and appropriate data controls.

## Deployment

The intended release branch is **`fob-8-sprint`**. The PWA service-worker cache has been bumped to `fob-app-v10` to invalidate the previous cached application shell.
