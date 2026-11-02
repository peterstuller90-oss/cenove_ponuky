-- Štullers Ponuky: tables for price quotes.
-- Safe to run in a shared Supabase project: every object is prefixed quote_ and
-- only e-mails listed in quote_admins can read or change anything.

create table if not exists public.quote_admins (
  email text primary key
);

create or replace function public.is_quote_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.quote_admins a where lower(a.email) = lower(auth.jwt() ->> 'email'))
$$;

create table if not exists public.quote_settings (
  id smallint primary key default 1 check (id = 1),
  data jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.quote_price_items (
  id text primary key,
  category text not null,
  name text not null,
  unit text not null default 'paušál',
  price numeric(12,2) not null default 0,
  note text not null default '',
  sort integer not null default 0,
  active boolean not null default true,
  placeholder boolean not null default false
);

create table if not exists public.quote_clients (
  id uuid primary key default gen_random_uuid(),
  name text not null default '',
  company text not null default '',
  ico text not null default '',
  dic text not null default '',
  address text not null default '',
  email text not null default '',
  phone text not null default ''
);

create table if not exists public.quotes (
  id uuid primary key,
  number text not null unique,
  status text not null default 'koncept' check (status in ('koncept','odoslana','prijata','zamietnuta')),
  public_token text not null unique,
  client_name text not null default '',
  total numeric(12,2) not null default 0,
  data jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  accepted_at timestamptz,
  accepted_name text not null default ''
);

alter table public.quote_admins enable row level security;
alter table public.quote_settings enable row level security;
alter table public.quote_price_items enable row level security;
alter table public.quote_clients enable row level security;
alter table public.quotes enable row level security;

drop policy if exists "admins read own row" on public.quote_admins;
create policy "admins read own row" on public.quote_admins for select to authenticated using ((select public.is_quote_admin()));

drop policy if exists "admins all" on public.quote_settings;
create policy "admins all" on public.quote_settings for all to authenticated using ((select public.is_quote_admin())) with check ((select public.is_quote_admin()));
drop policy if exists "admins all" on public.quote_price_items;
create policy "admins all" on public.quote_price_items for all to authenticated using ((select public.is_quote_admin())) with check ((select public.is_quote_admin()));
drop policy if exists "admins all" on public.quote_clients;
create policy "admins all" on public.quote_clients for all to authenticated using ((select public.is_quote_admin())) with check ((select public.is_quote_admin()));
drop policy if exists "admins all" on public.quotes;
create policy "admins all" on public.quotes for all to authenticated using ((select public.is_quote_admin())) with check ((select public.is_quote_admin()));

-- The client's link: anyone holding the long random token can read that one quote
-- (never a draft) together with the company details, and accept it once.
create or replace function public.get_public_quote(p_token text) returns jsonb
language sql stable security definer set search_path = '' as $$
  select jsonb_build_object('quote', q.data, 'settings', coalesce((select s.data from public.quote_settings s where s.id = 1), '{}'::jsonb))
  from public.quotes q
  where q.public_token = p_token and length(p_token) >= 20 and q.status <> 'koncept'
$$;

create or replace function public.accept_quote(p_token text, p_name text) returns void
language sql volatile security definer set search_path = '' as $$
  update public.quotes q set
    status = 'prijata',
    accepted_at = now(),
    accepted_name = left(coalesce(p_name, ''), 120),
    updated_at = now(),
    data = q.data || jsonb_build_object('status', 'prijata', 'acceptedAt', now(), 'acceptedName', left(coalesce(p_name, ''), 120))
  where q.public_token = p_token and length(p_token) >= 20 and q.status = 'odoslana'
$$;

revoke all on function public.get_public_quote(text) from public;
revoke all on function public.accept_quote(text, text) from public;
grant execute on function public.get_public_quote(text) to anon, authenticated;
grant execute on function public.accept_quote(text, text) to anon, authenticated;
revoke all on function public.is_quote_admin() from public, anon;
grant execute on function public.is_quote_admin() to authenticated;
