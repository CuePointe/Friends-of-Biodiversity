-- FRIENDS OF BIODIVERSITY — SPRINT 8 ANALYTICS LAYER
-- Depends on 20260909_sprint8_foundation.sql

create table if not exists public.analytics_events (
  id bigserial primary key,
  user_id uuid references auth.users(id) on delete set null,
  session_id text,
  event_name text not null,
  event_group text not null default 'product',
  source text,
  page text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists analytics_events_name_idx on public.analytics_events(event_name);
create index if not exists analytics_events_created_idx on public.analytics_events(created_at desc);
create index if not exists analytics_events_session_idx on public.analytics_events(session_id);

create table if not exists public.accountability_metrics (
  id bigserial primary key,
  metric_key text unique not null,
  metric_label text not null,
  value_numeric numeric,
  value_text text,
  unit text,
  source_url text,
  source_note text,
  reporting_period text,
  verified boolean not null default false,
  published boolean not null default false,
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now()
);

alter table public.analytics_events enable row level security;
alter table public.accountability_metrics enable row level security;

create policy analytics_staff_read on public.analytics_events
  for select using (public.fob_is_staff());
create policy analytics_authenticated_insert on public.analytics_events
  for insert with check (auth.uid() = user_id or user_id is null);

create policy accountability_public_read on public.accountability_metrics
  for select using (published = true);
create policy accountability_staff_all on public.accountability_metrics
  for all using (public.fob_is_staff()) with check (public.fob_is_staff());

create or replace view public.growth_funnel_summary as
select
  count(*) filter (where event_name = 'membership_cta_view') as membership_cta_views,
  count(*) filter (where event_name = 'membership_start') as membership_starts,
  count(*) filter (where event_name = 'membership_submit') as membership_submits,
  count(*) filter (where event_name = 'membership_payment_success') as payment_successes,
  count(*) filter (where event_name = 'sighting_submit') as sightings_submitted,
  count(*) filter (where event_name = 'institution_lead') as institutional_leads,
  count(*) filter (where event_name = 'data_product_enquiry') as data_product_enquiries
from public.analytics_events;

create or replace view public.revenue_by_tier as
select
  coalesce(m.tier_slug, 'unknown') as tier_slug,
  count(distinct p.member_id) filter (where p.status='successful') as paying_members,
  count(*) filter (where p.status='successful') as successful_transactions,
  coalesce(sum(p.amount_ugx) filter (where p.status='successful'),0) as revenue_ugx,
  coalesce(avg(p.amount_ugx) filter (where p.status='successful'),0)::bigint as average_transaction_ugx
from public.payment_transactions p
left join public.memberships m on m.id = p.membership_id
group by 1;

create or replace function public.fob_set_analytics_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_accountability_metrics_updated_at on public.accountability_metrics;
create trigger trg_accountability_metrics_updated_at
before update on public.accountability_metrics
for each row execute function public.fob_set_analytics_updated_at();
