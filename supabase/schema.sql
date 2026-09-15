-- Opstellingen — schema. Uitvoeren in Supabase SQL Editor (één keer).
create extension if not exists "pgcrypto";

create table if not exists teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists team_members (
  team_id uuid not null references teams(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'coach' check (role in ('owner','coach')),
  primary key (team_id, user_id)
);

create table if not exists players (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references teams(id) on delete cascade,
  nr text not null default '',
  name text not null,
  is_libero boolean not null default false,
  is_captain boolean not null default false,
  is_setter boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists players_team on players(team_id);

create table if not exists matches (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references teams(id) on delete cascade,
  opponent text not null,
  match_date date not null default current_date,
  home boolean not null default true,
  sets jsonb not null default '[]'::jsonb,   -- 5 sets: {pos[6], libero, subs[], timeouts[], rot, locked, us, them, notes}
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists matches_team_date on matches(team_id, match_date desc);

create or replace function touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
drop trigger if exists matches_touch on matches;
create trigger matches_touch before update on matches for each row execute function touch_updated_at();

-- Bij aanmaken van een team wordt de maker automatisch owner.
create or replace function add_owner_membership() returns trigger language plpgsql security definer as $$
begin insert into team_members(team_id,user_id,role) values (new.id,new.created_by,'owner'); return new; end $$;
drop trigger if exists teams_add_owner on teams;
create trigger teams_add_owner after insert on teams for each row execute function add_owner_membership();

-- Hulpfunctie voor RLS (security definer vermijdt recursie op team_members).
create or replace function is_member(t uuid) returns boolean language sql security definer stable as $$
  select exists (select 1 from team_members where team_id = t and user_id = auth.uid());
$$;

alter table teams enable row level security;
alter table team_members enable row level security;
alter table players enable row level security;
alter table matches enable row level security;

drop policy if exists teams_select on teams;
create policy teams_select on teams for select using (is_member(id) or created_by = auth.uid());
drop policy if exists teams_insert on teams;
create policy teams_insert on teams for insert with check (created_by = auth.uid());
drop policy if exists teams_update on teams;
create policy teams_update on teams for update using (is_member(id));
drop policy if exists teams_delete on teams;
create policy teams_delete on teams for delete using (created_by = auth.uid());

drop policy if exists members_select on team_members;
create policy members_select on team_members for select using (is_member(team_id));
drop policy if exists members_insert on team_members;
create policy members_insert on team_members for insert with check (is_member(team_id));
drop policy if exists members_delete on team_members;
create policy members_delete on team_members for delete using (is_member(team_id));

drop policy if exists players_all on players;
create policy players_all on players for all using (is_member(team_id)) with check (is_member(team_id));

drop policy if exists matches_all on matches;
create policy matches_all on matches for all using (is_member(team_id)) with check (is_member(team_id));

-- Een coach toevoegen op e-mail (die persoon moet al één keer ingelogd zijn).
create or replace function add_member_by_email(t uuid, email text) returns void language plpgsql security definer as $$
declare u uuid;
begin
  if not is_member(t) then raise exception 'geen lid van dit team'; end if;
  select id into u from auth.users where lower(auth.users.email) = lower(add_member_by_email.email);
  if u is null then raise exception 'Geen gebruiker met dit e-mailadres; laat die persoon eerst één keer inloggen.'; end if;
  insert into team_members(team_id,user_id,role) values (t,u,'coach') on conflict do nothing;
end $$;

-- Scout (video-analyse) — per wedstrijd één JSON-blok: {serveFirst:{setIdx:'us'|'them'}, oppServers:{setIdx:[nr]}, oppFirstRot:{setIdx:n}, events:[...]}
alter table matches add column if not exists scout jsonb not null default '{}'::jsonb;

alter table players add column if not exists is_setter boolean not null default false;
