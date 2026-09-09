-- Friends of Biodiversity — Sprint 8 security corrections
-- Depends on 20260909_02_sprint8_foundation.sql + 20260909_03_sprint8_analytics.sql

-- A new authenticated user may create only their own profile row.
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
alter view public.biodiversity_pulse set (security_invoker = true);

revoke all on public.membership_revenue_summary from anon;
revoke all on public.revenue_by_tier from anon;
revoke all on public.growth_funnel_summary from anon;
revoke all on public.institutional_pipeline_summary from anon;

-- PostgREST roles need explicit view access; RLS/security_invoker still governs rows.
grant select on public.membership_revenue_summary to authenticated;
grant select on public.revenue_by_tier to authenticated;
grant select on public.growth_funnel_summary to authenticated;
grant select on public.institutional_pipeline_summary to authenticated;
grant select on public.biodiversity_pulse to authenticated;
grant select on public.accountability_metrics to anon, authenticated;
grant select, insert on public.analytics_events to authenticated;
grant select on public.data_products to anon, authenticated;
