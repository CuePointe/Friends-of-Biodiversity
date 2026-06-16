create table members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text unique not null,
  type text, tier text, amount bigint, year int,
  org text, engage text, payref text, tel text,
  role text default 'member', status text default 'active',
  created_at timestamp default now()
);

create table content (
  id uuid primary key default gen_random_uuid(),
  title text, type text, window_name text, theme text,
  desc text, author text, access text default 'member',
  url text, file_path text,
  reactions jsonb default '{"likes":0,"bookmarks":0}',
  created_at timestamp default now()
);

create table comments (
  id uuid primary key default gen_random_uuid(),
  content_id uuid references content(id),
  user_name text, text text, created_at timestamp default now()
);

create table announcements (
  id uuid primary key default gen_random_uuid(),
  type text, title text, body text, created_at timestamp default now()
);

create table fin_reports (
  id uuid primary key default gen_random_uuid(),
  title text, period text, summary text, url text,
  created_at timestamp default now()
);

create table wall_of_fame (
  id uuid primary key default gen_random_uuid(),
  name text, caption text, tier text, year int, photo_url text
);

create table payment_details (
  id int primary key default 1,
  bank text, accno text, branch text, swift text, mtn text, airtel text
);