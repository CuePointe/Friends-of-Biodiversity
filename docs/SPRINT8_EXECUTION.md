# Friends of Biodiversity — Sprint 8 Execution Blueprint

Branch: `fob-8-sprint`

This sprint converts the platform from a feature-rich NGO web app into a safer digital conservation platform with a measurable membership engine, citizen-science evidence layer, institutional pipeline and biodiversity-intelligence product path.

## The eight workstreams

### 1. Security foundation — P0
- Supabase Auth becomes the identity authority.
- `members.auth_user_id` bridges legacy member records to authenticated users.
- New role model: member, moderator, verifier, finance, communications, admin, super_admin.
- Sensitive operational tables use role-aware RLS rather than public CRUD.
- Passwords are not migrated into the new schema; the existing legacy `members.pass` field stays only during transition and must be removed after the frontend auth cutover.
- Every sensitive operational change should emit an `audit_log` record.
- Storage upload policies should be made staff/member scoped in the same release as the auth cutover.

### 2. Database / domain redesign — P0
The new schema separates identity, membership, payment, evidence, institutions and commercial products:

`profiles → memberships → payment_transactions`

`species → sightings → observation_quality`

`institutions → institution_leads`

`data_products → data_product_orders`

The existing all-in-one tables remain compatible during transition. New code should target the normalized tables first.

### 3. Membership + revenue analytics — P0
The canonical revenue source is `payment_transactions` where `status = 'successful'`.

Tracked funnel events:
- `membership_cta_view`
- `membership_start`
- `membership_submit`
- `membership_payment_success`
- `sighting_submit`
- `institution_lead`
- `data_product_enquiry`

Reporting views include:
- `membership_revenue_summary`
- `revenue_by_tier`
- `growth_funnel_summary`
- `biodiversity_pulse`

Recommended weekly dashboard:
- membership starts
- approval rate
- payment success rate
- paying members
- revenue UGX
- average transaction value
- renewal rate
- referral contribution
- active citizen scientists
- verified observations
- institutional pipeline value
- data-product enquiries

### 4. Citizen-science data quality — P0
The app already collects species, location, time, photo and notes. Sprint 8 adds an evidence-quality layer so only trustworthy records become institutional products.

Quality dimensions:
- photo quality: 15%
- GPS precision: 15%
- observer history/reliability: 15%
- duplicate risk: 10%
- verification state: 30%
- record completeness: 15%

Bands:
- High: 85–100
- Medium: 65–84.99
- Low: below 65

Commercial rule: paid biodiversity intelligence should preferentially use verified, high-confidence records and disclose the quality methodology.

### 5. Biodiversity Intelligence MVP — P1
Start with three products:

**Biodiversity Snapshot**
A decision-friendly summary for a defined place/time period.

**Biodiversity Intelligence Pack**
Verified georeferenced occurrences, CSV, maps and methodology for EIA, research and conservation use.

**Monitoring Partnership**
Recurring collection, verification and reporting for a landscape, project or institution.

Do not market this as a raw-data marketplace. The value proposition is verified evidence + context + quality + interpretation.

### 6. Brand/story hierarchy — P1
Use one clear ladder:

`UBF` = institution

`Friends of Biodiversity` = movement / membership programme

`Green Card` = membership identity

`FoB App` = digital relationship layer

`Citizen Science` = participation mechanism

`Biodiversity Intelligence` = institutional data/service layer

Primary public story:

> **Join. Learn. Observe. Contribute. Protect.**

Supporting idea:

> One membership. Five fronts. A whole country’s biodiversity.

Public acquisition should lead with identity and participation, not with a technical data pitch. Institutional buyers should see the evidence/data value after trust and capability are established.

### 7. Institutional growth funnel — P1
Segment the pipeline by buyer type:
- EIA consultancies
- conservation NGOs
- universities / researchers
- corporations / CSR teams
- schools / universities
- government / public programmes
- donors / strategic partners

Track each opportunity through:
`new → qualified → meeting → proposal → negotiation → won/lost → nurture`

Every opportunity should have an estimated value, probability and next action date. This makes the platform a business-development system instead of a contact list.

### 8. Performance architecture — P0/P1
Current architecture is a very large vanilla SPA. Sprint 8 avoids a risky rewrite and establishes migration seams first.

Immediate rules:
- keep non-critical functionality out of the first paint
- lazy-load future admin/data-product modules
- keep third-party libraries off the critical path where possible
- use responsive/mobile image variants
- maintain network-first code fetching in the PWA service worker
- cache stable image assets aggressively
- observe LCP/layout shift in the runtime
- split the application logically over time into public, member and admin routes

Target architecture:
`/` public acquisition
`/app` member relationship layer
`/admin` operational console
`/data` biodiversity intelligence

## Safe rollout order

1. Review migrations.
2. Create/verify Supabase Auth users and `profiles` records.
3. Populate `members.auth_user_id` bridge records.
4. Migrate login/session code from legacy password checks to Supabase Auth.
5. Switch payment writes to `payment_transactions` and trusted verification/webhooks.
6. Add observation-quality scoring + verifier workflow.
7. Turn on institutional pipeline and data-product enquiry flows.
8. Add the analytics events to the relevant UI actions.
9. Remove legacy password storage only after the authentication cutover is verified.
10. Review performance budgets and then split the SPA by route/module.

## Definition of done

The sprint is considered production-ready when:
- no application password is stored in the public database schema;
- members can only access their own private records;
- staff capabilities are role-scoped;
- payment success is backed by a trusted transaction record;
- audit events exist for sensitive actions;
- observation quality is measurable and reviewable;
- revenue and acquisition funnels are queryable;
- institutional opportunities have owners and next actions;
- data-product orders can be scoped and fulfilled;
- public messaging clearly distinguishes UBF, Friends of Biodiversity, Green Card and Biodiversity Intelligence;
- the first paint is not blocked by admin functionality or unnecessary heavy code.

## Branch safety

This sprint is being built only on `fob-8-sprint`. `main` has not been modified by these changes. Merge should happen only after review, testing and the Supabase migration/auth cutover are validated.
