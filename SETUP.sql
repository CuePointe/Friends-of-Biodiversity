-- ════════════════════════════════════════════════════════════
-- FRIENDS OF BIODIVERSITY — FRESH DATABASE SETUP
-- Run this entire script ONCE in Supabase SQL Editor.
-- This DROPS and RECREATES all tables to guarantee they match app.js exactly.
-- WARNING: this deletes any existing data in these tables.
-- ════════════════════════════════════════════════════════════

-- Clean slate
drop table if exists comments cascade;
drop table if exists content cascade;
drop table if exists wall_of_fame cascade;
drop table if exists announcements cascade;
drop table if exists fin_reports cascade;
drop table if exists payment_details cascade;
drop table if exists members cascade;

-- ── MEMBERS ──
create table members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text unique not null,
  pass text not null,
  type text,
  tier text default 'silver',
  amount bigint default 0,
  year int default extract(year from now()),
  org text,
  engage text,
  payref text,
  tel text,
  role text default 'member',
  status text default 'active',
  photo_url text,
  created_at timestamp without time zone default now()
);

-- ── CONTENT (Learning Exchange) ──
create table content (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  type text,
  window_name text,
  theme text,
  description text,
  author text,
  access text default 'member',
  url text,
  thumb_url text,
  media_url text,
  media_type text,
  full_text text,
  reactions jsonb default '{"likes":0,"bookmarks":0}'::jsonb,
  created_at timestamp without time zone default now()
);

-- ── COMMENTS (linked to content) ──
create table comments (
  id uuid primary key default gen_random_uuid(),
  content_id uuid references content(id) on delete cascade,
  user_name text,
  text text,
  created_at timestamp without time zone default now()
);

-- ── WALL OF FAME ──
create table wall_of_fame (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  caption text,
  tier text default 'silver',
  year int default extract(year from now()),
  photo_url text,
  created_at timestamp without time zone default now()
);

-- ── ANNOUNCEMENTS ──
create table announcements (
  id uuid primary key default gen_random_uuid(),
  type text default 'Project Update',
  title text not null,
  body text,
  created_at timestamp without time zone default now()
);

-- ── FINANCIAL REPORTS ──
create table fin_reports (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  period text,
  summary text,
  url text,
  created_at timestamp without time zone default now()
);

-- ── PAYMENT DETAILS (single row, id=1) ──
create table payment_details (
  id int primary key default 1,
  bank text,
  accno text,
  branch text,
  swift text,
  mtn text,
  airtel text
);

-- ════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY — open read/write for the anon key
-- (This is intentionally permissive for a small-project launch.
--  Tighten later with role-based policies once usage grows.)
-- ════════════════════════════════════════════════════════════

alter table members enable row level security;
create policy "members_select" on members for select using (true);
create policy "members_insert" on members for insert with check (true);
create policy "members_update" on members for update using (true);

alter table content enable row level security;
create policy "content_select" on content for select using (true);
create policy "content_insert" on content for insert with check (true);
create policy "content_update" on content for update using (true);
create policy "content_delete" on content for delete using (true);

alter table comments enable row level security;
create policy "comments_select" on comments for select using (true);
create policy "comments_insert" on comments for insert with check (true);

alter table wall_of_fame enable row level security;
create policy "fame_select" on wall_of_fame for select using (true);
create policy "fame_insert" on wall_of_fame for insert with check (true);
create policy "fame_delete" on wall_of_fame for delete using (true);

alter table announcements enable row level security;
create policy "announce_select" on announcements for select using (true);
create policy "announce_insert" on announcements for insert with check (true);
create policy "announce_delete" on announcements for delete using (true);

alter table fin_reports enable row level security;
create policy "fin_select" on fin_reports for select using (true);
create policy "fin_insert" on fin_reports for insert with check (true);
create policy "fin_delete" on fin_reports for delete using (true);

alter table payment_details enable row level security;
create policy "payment_select" on payment_details for select using (true);
create policy "payment_upsert" on payment_details for all using (true) with check (true);

-- ════════════════════════════════════════════════════════════
-- SEED: 7 admin accounts (default password UBF@2026! — change after first login)
-- ════════════════════════════════════════════════════════════
insert into members (name, email, pass, type, tier, amount, year, org, role, status, payref) values
('Executive Director','i.amani@ugandabiodiversityfund.org','UBF@2026!','staff','diamond',0,2026,'Uganda Biodiversity Fund','admin','active',''),
('Projects Officer','o.atuhaire@ugandabiodiversityfund.org','UBF@2026!','staff','diamond',0,2026,'Uganda Biodiversity Fund','admin','active',''),
('Office Assistant','t.otieno@ugandabiodiversityfund.org','UBF@2026!','staff','diamond',0,2026,'Uganda Biodiversity Fund','admin','active',''),
('Programs Officer','p.musiime@ugandabiodiversityfund.org','UBF@2026!','staff','diamond',0,2026,'Uganda Biodiversity Fund','admin','active',''),
('M&E Officer','d.okullu@ugandabiodiversityfund.org','UBF@2026!','staff','diamond',0,2026,'Uganda Biodiversity Fund','admin','active',''),
('Finance Manager','w.nabantanzi@ugandabiodiversityfund.org','UBF@2026!','staff','diamond',0,2026,'Uganda Biodiversity Fund','admin','active',''),
('Administration Officer','s.abonyo@ugandabiodiversityfund.org','UBF@2026!','staff','diamond',0,2026,'Uganda Biodiversity Fund','admin','active','');

-- ════════════════════════════════════════════════════════════
-- STORAGE BUCKETS — for photos and media files
-- ════════════════════════════════════════════════════════════
insert into storage.buckets (id, name, public)
values ('content-files', 'content-files', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('fame-photos', 'fame-photos', true)
on conflict (id) do nothing;

create policy "content_files_public_read" on storage.objects for select using (bucket_id = 'content-files');
create policy "content_files_public_upload" on storage.objects for insert with check (bucket_id = 'content-files');
create policy "fame_photos_public_read" on storage.objects for select using (bucket_id = 'fame-photos');
create policy "fame_photos_public_upload" on storage.objects for insert with check (bucket_id = 'fame-photos');

-- ════════════════════════════════════════════════════════════
-- DONE. Verify with:
-- select email, role from members;
-- ════════════════════════════════════════════════════════════

-- ── MEMBER POSTS (community feed, shown in Learning Exchange) ──
create table if not exists member_posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references members(id) on delete cascade,
  author_name text,
  author_tier text,
  body text,
  image_url text,
  video_url text,
  status text default 'pending', -- pending | approved | rejected
  reactions jsonb default '{"likes":0,"love":0,"wow":0,"support":0,"celebrate":0}'::jsonb,
  created_at timestamp without time zone default now()
);

alter table member_posts enable row level security;
create policy "posts_select" on member_posts for select using (true);
create policy "posts_insert" on member_posts for insert with check (true);
create policy "posts_update" on member_posts for update using (true);
create policy "posts_delete" on member_posts for delete using (true);
