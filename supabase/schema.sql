-- ORT Tutor: accounts, progress and parent links (same design as GCSE Tutor).
-- Run once in Supabase: SQL Editor -> New query -> paste all of this -> Run.
-- Safe to run again: it drops and recreates the functions, policies and trigger (tables are kept).
--
-- What is stored: email (Supabase Auth, for login only), nickname, role, ORT progress. Nothing else.
-- Privacy: Row Level Security means a student can only read/write their own progress, and a parent can
-- only read the progress of children they linked with the child's link code.
--
-- The group code is NOT in this file, because the repository is public. Set it once, in a separate query:
--   update private.settings set join_code = 'YOUR-CODE';
-- Until then nobody can sign up.

-- ---------- private settings (not reachable from the app) ----------
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table if not exists private.settings (
  id int primary key default 1 check (id = 1),
  join_code text not null           -- the group code people need to sign up
);
insert into private.settings (id, join_code) values (1, md5(random()::text || clock_timestamp()::text))  -- unguessable until you set your own
on conflict (id) do nothing;

-- ---------- tables ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null check (role in ('student', 'parent')),
  nickname text check (char_length(nickname) between 1 and 30),
  link_code text unique,            -- students only: a parent types this to link
  created_at timestamptz not null default now()
);

create table if not exists public.progress (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  data jsonb not null default '{}'::jsonb check (pg_column_size(data) < 1000000),
  updated_at timestamptz not null default now()
);

create table if not exists public.parent_links (
  parent_id uuid not null references public.profiles (id) on delete cascade,
  student_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (parent_id, student_id)
);
create index if not exists parent_links_student_idx on public.parent_links (student_id);

-- ---------- new account -> profile ----------
create or replace function private.new_link_code() returns text
language plpgsql set search_path = '' as $$
declare
  chars text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';  -- no 0/O or 1/I/L
  code text;
begin
  loop
    code := '';
    for i in 1..6 loop
      code := code || substr(chars, 1 + floor(random() * length(chars))::int, 1);
    end loop;
    exit when not exists (select 1 from public.profiles where link_code = code);
  end loop;
  return code;
end $$;

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  r text := new.raw_user_meta_data ->> 'role';
  nick text := nullif(trim(new.raw_user_meta_data ->> 'nickname'), '');
begin
  if upper(trim(coalesce(new.raw_user_meta_data ->> 'join_code', ''))) <> upper((select join_code from private.settings where id = 1)) then
    raise exception 'GROUP_CODE: wrong group code';
  end if;
  if r is null or r not in ('student', 'parent') then
    raise exception 'ROLE: choose student or parent';
  end if;
  if r = 'student' and nick is null then
    raise exception 'NICKNAME: students need a nickname';
  end if;
  insert into public.profiles (id, role, nickname, link_code)
  values (new.id, r, left(nick, 30), case when r = 'student' then private.new_link_code() end);
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
revoke all on function public.handle_new_user() from anon, authenticated;

-- ---------- parent linking ----------
create or replace function public.link_child(code text) returns text
language plpgsql security definer set search_path = '' as $$
declare
  sid uuid;
  nick text;
begin
  if (select role from public.profiles where id = auth.uid()) is distinct from 'parent' then
    raise exception 'NOT_PARENT: only parent accounts can link to a child';
  end if;
  select id, nickname into sid, nick
  from public.profiles
  where role = 'student' and link_code = upper(regexp_replace(coalesce(code, ''), '[^A-Za-z0-9]', '', 'g'));
  if sid is null then
    raise exception 'NO_CHILD: no child found with that code';
  end if;
  insert into public.parent_links (parent_id, student_id) values (auth.uid(), sid)
  on conflict do nothing;
  return nick;
end $$;
revoke all on function public.link_child(text) from public, anon;
grant execute on function public.link_child(text) to authenticated;

-- ---------- privileges ----------
revoke all on public.profiles, public.progress, public.parent_links from anon, authenticated;
grant select on public.profiles to authenticated;
grant update (nickname) on public.profiles to authenticated;   -- only the nickname can be changed
grant select, insert, update on public.progress to authenticated;
grant select, delete on public.parent_links to authenticated;  -- links are created by link_child()

-- ---------- row level security ----------
alter table public.profiles enable row level security;
alter table public.progress enable row level security;
alter table public.parent_links enable row level security;

drop policy if exists "profiles: read own" on public.profiles;
drop policy if exists "profiles: parents read linked children" on public.profiles;
drop policy if exists "profiles: update own" on public.profiles;
create policy "profiles: read own" on public.profiles
  for select to authenticated using (id = (select auth.uid()));
create policy "profiles: parents read linked children" on public.profiles
  for select to authenticated using (exists (
    select 1 from public.parent_links l where l.parent_id = (select auth.uid()) and l.student_id = profiles.id));
create policy "profiles: update own" on public.profiles
  for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));

drop policy if exists "progress: read own or linked child" on public.progress;
drop policy if exists "progress: students insert own" on public.progress;
drop policy if exists "progress: students update own" on public.progress;
create policy "progress: read own or linked child" on public.progress
  for select to authenticated using (
    user_id = (select auth.uid())
    or exists (select 1 from public.parent_links l where l.parent_id = (select auth.uid()) and l.student_id = progress.user_id));
create policy "progress: students insert own" on public.progress
  for insert to authenticated with check (
    user_id = (select auth.uid())
    and exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'student'));
create policy "progress: students update own" on public.progress
  for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

drop policy if exists "links: parent or child reads" on public.parent_links;
drop policy if exists "links: parent or child removes" on public.parent_links;
create policy "links: parent or child reads" on public.parent_links
  for select to authenticated using (parent_id = (select auth.uid()) or student_id = (select auth.uid()));
create policy "links: parent or child removes" on public.parent_links
  for delete to authenticated using (parent_id = (select auth.uid()) or student_id = (select auth.uid()));
