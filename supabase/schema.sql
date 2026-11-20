-- EcoThread shared board + anonymous impact counter.
-- Paste this whole file into Supabase → SQL Editor → New query → Run.
-- Visitors use the public "anon" key, so every rule below is enforced by the database itself.

-- ---------- helper: block phone numbers, emails and links ----------
create or replace function public.no_contact(t text) returns boolean
language sql immutable as $$
  select t is null or not (
    t ~ '[0-9][0-9 ().+-]{7,}[0-9]' or
    t ~* '[a-z0-9._%+-]+@[a-z0-9-]+\.[a-z]{2,}' or
    t ~* 'https?://' or t ~* 'wa\.me'
  );
$$;

-- ---------- listings ----------
create table if not exists public.listings (
  id          text primary key check (char_length(id) between 4 and 40),
  title       text not null check (char_length(title) between 2 and 60 and public.no_contact(title)),
  descr       text not null check (char_length(descr) between 2 and 200 and public.no_contact(descr)),
  owner       text not null check (owner ~ '^@[A-Za-z0-9_.]{1,23}$'),
  cat         text not null check (cat in ('Tops','Bottoms','Outerwear','Ethnic wear','Accessories')),
  size        text not null check (size in ('XS','S','M','L','XL','One size')),
  cond        text not null check (cond in ('Like new','Gently loved','Well worn','Upcycled')),
  art         text not null check (art in ('tee','knit','hoodie','jeans','jacket','kurta','skirt','bag')),
  swapped     boolean not null default false,
  created     bigint not null,
  owner_token text not null check (char_length(owner_token) between 16 and 64)
);

-- ---------- swap requests ----------
create table if not exists public.requests (
  id         text primary key check (char_length(id) between 4 and 40),
  listing_id text not null references public.listings(id) on delete cascade,
  handle     text not null check (handle ~ '^@[A-Za-z0-9_.]{1,23}$'),
  offer      text not null check (char_length(offer) between 2 and 60 and public.no_contact(offer)),
  meet       text not null check (meet in ('School library, after classes','Next swap meet-up','Main gate, with friends')),
  by_key     text not null check (char_length(by_key) between 4 and 64),
  created    bigint not null
);

-- ---------- pledges ----------
create table if not exists public.pledges (
  id      text primary key check (char_length(id) between 4 and 40),
  handle  text not null check (handle ~ '^@[A-Za-z0-9_.]{1,23}$'),
  body    text not null check (char_length(body) between 8 and 160 and public.no_contact(body)),
  by_key  text not null check (char_length(by_key) between 4 and 64),
  created bigint not null
);

-- ---------- pledge supports ----------
create table if not exists public.likes (
  pledge_id text not null references public.pledges(id) on delete cascade,
  voter     text not null check (char_length(voter) between 4 and 64),
  primary key (pledge_id, voter)
);

-- ---------- anonymous impact events (no personal data) ----------
create table if not exists public.events (
  id      bigserial primary key,
  kind    text not null check (kind in ('quiz','swap','secondhand','pledge','manifesto','ai')),
  created timestamptz not null default now()
);

-- ---------- Row Level Security ----------
alter table public.listings enable row level security;
alter table public.requests enable row level security;
alter table public.pledges  enable row level security;
alter table public.likes    enable row level security;
alter table public.events   enable row level security;

drop policy if exists "read listings" on public.listings;
create policy "read listings" on public.listings for select using (true);
drop policy if exists "add listings" on public.listings;
create policy "add listings" on public.listings for insert with check (swapped = false);

drop policy if exists "read requests" on public.requests;
create policy "read requests" on public.requests for select using (true);
drop policy if exists "add requests" on public.requests;
create policy "add requests" on public.requests for insert with check (true);

drop policy if exists "read pledges" on public.pledges;
create policy "read pledges" on public.pledges for select using (true);
drop policy if exists "add pledges" on public.pledges;
create policy "add pledges" on public.pledges for insert with check (true);

drop policy if exists "read likes" on public.likes;
create policy "read likes" on public.likes for select using (true);

drop policy if exists "add events" on public.events;
create policy "add events" on public.events for insert with check (true);

-- Column-level access: the owner_token is never readable by visitors.
revoke all on public.listings, public.requests, public.pledges, public.likes, public.events from anon, authenticated;
grant select (id, title, descr, owner, cat, size, cond, art, swapped, created) on public.listings to anon, authenticated;
grant insert (id, title, descr, owner, cat, size, cond, art, created, owner_token) on public.listings to anon, authenticated;
grant select, insert on public.requests to anon, authenticated;
grant select, insert on public.pledges to anon, authenticated;
grant select on public.likes to anon, authenticated;
grant insert (kind) on public.events to anon, authenticated;
grant usage, select on sequence public.events_id_seq to anon, authenticated;

-- ---------- functions visitors may call ----------
-- Only the device that posted a listing knows its owner_token, so only it can mark or remove the listing.
create or replace function public.mark_swapped(p_id text, p_token text) returns boolean
language plpgsql security definer set search_path = public as $$
begin
  update listings set swapped = true where id = p_id and owner_token = p_token;
  if found then insert into events(kind) values ('swap'); end if;
  return found;
end $$;

create or replace function public.delete_listing(p_id text, p_token text) returns boolean
language plpgsql security definer set search_path = public as $$
begin
  delete from listings where id = p_id and owner_token = p_token;
  return found;
end $$;

create or replace function public.toggle_like(p_pledge text, p_voter text) returns boolean
language plpgsql security definer set search_path = public as $$
begin
  if char_length(p_voter) not between 4 and 64 then return false; end if;
  delete from likes where pledge_id = p_pledge and voter = p_voter;
  if found then return false; end if;
  insert into likes(pledge_id, voter) values (p_pledge, p_voter);
  return true;
end $$;

create or replace function public.get_stats() returns json
language sql security definer set search_path = public stable as $$
  select json_build_object(
    'quiz',       (select count(*) from events where kind = 'quiz'),
    'swap',       (select count(*) from events where kind = 'swap'),
    'secondhand', (select count(*) from events where kind = 'secondhand'),
    'pledge',     (select count(*) from pledges),
    'listings',   (select count(*) from listings)
  );
$$;

revoke all on function public.mark_swapped(text, text), public.delete_listing(text, text), public.toggle_like(text, text), public.get_stats() from public;
grant execute on function public.mark_swapped(text, text), public.delete_listing(text, text), public.toggle_like(text, text), public.get_stats() to anon, authenticated;
