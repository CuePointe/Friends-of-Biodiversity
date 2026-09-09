# Sprint 8 Execution

Sprint 8 turns the Friends of Biodiversity application from a legacy membership/community SPA into a product layer with visible biodiversity participation and institutional intelligence capabilities.

## Visible application layer

`./sprint8-ui.js` is loaded through the service worker and exposes:

- Green Card membership snapshot
- Citizen Science observation capture with GPS, evidence notes and verification status
- Verified biodiversity observation feed
- Biodiversity Intelligence product catalogue
- Institutional product enquiry capture
- Staff intelligence cockpit with membership, revenue, observations, institutional pipeline, data-product orders and analytics counters

The layer is intentionally additive so the existing `app.js` remains functional while the new workflows are progressively adopted.

## Database foundation

The live Supabase project now contains the Sprint 8 foundation for profiles/RBAC, memberships, payment transactions, audit logging, species references, observation quality, institutions and leads, biodiversity intelligence products/orders, analytics events and accountability metrics.

## Deployment

Deploy from the configured hosting branch **`fob-8-sprint`** for this Sprint 8 release. The service worker cache is bumped to `fob-app-v10` so updated HTML and the visible Sprint 8 module are fetched after activation.

Because this application uses a PWA service worker, an already-open browser tab may retain a previous controlled worker until the worker activates. Reopen the site or hard-refresh (Ctrl+Shift+R) after deployment so the new app shell is evaluated.

## Safety boundaries

The public observation feed exposes only verified records. Commercial biodiversity intelligence should be generated from verified evidence rather than exposing sensitive species locations indiscriminately.

Payment figures in the staff cockpit are sourced from successful canonical ledger transactions only.
