# Sprint 8 Performance Budget

The existing Friends of Biodiversity SPA is intentionally preserved, so Sprint 8 uses an additive feature layer rather than a framework rewrite.

## Primary constraints

- Keep the existing app shell usable while new workflows are introduced.
- Load Sprint 8 features only as part of the app shell after the service worker update.
- Keep database/network work inside explicit user workflows or lightweight dashboard refreshes.
- Use lazy-loading for noncritical images.
- Do not cache Supabase API responses or third-party API traffic in the service worker.

## Visible Sprint 8 layer

`sprint8-ui.js` is a small, dependency-free enhancement module. It loads the product UI only after the main page is available and fetches products, species references and verified observation records when the user opens the Sprint 8 workspace.

The module provides Citizen Science capture, Biodiversity Intelligence enquiries, Green Card status and a staff-only operational cockpit. It does not replace the legacy `app.js` navigation or global data loaders.

## PWA cache

The service worker cache is versioned (`fob-app-v10`) so feature-layer changes invalidate the prior app shell. HTML is transformed at the service-worker boundary to include the Sprint 8 runtime, Auth bridge and UI module when the source page has not already included them.
