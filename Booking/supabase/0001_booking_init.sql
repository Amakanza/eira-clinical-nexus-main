-- Enable needed extensions
create extension if not exists "pgcrypto";
create extension if not exists "btree_gist";

-- Assumptions:
-- 1) Eira already uses 'public.patients' with primary key 'id uuid'.
--    If not, we create a minimal fallback in 'booking.patients' and you can swap via adapter.

-- SCHEMA
create schema if not exists booking;

-- ENUMS
do $$ begin
  create type booking.appointment_status as enum (
    'pending_hold', 'confirmed', 'cancelled', 'noshow', 'completed'
  );
exception when duplicate_object then null; end $$;

-- ADMIN & PROVIDER MEMBERSHIP
create table if not exists booking.admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);

create table if not exists booking.providers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null check (position('@' in email) > 1),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- SERVICES
create table if not exists booking.services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  duration_min int not null check (duration_min > 0),
  buffer_before_min int not null default 0 check (buffer_before_min >= 0),
  buffer_after_min int not null default 0 check (buffer_after_min >= 0),
  slot_step_min int not null default 15 check (slot_step_min in (5,10,15,20,30,60)),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- PROVIDER <-> SERVICE
create table if not exists booking.provider_services (
  provider_id uuid not null references booking.providers(id) on delete cascade,
  service_id uuid not null references booking.services(id) on delete cascade,
  primary key (provider_id, service_id)
);

-- PROVIDER WEEKLY HOURS (local to Africa/Windhoek)
-- day_of_week: 0=Sun ... 6=Sat
create table if not exists booking.provider_hours (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references booking.providers(id) on delete cascade,
  day_of_week int not null check (day_of_week between 0 and 6),
  start_local time not null,  -- local clock time (Africa/Windhoek)
  end_local time not null,
  is_open boolean not null default true,
  unique (provider_id, day_of_week, start_local, end_local)
);

-- PROVIDER TIME OFF (UTC instants)
create table if not exists booking.provider_time_off (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references booking.providers(id) on delete cascade,
  start_at timestamptz not null,
  end_at timestamptz not null,
  reason text,
  check (start_at < end_at)
);

