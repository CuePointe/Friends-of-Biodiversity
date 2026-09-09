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

Deploy from the `fob-8-sprint` branch. The service worker cache is bumped to `fob-app-v10` so updated HTML and the visible Sprint 8 module are fetched after activation.

Because this application uses a PWA service worker, an already-open browser tab may retain a previous controlled worker until it refreshes or the worker activates. A hard refresh or reopening the site after deployment forces the new application shell to be evaluated.

## Safety boundaries

The public observation feed should expose only records permitted by the database RLS policies. Commercial biodiversity intelligence should be generated from verified evidence rather than exposing sensitive species locations indiscriminately.

Payment revenue displayed by the staff cockpit is sourced from successful canonical ledger transactions only.
