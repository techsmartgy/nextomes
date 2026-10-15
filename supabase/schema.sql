-- NexOmes database schema. Paste into the Supabase SQL Editor and run; safe to re-run.

-- Property assessment requests from the "Sell" form on the public site.
-- The browser inserts with the publishable key; only the admin API (secret key) can read.
create table if not exists public.assessment_requests (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  reference     text not null check (char_length(reference) <= 40),
  name          text not null check (char_length(name) between 1 and 200),
  phone         text not null check (char_length(phone) <= 40),
  email         text not null check (char_length(email) <= 320),
  relationship  text check (char_length(relationship) <= 100),
  timeline      text check (char_length(timeline) <= 100),
  address       text not null check (char_length(address) between 1 and 300),
  city          text check (char_length(city) <= 120),
  state         text check (char_length(state) <= 40),
  zip           text check (char_length(zip) <= 10),
  place_id      text check (char_length(place_id) <= 300),
  property_type text check (char_length(property_type) <= 100),
  units         int check (units between 0 and 10000),
  beds          numeric(5,1) check (beds between 0 and 1000),
  baths         numeric(5,1) check (baths between 0 and 1000),
  occupancy     text check (char_length(occupancy) <= 100),
  distress      text[] not null check (cardinality(distress) between 1 and 10),
  condition     text check (char_length(condition) <= 100),
  notes         text check (char_length(notes) <= 4000)
);

create index if not exists assessment_requests_created_at_idx on public.assessment_requests (created_at desc);

-- Admin workflow: requests start open and are closed from the admin portal
alter table public.assessment_requests add column if not exists status text not null default 'open';
alter table public.assessment_requests add column if not exists closed_at timestamptz;
alter table public.assessment_requests drop constraint if exists assessment_requests_status_check;
alter table public.assessment_requests add constraint assessment_requests_status_check check (status in ('open', 'closed'));
-- Archived requests are hidden from the working lists but keep their status
alter table public.assessment_requests add column if not exists archived_at timestamptz;

alter table public.assessment_requests enable row level security;

-- Anyone may submit (always as open); nobody can read, update or delete through the public API.
drop policy if exists "Public can submit assessment requests" on public.assessment_requests;
create policy "Public can submit assessment requests"
  on public.assessment_requests for insert
  to anon, authenticated
  with check (status = 'open' and closed_at is null and archived_at is null);
