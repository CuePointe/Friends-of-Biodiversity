# Friends of Biodiversity — Performance Budget

The current app is a large vanilla SPA, so performance work should reduce what the browser must parse, execute and download before the visitor can act.

## Initial budgets

| Metric | Target |
|---|---:|
| Largest Contentful Paint | ≤ 2.5 s on a mid-range mobile connection |
| Cumulative Layout Shift | ≤ 0.10 |
| First JavaScript payload | ≤ 180 KB compressed |
| Admin code on public page | 0 KB until needed |
| Heavy third-party libraries on first paint | 0 where avoidable |
| Hero image above-the-fold | responsive/mobile variant |
| API requests required for public first paint | ≤ 3 |

## Architecture sequence

### Now
- Keep the current PWA network-first code strategy.
- Cache stable image assets.
- Track LCP/layout shift with the isolated Sprint 8 runtime.
- Keep public content usable even when optional analytics fail.

### Next
Split the monolith into independently loaded modules:
- public marketing
- member experience
- admin console
- citizen-science map/data tools
- institutional/data-product tools

### Later
Move to route-level bundles if complexity continues to grow. The goal is not “rewrite in a framework”; the goal is to stop every visitor downloading and parsing functionality they are not using.

## Image rules

- Prefer responsive `sm` variants on mobile.
- Use explicit width/height where possible to reduce layout shift.
- Lazy-load below-the-fold images.
- Avoid preloading more than the true critical images.
- Use modern compressed formats when the hosting pipeline supports them.

## Data rules

- Do not query private/admin tables on public first paint.
- Prefer aggregate views for dashboard cards instead of downloading all rows.
- Paginate feeds, posts, events and observations.
- Never load the full citizen-science dataset merely to display a count.

## Deployment rule

Every performance change should be measured before and after. A faster hosting edge does not compensate for a browser that is still forced to download and execute a large application bundle.
