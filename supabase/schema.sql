-- ORT Tutor: accounts, access codes, progress and parent links.
-- Run in Supabase: SQL Editor -> New query -> paste all of this -> Run.
-- Safe to run again: tables and their data are kept; functions, policies and the trigger are recreated.
--
-- What is stored: email (Supabase Auth, for login only), nickname, role, access end date, ORT progress. Nothing else.
--
-- Plans and access:
--   * FREE: anyone can sign up as a student without a code. Free students save progress like everyone else.
--   * FULL ACCESS: a single-use ACCESS CODE (from a school, a tutor or a purchase) sets profiles.access_until.
--     Each code has a number of uses (usually 1) and an end date; access lasts until that date. A shared code
--     stops working once its uses are spent. Students add a code at sign-up or later from their Account page.
--     When access ends the student is simply back on the free plan, with all progress kept.
--   * Parents sign up with their CHILD'S LINK CODE and are linked to that child; they can link more children.
--     A parent sees a child's progress only while that child has full access (enforced below).
--   * Paid practice (levels 2 and 3) lives in public.questions / public.passages, readable only with full access.
--     Admins upload it from the app (Account -> Admin -> Paid questions); the source files stay out of git.
--
-- First-time setup, after running this file (in separate queries):
--   1. Make your first codes (here 5 codes, 1 use each, valid until 1 July 2027):
--        select private.make_codes(5, 'Owner', '2027-07-01', 1);
--      then list them:  select code, expires_at from public.access_codes where batch = 'Owner';
--   2. Sign up in the app as a student (with or without one of those codes).
--   3. Make that account an admin, so you can make and track codes inside the app (Account -> Admin):
--        update public.profiles set is_admin = true where id = (select id from auth.users where email = 'YOUR@EMAIL');

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
drop table if exists private.settings;  -- the old shared group code, no longer used

-- ---------- tables ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null check (role in ('student', 'parent')),
  nickname text check (char_length(nickname) between 1 and 30),
  link_code text unique,            -- students only: a parent types this to sign up or link
  created_at timestamptz not null default now()
);
alter table public.profiles add column if not exists access_until timestamptz;            -- students: access ends
alter table public.profiles add column if not exists is_admin boolean not null default false;

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

