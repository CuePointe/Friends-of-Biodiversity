-- Sprint 8 security corrections
-- Run after foundation + analytics migrations.

-- A new authenticated user must be able to create only their own profile row.
drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own on public.profiles
  for insert with check (id = auth.uid());

-- Finance data is not a general staff write surface.
drop policy if exists payment_staff_all on public.payment_transactions;
create policy payment_finance_write on public.payment_transactions for insert
  with check (public.fob_my_role() in ('finance','admin','super_admin'));
create policy payment_finance_update on public.payment_transactions for update
  using (public.fob_my_role() in ('finance','admin','super_admin'))
  with check (public.fob_my_role() in ('finance','admin','super_admin'));
create policy payment_finance_delete on public.payment_transactions for delete
  using (public.fob_my_role() in ('finance','admin','super_admin'));

-- Revenue and institutional pipeline summaries are staff-only.
alter view public.membership_revenue_summary set (security_invoker = true);
alter view public.revenue_by_tier set (security_invoker = true);
alter view public.growth_funnel_summary set (security_invoker = true);
alter view public.institutional_pipeline_summary set (security_invoker = true);

-- Public-facing biodiversity pulse contains only aggregate observation counts.
alter view public.biodiversity_pulse set (security_invoker = true);

-- Prevent accidental anonymous access to operational aggregate views.
revoke all on public.membership_revenue_summary from anon;
revoke all on public.revenue_by_tier from anon;
revoke all on public.growth_funnel_summary from anon;
revoke all on public.institutional_pipeline_summary from anon;
