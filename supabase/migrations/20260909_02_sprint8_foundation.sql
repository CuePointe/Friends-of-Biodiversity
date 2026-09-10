-- FRIENDS OF BIODIVERSITY — SPRINT 8 FOUNDATION
-- 2026-09-09
-- Purpose: production-oriented foundation for security, membership revenue,
-- citizen-science quality, institutional partnerships, and biodiversity data products.
--
-- IMPORTANT:
-- 1) This migration is designed to be reviewed before applying to a live project.
-- 2) Supabase Auth is the identity system. Do NOT store member passwords in app tables.
-- 3) Existing legacy columns such as members.pass are intentionally NOT dropped here;
--    remove them only after the frontend has migrated to Supabase Auth.

create extension if not exists pgcrypto;

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. IDENTITY / PROFILE BRIDGE
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text,
  phone text,
  organisation text,
  bio text,
  avatar_url text,
  wallpaper_url text,
  role text not null default 'member'
    check (role in ('member','moderator','verifier','finance','communications','admin','super_admin')),
  status text not null default 'active'
    check (status in ('active','suspended','pending','deleted')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.members
  add column if not exists auth_user_id uuid references auth.users(id) on delete set null;

create unique index if not exists members_auth_user_id_uidx
  on public.members(auth_user_id)
  where auth_user_id is not null;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. MEMBERSHIP / REVENUE LEDGER
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.membership_tiers (
  id bigserial primary key,
  slug text unique not null,
  name text not null,
  annual_amount_ugx bigint not null check (annual_amount_ugx >= 0),
  audience text,
  proposition text,
  active boolean not null default true,
  sort_order integer not null default 0
);

insert into public.membership_tiers (slug,name,annual_amount_ugx,audience,proposition,sort_order)
values
 ('student','Student / Youth',0,'Students and youth','Participate in biodiversity action',1),
 ('silver','Silver',0,'Individual supporters','Support practical conservation',2),
 ('gold','Gold',0,'Engaged members','Engage more deeply with the movement',3),
 ('platinum','Platinum',0,'High-value supporters','Partner with UBF on impact',4),
 ('diamond','Diamond',0,'Lead supporters','Lead biodiversity action',5),
 ('partner','Partner',0,'Institutions / strategic partners','Build long-term conservation partnerships',6)
on conflict (slug) do nothing;

create table if not exists public.memberships (
  id uuid primary key default gen_random_uuid(),
  member_id uuid references public.members(id) on delete set null,
  auth_user_id uuid references auth.users(id) on delete set null,
  tier_slug text not null references public.membership_tiers(slug),
  membership_year integer not null,
  status text not null default 'pending'
    check (status in ('pending','active','lapsed','cancelled','rejected')),
  start_date date,
  end_date date,
  committed_amount_ugx bigint not null default 0 check (committed_amount_ugx >= 0),
  source text not null default 'web',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists memberships_year_idx on public.memberships(membership_year);
create index if not exists memberships_auth_user_idx on public.memberships(auth_user_id);

create table if not exists public.payment_transactions (
  id uuid primary key default gen_random_uuid(),
  member_id uuid references public.members(id) on delete set null,
  membership_id uuid references public.memberships(id) on delete set null,
  payer_name text,
  provider text not null check (provider in ('flutterwave','mtn_momo','airtel_money','stanbic','other')),
  external_reference text,
  amount_ugx bigint not null check (amount_ugx > 0),
  currency text not null default 'UGX',
  status text not null default 'pending'
    check (status in ('pending','successful','failed','reversed','refunded','manual_review')),
  received_at timestamptz,
  verified_by uuid references auth.users(id) on delete set null,
  verified_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create unique index if not exists payment_external_reference_uidx
  on public.payment_transactions(provider, external_reference)
  where external_reference is not null;
create index if not exists payment_transactions_status_idx on public.payment_transactions(status);

create or replace view public.membership_revenue_summary as
select
  date_trunc('month', coalesce(p.received_at, p.created_at))::date as month,
  count(*) filter (where p.status = 'successful') as successful_transactions,
  coalesce(sum(p.amount_ugx) filter (where p.status = 'successful'),0) as revenue_ugx,
  count(distinct p.member_id) filter (where p.status = 'successful') as paying_members
from public.payment_transactions p
group by 1;

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. AUDITABILITY / GOVERNANCE
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.audit_log (
  id bigserial primary key,
  actor_user_id uuid references auth.users(id) on delete set null,
  action text not null,
  object_type text not null,
  object_id text,
  before_data jsonb,
  after_data jsonb,
  reason text,
  request_id text,
  created_at timestamptz not null default now()
);
create index if not exists audit_log_object_idx on public.audit_log(object_type, object_id);
create index if not exists audit_log_actor_idx on public.audit_log(actor_user_id);
create index if not exists audit_log_created_idx on public.audit_log(created_at desc);

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. BIODIVERSITY OBSERVATION QUALITY
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.species (
  id uuid primary key default gen_random_uuid(),
  common_name text not null,
  scientific_name text,
  taxon_group text not null default 'other',
  conservation_status text,
  habitat text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
create unique index if not exists species_scientific_name_uidx
  on public.species(scientific_name)
  where scientific_name is not null;

create table if not exists public.observation_quality (
  sighting_id uuid primary key references public.sightings(id) on delete cascade,
  photo_score numeric(5,2) not null default 0,
  gps_score numeric(5,2) not null default 0,
  observer_score numeric(5,2) not null default 0,
  duplicate_score numeric(5,2) not null default 100,
  verification_score numeric(5,2) not null default 0,
  completeness_score numeric(5,2) not null default 0,
  quality_score numeric(5,2) generated always as (
    (photo_score * 0.15) +
    (gps_score * 0.15) +
    (observer_score * 0.15) +
    (duplicate_score * 0.10) +
    (verification_score * 0.30) +
    (completeness_score * 0.15)
  ) stored,
  quality_band text generated always as (
    case
      when ((photo_score * 0.15) + (gps_score * 0.15) + (observer_score * 0.15) +
            (duplicate_score * 0.10) + (verification_score * 0.30) +
            (completeness_score * 0.15)) >= 85 then 'high'
      when ((photo_score * 0.15) + (gps_score * 0.15) + (observer_score * 0.15) +
            (duplicate_score * 0.10) + (verification_score * 0.30) +
            (completeness_score * 0.15)) >= 65 then 'medium'
      else 'low'
    end
  ) stored,
  scored_by uuid references auth.users(id) on delete set null,
  scored_at timestamptz not null default now()
);

create or replace view public.biodiversity_pulse as
select
  count(*) as total_observations,
  count(*) filter (where s.verified = true) as verified_observations,
  count(distinct lower(s.species)) as distinct_species,
  count(distinct s.member_id) as contributing_members,
  count(*) filter (where s.observed_at >= now() - interval '30 days') as observations_30d,
  count(*) filter (where s.verified = true and s.observed_at >= now() - interval '30 days') as verified_30d
from public.sightings s;

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. INSTITUTIONAL SALES / PARTNERSHIPS
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.institutions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null check (type in ('corporate','school','university','ngo','eia','research','government','donor','other')),
  website text,
  region text,
  contact_name text,
  contact_email text,
  contact_phone text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.institution_leads (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid references public.institutions(id) on delete cascade,
  stage text not null default 'new'
    check (stage in ('new','qualified','meeting','proposal','negotiation','won','lost','nurture')),
  opportunity_type text not null
    check (opportunity_type in ('institutional_membership','csr_partnership','employee_campaign','research_data','eia_data','monitoring','sponsorship','other')),
  estimated_value_ugx bigint check (estimated_value_ugx >= 0),
  probability numeric(5,2) default 10 check (probability >= 0 and probability <= 100),
  next_action text,
  next_action_at timestamptz,
  owner_user_id uuid references auth.users(id) on delete set null,
  source text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists institution_leads_stage_idx on public.institution_leads(stage);
create index if not exists institution_leads_action_idx on public.institution_leads(next_action_at);

create or replace view public.institutional_pipeline_summary as
select
  stage,
  count(*) as opportunities,
  coalesce(sum(estimated_value_ugx),0) as gross_value_ugx,
  coalesce(sum(estimated_value_ugx * (probability/100.0)),0)::bigint as weighted_value_ugx
from public.institution_leads
group by stage;

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. BIODIVERSITY INTELLIGENCE PRODUCTS
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.data_products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text,
  buyer_segment text not null,
  price_ugx bigint,
  delivery_format text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
insert into public.data_products(slug,name,description,buyer_segment,delivery_format)
values
 ('biodiversity-snapshot','Biodiversity Snapshot','Verified species and observation summary for a defined area and period.','institutions','PDF + dashboard'),
 ('biodiversity-intelligence-pack','Biodiversity Intelligence Pack','Verified georeferenced occurrence evidence packaged with methodology, quality notes and maps.','EIA / conservation / research','CSV + maps + methodology'),
 ('monitoring-partnership','Biodiversity Monitoring Partnership','Ongoing observation collection, verification and reporting for a defined landscape or project.','institutions','Dashboard + recurring reports')
on conflict (slug) do nothing;

create table if not exists public.data_product_orders (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.data_products(id),
  institution_id uuid references public.institutions(id) on delete set null,
  buyer_email text,
  scope jsonb not null default '{}'::jsonb,
  amount_ugx bigint not null default 0 check (amount_ugx >= 0),
  status text not null default 'lead'
    check (status in ('lead','quoted','paid','processing','delivered','cancelled')),
  payment_transaction_id uuid references public.payment_transactions(id) on delete set null,
  delivered_at timestamptz,
  created_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 7. ROW LEVEL SECURITY
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.fob_my_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select role from public.profiles where id = auth.uid()), 'member');
$$;

create or replace function public.fob_is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.fob_my_role() in ('moderator','verifier','finance','communications','admin','super_admin');
$$;

create or replace function public.fob_is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.fob_my_role() in ('admin','super_admin');
$$;

alter table public.profiles enable row level security;
alter table public.memberships enable row level security;
alter table public.payment_transactions enable row level security;
alter table public.audit_log enable row level security;
alter table public.species enable row level security;
alter table public.observation_quality enable row level security;
alter table public.institutions enable row level security;
alter table public.institution_leads enable row level security;
alter table public.data_products enable row level security;
alter table public.data_product_orders enable row level security;

drop policy if exists profiles_select_own on public.profiles;
drop policy if exists profiles_update_own on public.profiles;
drop policy if exists profiles_admin_all on public.profiles;
create policy profiles_select_own on public.profiles for select using (id = auth.uid() or public.fob_is_staff());
create policy profiles_update_own on public.profiles for update using (id = auth.uid());
create policy profiles_admin_all on public.profiles for all using (public.fob_is_admin()) with check (public.fob_is_admin());

drop policy if exists memberships_select_self on public.memberships;
drop policy if exists memberships_staff_all on public.memberships;
create policy memberships_select_self on public.memberships for select
  using (auth_user_id = auth.uid() or public.fob_is_staff());
create policy memberships_staff_all on public.memberships for all
  using (public.fob_is_staff()) with check (public.fob_is_staff());

drop policy if exists payment_select_self on public.payment_transactions;
drop policy if exists payment_staff_all on public.payment_transactions;
create policy payment_select_self on public.payment_transactions for select
  using ((exists (select 1 from public.members m where m.id = member_id and m.auth_user_id = auth.uid())) or public.fob_is_staff());
create policy payment_staff_all on public.payment_transactions for all
  using (public.fob_is_staff()) with check (public.fob_is_staff());

drop policy if exists audit_staff_select on public.audit_log;
create policy audit_staff_select on public.audit_log for select using (public.fob_is_staff());
create policy audit_staff_insert on public.audit_log for insert with check (public.fob_is_staff());

drop policy if exists species_public_read on public.species;
drop policy if exists species_staff_write on public.species;
create policy species_public_read on public.species for select using (active = true);
create policy species_staff_write on public.species for all using (public.fob_is_staff()) with check (public.fob_is_staff());

drop policy if exists observation_quality_staff_read on public.observation_quality;
drop policy if exists observation_quality_staff_write on public.observation_quality;
create policy observation_quality_staff_read on public.observation_quality for select using (public.fob_is_staff());
create policy observation_quality_staff_write on public.observation_quality for all using (public.fob_is_staff()) with check (public.fob_is_staff());

drop policy if exists institutions_staff_all on public.institutions;
drop policy if exists leads_staff_all on public.institution_leads;
create policy institutions_staff_all on public.institutions for all using (public.fob_is_staff()) with check (public.fob_is_staff());
create policy leads_staff_all on public.institution_leads for all using (public.fob_is_staff()) with check (public.fob_is_staff());

drop policy if exists data_products_public_read on public.data_products;
drop policy if exists data_products_staff_write on public.data_products;
create policy data_products_public_read on public.data_products for select using (active = true);
create policy data_products_staff_write on public.data_products for all using (public.fob_is_staff()) with check (public.fob_is_staff());

drop policy if exists product_orders_staff_all on public.data_product_orders;
create policy product_orders_staff_all on public.data_product_orders for all using (public.fob_is_staff()) with check (public.fob_is_staff());

-- ─────────────────────────────────────────────────────────────────────────────
-- 8. UPDATED-AT HELPER
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.fob_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at before update on public.profiles
for each row execute function public.fob_set_updated_at();

drop trigger if exists trg_memberships_updated_at on public.memberships;
create trigger trg_memberships_updated_at before update on public.memberships
for each row execute function public.fob_set_updated_at();

drop trigger if exists trg_institutions_updated_at on public.institutions;
create trigger trg_institutions_updated_at before update on public.institutions
for each row execute function public.fob_set_updated_at();

drop trigger if exists trg_leads_updated_at on public.institution_leads;
create trigger trg_leads_updated_at before update on public.institution_leads
for each row execute function public.fob_set_updated_at();

comment on table public.payment_transactions is 'Canonical payment ledger. Frontend claims are never treated as verified revenue until staff or trusted webhook verification marks status=successful.';
comment on table public.observation_quality is 'Evidence-quality scoring layer for citizen-science observations. Use verified records for paid data products.';
comment on table public.institution_leads is 'Institutional growth funnel for memberships, sponsorship, data products and monitoring partnerships.';
comment on table public.data_product_orders is 'Commercial delivery workflow for biodiversity intelligence products.';