create table if not exists public.access_codes (
  code text primary key,             -- stored without the dash, e.g. ABCD2345
  batch text not null check (char_length(batch) between 1 and 60),
  expires_at timestamptz not null,   -- the code must be used before this, and access lasts until it
  max_uses int not null default 1 check (max_uses between 1 and 1000),
  used int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists access_codes_batch_idx on public.access_codes (batch);

-- Paid practice (levels 2 and 3). Readable only by students with full access and by admins (RLS below), so it is
-- never shipped in the app's public files. Admins add or replace rows with import_questions().
-- `data` holds the question in the app's format without id/topic/level/lang: { kind, stem?, a?, b?, cond?, opts?, ans, why, passage? }.
create table if not exists public.passages (
  id text primary key,
  lang text not null check (lang in ('ru', 'ky')),
  data jsonb not null check (pg_column_size(data) < 60000),   -- { title?, text }
  updated_at timestamptz not null default now()
);
create table if not exists public.questions (
  id text primary key,
  topic_id text not null,
  level int not null check (level in (2, 3)),
  lang text not null check (lang in ('ru', 'ky')),   -- the Kyrgyz and Russian tests have different questions
  position int not null default 0,
  data jsonb not null check (pg_column_size(data) < 20000),
  updated_at timestamptz not null default now()
);
create index if not exists questions_lang_idx on public.questions (lang, position);

create table if not exists public.redemptions (
  code text not null references public.access_codes (code) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  at timestamptz not null default now(),
  primary key (code, user_id)
);

-- ---------- helpers ----------
create or replace function private.norm(c text) returns text
language sql immutable set search_path = '' as $$
  select upper(regexp_replace(coalesce(c, ''), '[^A-Za-z0-9]', '', 'g'))
$$;

create or replace function private.random_code(n int) returns text
language plpgsql set search_path = '' as $$
declare
  chars text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';  -- no 0/O or 1/I/L
  code text := '';
begin
  for i in 1..n loop
    code := code || substr(chars, 1 + floor(random() * length(chars))::int, 1);
  end loop;
  return code;
end $$;

create or replace function private.new_link_code() returns text
language plpgsql set search_path = '' as $$
declare code text;
begin
  loop
    code := private.random_code(6);
    exit when not exists (select 1 from public.profiles where link_code = code);
  end loop;
  return code;
end $$;

-- Uses one go of an access code for this user. Fails if the code is unknown, used up, past its date,
-- or already used by this user. Returns the code's end date. The update is atomic, so two people
-- racing for the last use of a code can't both get it.
create or replace function private.take_code(c text, uid uuid) returns timestamptz
language plpgsql set search_path = '' as $$
declare
  k text := private.norm(c);
  ends timestamptz;
begin
  update public.access_codes set used = used + 1
  where code = k and used < max_uses and expires_at > now()
    and not exists (select 1 from public.redemptions r where r.code = k and r.user_id = uid)
  returning expires_at into ends;
  if ends is null then
    raise exception 'BAD_CODE: access code not valid, used up or expired';
  end if;
  insert into public.redemptions (code, user_id) values (k, uid);
  return ends;
end $$;

-- Makes a batch of codes. Run it in the SQL editor for your first codes; admins use create_codes() in the app.
create or replace function private.make_codes(how_many int, batch_name text, valid_until date, uses int default 1)
returns setof text
language plpgsql set search_path = '' as $$
declare c text;
begin
  if how_many not between 1 and 500 then raise exception 'COUNT: between 1 and 500 codes at a time'; end if;
  if valid_until <= current_date then raise exception 'DATE: the end date must be in the future'; end if;
  for i in 1..how_many loop
    loop
      c := private.random_code(8);
      exit when not exists (select 1 from public.access_codes where code = c);
    end loop;
    insert into public.access_codes (code, batch, expires_at, max_uses)
    values (c, trim(batch_name), (valid_until + 1)::timestamptz - interval '1 second', greatest(1, uses));
    return next c;
  end loop;
end $$;

-- ---------- new account -> profile ----------
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  r text := new.raw_user_meta_data ->> 'role';
  nick text := nullif(trim(new.raw_user_meta_data ->> 'nickname'), '');
  code text := new.raw_user_meta_data ->> 'code';
  child uuid;
  ends timestamptz;
begin
  if r = 'student' then
    if nick is null then raise exception 'NICKNAME: students need a nickname'; end if;
    insert into public.profiles (id, role, nickname, link_code) values (new.id, 'student', left(nick, 30), private.new_link_code());
    -- No code = free plan. A code that is given must be valid, or the sign-up is refused.
    if private.norm(code) <> '' then
      ends := private.take_code(code, new.id);
      update public.profiles set access_until = ends where id = new.id;
    end if;
  elsif r = 'parent' then
    select id into child from public.profiles where role = 'student' and link_code = private.norm(code);
    if child is null then raise exception 'NO_CHILD: no child found with that code'; end if;
    insert into public.profiles (id, role) values (new.id, 'parent');
    insert into public.parent_links (parent_id, student_id) values (new.id, child);
  else
    raise exception 'ROLE: choose student or parent';
  end if;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
revoke all on function public.handle_new_user() from public, anon, authenticated;

-- ---------- functions the app calls ----------
-- Parents: link another child.
create or replace function public.link_child(code text) returns text
language plpgsql security definer set search_path = '' as $$
declare
  sid uuid;
  nick text;
begin
  if (select role from public.profiles where id = auth.uid()) is distinct from 'parent' then
    raise exception 'NOT_PARENT: only parent accounts can link to a child';
  end if;
  select id, nickname into sid, nick from public.profiles where role = 'student' and link_code = private.norm(code);
  if sid is null then raise exception 'NO_CHILD: no child found with that code'; end if;
  insert into public.parent_links (parent_id, student_id) values (auth.uid(), sid) on conflict do nothing;
  return nick;
end $$;

-- Students: add a code to start or extend access. Returns the new end date.
create or replace function public.redeem_code(code text) returns timestamptz
language plpgsql security definer set search_path = '' as $$
declare ends timestamptz;
begin
  if (select role from public.profiles where id = auth.uid()) is distinct from 'student' then
    raise exception 'NOT_STUDENT: only student accounts use access codes';
  end if;
  ends := private.take_code(code, auth.uid());
  update public.profiles set access_until = greatest(coalesce(access_until, now()), ends)
  where id = auth.uid() returning access_until into ends;
  return ends;
end $$;

-- Admins only, from here down.
create or replace function private.require_admin() returns void
language plpgsql set search_path = '' as $$
begin
  if not coalesce((select is_admin from public.profiles where id = auth.uid()), false) then
    raise exception 'NOT_ADMIN: admins only';
  end if;
end $$;

create or replace function public.create_codes(how_many int, batch_name text, valid_until date, uses int default 1)
returns setof text
language plpgsql security definer set search_path = '' as $$
begin
  perform private.require_admin();
  return query select private.make_codes(how_many, batch_name, valid_until, uses);
end $$;

create or replace function public.code_batches()
returns table (batch text, expires_at timestamptz, codes bigint, uses bigint, used bigint, created_at timestamptz)
language plpgsql security definer set search_path = '' as $$
begin
  perform private.require_admin();
  return query
    select c.batch, max(c.expires_at), count(*), sum(c.max_uses), sum(c.used), min(c.created_at)
    from public.access_codes c group by c.batch order by min(c.created_at) desc;
end $$;

create or replace function public.batch_codes(batch_name text)
returns table (code text, expires_at timestamptz, max_uses int, used int)
language plpgsql security definer set search_path = '' as $$
begin
  perform private.require_admin();
  return query select c.code, c.expires_at, c.max_uses, c.used from public.access_codes c
    where c.batch = batch_name order by c.created_at, c.code;
end $$;

create or replace function public.admin_stats()
returns table (students bigint, active_access bigint, parents bigint, practised_7d bigint)
language plpgsql security definer set search_path = '' as $$
begin
  perform private.require_admin();
  return query select
    (select count(*) from public.profiles where role = 'student'),
    (select count(*) from public.profiles where role = 'student' and access_until > now()),
    (select count(*) from public.profiles where role = 'parent'),
    (select count(*) from public.progress where updated_at > now() - interval '7 days');
end $$;

-- Adds or replaces paid questions and passages from a bundle { passages: [{id, lang, title?, text}],
-- questions: [{id, topic, level, lang, position?, kind, ...}] }. Rows are matched by id; rows not in the bundle stay.
-- The app checks the bundle's format before sending it (js/paidformat.js); the table checks guard the rest.
create or replace function public.import_questions(payload jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  p jsonb;
  q jsonb;
  np int := 0;
  nq int := 0;
begin
  perform private.require_admin();
  for p in select * from jsonb_array_elements(coalesce(payload -> 'passages', '[]'::jsonb)) loop
    insert into public.passages (id, lang, data, updated_at)
    values (p ->> 'id', p ->> 'lang', p - 'id' - 'lang', now())
    on conflict (id) do update set lang = excluded.lang, data = excluded.data, updated_at = now();
    np := np + 1;
  end loop;
  for q in select * from jsonb_array_elements(coalesce(payload -> 'questions', '[]'::jsonb)) loop
    insert into public.questions (id, topic_id, level, lang, position, data, updated_at)
    values (q ->> 'id', q ->> 'topic', (q ->> 'level')::int, q ->> 'lang', coalesce((q ->> 'position')::int, 0),
            q - 'id' - 'topic' - 'level' - 'lang' - 'position', now())
    on conflict (id) do update set topic_id = excluded.topic_id, level = excluded.level, lang = excluded.lang,
      position = excluded.position, data = excluded.data, updated_at = now();
    nq := nq + 1;
  end loop;
  return jsonb_build_object('questions', nq, 'passages', np);
end $$;

-- How many paid questions there are per language and level (admin page).
create or replace function public.question_counts()
returns table (lang text, level int, questions bigint)
language plpgsql security definer set search_path = '' as $$
begin
  perform private.require_admin();
  return query select q.lang, q.level, count(*) from public.questions q group by q.lang, q.level order by q.lang, q.level;
end $$;

revoke all on function public.link_child(text), public.redeem_code(text), public.create_codes(int, text, date, int),
  public.code_batches(), public.batch_codes(text), public.admin_stats(), public.import_questions(jsonb),
  public.question_counts() from public, anon;
grant execute on function public.link_child(text), public.redeem_code(text), public.create_codes(int, text, date, int),
  public.code_batches(), public.batch_codes(text), public.admin_stats(), public.import_questions(jsonb),
  public.question_counts() to authenticated;

-- ---------- privileges ----------
revoke all on public.profiles, public.progress, public.parent_links, public.access_codes, public.redemptions,
  public.questions, public.passages from anon, authenticated;
grant select on public.questions, public.passages to authenticated;   -- and RLS limits it to full access
grant select on public.profiles to authenticated;
grant update (nickname) on public.profiles to authenticated;   -- only the nickname can be changed by its owner
grant select, insert, update on public.progress to authenticated;
grant select, delete on public.parent_links to authenticated;  -- links are created by sign-up and link_child()
-- access_codes and redemptions: no direct access at all; only through the functions above.

-- ---------- row level security ----------
alter table public.profiles enable row level security;
alter table public.progress enable row level security;
alter table public.parent_links enable row level security;
alter table public.access_codes enable row level security;
alter table public.redemptions enable row level security;
alter table public.questions enable row level security;
alter table public.passages enable row level security;

-- Paid practice: only students whose access is current, and admins.
drop policy if exists "questions: full access only" on public.questions;
drop policy if exists "passages: full access only" on public.passages;
create policy "questions: full access only" on public.questions
  for select to authenticated using (exists (
    select 1 from public.profiles p where p.id = (select auth.uid()) and (p.access_until > now() or p.is_admin)));
create policy "passages: full access only" on public.passages
  for select to authenticated using (exists (
    select 1 from public.profiles p where p.id = (select auth.uid()) and (p.access_until > now() or p.is_admin)));

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

-- Every student (free or full) saves their own progress. A parent reads a linked child's progress only while
-- that child has full access: the parent dashboard is part of the paid plan.
drop policy if exists "progress: read own or linked child" on public.progress;
drop policy if exists "progress: students insert own" on public.progress;
drop policy if exists "progress: students update own" on public.progress;
create policy "progress: read own or linked child" on public.progress
  for select to authenticated using (
    user_id = (select auth.uid())
    or exists (select 1 from public.parent_links l join public.profiles c on c.id = l.student_id
               where l.parent_id = (select auth.uid()) and l.student_id = progress.user_id and c.access_until > now()));
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