-- PATIENTS FALLBACK (only created if public.patients doesn't exist)
do $$
begin
  if not exists (
    select 1 from information_schema.tables
    where table_schema='public' and table_name='patients'
  ) then
    create table if not exists booking.patients (
      id uuid primary key default gen_random_uuid(),
      first_name text not null,
      last_name text not null,
      email text,
      phone text,
      created_at timestamptz not null default now()
    );
    comment on table booking.patients is 'Fallback only; prefer public.patients in Eira.';
  end if;
end$$;

-- APPOINTMENTS
create table if not exists booking.appointments (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references booking.providers(id) on delete restrict,
  service_id uuid not null references booking.services(id) on delete restrict,
  patient_id uuid not null, -- references public.patients(id) OR booking.patients(id) via app adapter
  start_at timestamptz not null, -- store UTC
  end_at timestamptz not null,
  status booking.appointment_status not null default 'pending_hold',
  hold_expires_at timestamptz,
  customer_name text,           -- captured at booking
  customer_email text,
  customer_phone text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  during tstzrange generated always as (tstzrange(start_at, end_at, '[)')) stored
);
create index if not exists idx_appts_provider on booking.appointments(provider_id);
create index if not exists idx_appts_during_gist on booking.appointments using gist (during);
create index if not exists idx_appts_status on booking.appointments(status);
create index if not exists idx_appts_holdexp on booking.appointments(hold_expires_at);

-- BOOKING TOKENS
create table if not exists booking.booking_tokens (
  token text primary key, -- opaque
  appointment_id uuid not null references booking.appointments(id) on delete cascade,
  scope text not null check (scope in ('view','cancel','reschedule','manage')),
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);
create index if not exists idx_tokens_expires on booking.booking_tokens(expires_at);

-- NOTIFICATIONS
create table if not exists booking.notifications (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid not null references booking.appointments(id) on delete cascade,
  kind text not null check (kind in ('confirmation','reminder_24h','reminder_2h')),
  scheduled_at timestamptz not null,
  sent_at timestamptz,
  to_email text not null,
  subject text not null,
  payload jsonb not null default '{}',
  created_at timestamptz not null default now()
);
create index if not exists idx_notifications_due on booking.notifications(scheduled_at, sent_at);

-- UPDATED AT trigger
create or replace function booking.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end$$;

drop trigger if exists trg_set_updated_at on booking.appointments;
create trigger trg_set_updated_at
before update on booking.appointments
for each row execute function booking.set_updated_at();

-- UUID -> bigint for advisory locks (race-safe overlap checks)
create or replace function booking.uuid_bigint(u uuid)
returns bigint language sql immutable as $$
  select ('x' || substr(md5(u::text),1,16))::bit(64)::bigint;
$$;

-- OVERLAP PREVENTION TRIGGER
create or replace function booking.prevent_overlap()
returns trigger language plpgsql as $$
declare
  lock_key bigint;
  overlapping boolean;
begin
  -- serialize per-provider writes in this tx
  lock_key := booking.uuid_bigint(new.provider_id);
  perform pg_advisory_xact_lock(lock_key);

  -- Treat 'pending_hold' only if hold_expires_at is still in future
  select exists (
    select 1 from booking.appointments a
    where a.provider_id = new.provider_id
      and a.id <> coalesce(new.id, '00000000-0000-0000-0000-000000000000'::uuid)
      and a.during && new.during
      and (
        a.status = 'confirmed'
        or (a.status = 'pending_hold' and a.hold_expires_at is not null and a.hold_expires_at > now())
      )
  ) into overlapping;

  if overlapping then
    raise exception 'Time slot overlaps an existing appointment/hold'
      using errcode = 'unique_violation';
  end if;

  return new;
end$$;

drop trigger if exists trg_no_overlap_ins on booking.appointments;
drop trigger if exists trg_no_overlap_upd on booking.appointments;

create trigger trg_no_overlap_ins
before insert on booking.appointments
for each row execute function booking.prevent_overlap();

create trigger trg_no_overlap_upd
before update on booking.appointments
for each row when (new.start_at is distinct from old.start_at or new.end_at is distinct from old.end_at or new.status is distinct from old.status or new.hold_expires_at is distinct from old.hold_expires_at)
execute function booking.prevent_overlap();

-- RLS
alter table booking.admins enable row level security;
alter table booking.providers enable row level security;
alter table booking.services enable row level security;
alter table booking.provider_services enable row level security;
alter table booking.provider_hours enable row level security;
alter table booking.provider_time_off enable row level security;
alter table booking.appointments enable row level security;
alter table booking.booking_tokens enable row level security;
alter table booking.notifications enable row level security;

-- Helpers
create or replace function booking.is_admin() returns boolean language sql stable as $$
  select exists (select 1 from booking.admins where user_id = auth.uid());
$$;

-- Policies
-- Admins → full access
create policy "admins full providers" on booking.providers
for all using (booking.is_admin()) with check (booking.is_admin());

create policy "admins full services" on booking.services
for all using (booking.is_admin()) with check (booking.is_admin());

create policy "admins full provider_services" on booking.provider_services
for all using (booking.is_admin()) with check (booking.is_admin());

create policy "admins full hours" on booking.provider_hours
for all using (booking.is_admin()) with check (booking.is_admin());

create policy "admins full timeoff" on booking.provider_time_off
for all using (booking.is_admin()) with check (booking.is_admin());

create policy "admins full appointments" on booking.appointments
for all using (booking.is_admin()) with check (booking.is_admin());

create policy "admins full tokens" on booking.booking_tokens
for all using (booking.is_admin()) with check (booking.is_admin());

create policy "admins full notifications" on booking.notifications
for all using (booking.is_admin()) with check (booking.is_admin());

-- Providers → read own appointments & schedules; create/edit own time-off
create policy "providers read self providers row" on booking.providers
for select using (user_id = auth.uid());

create policy "providers read services (needed for UI)" on booking.services
for select using (true);

create policy "providers read own mappings" on booking.provider_services
for select using (exists(select 1 from booking.providers p where p.id = provider_services.provider_id and p.user_id = auth.uid()));

create policy "providers read own hours" on booking.provider_hours
for select using (exists(select 1 from booking.providers p where p.id = provider_hours.provider_id and p.user_id = auth.uid()));

create policy "providers manage own timeoff" on booking.provider_time_off
for all using (exists(select 1 from booking.providers p where p.id = provider_time_off.provider_id and p.user_id = auth.uid()))
with check (exists(select 1 from booking.providers p where p.id = provider_time_off.provider_id and p.user_id = auth.uid()));

create policy "providers read own appointments" on booking.appointments
for select using (exists(select 1 from booking.providers p where p.id = appointments.provider_id and p.user_id = auth.uid()));

-- Public → none (all through service role)
-- (Intentionally no policies for anon on write; no select either.)

-- Sample seed
insert into booking.services (id, name, description, duration_min, buffer_after_min, slot_step_min)
values
  (gen_random_uuid(), 'Initial Assessment (60m)', 'First visit', 60, 10, 15),
  (gen_random_uuid(), 'Follow-up (30m)', 'Standard follow-up', 30, 5, 15)
on conflict do nothing;

-- Create a demo provider (link your user_id later)
-- insert into booking.providers (user_id, full_name, email)
-- values ('<replace-with-auth.users.id>', 'Demo Physio', 'physio@example.com');

-- Hours Mon-Fri 09:00-17:00
-- (Use Africa/Windhoek local clock here)
-- insert into booking.provider_hours (provider_id, day_of_week, start_local, end_local)
-- select '<provider-id>'::uuid, d, '09:00'::time, '17:00'::time from generate_series(1,5) d;
