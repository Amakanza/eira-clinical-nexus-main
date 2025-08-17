-- Enable extension for gen_random_uuid()
create extension if not exists "pgcrypto";

drop table if exists public.patients cascade;

create table public.patients (
  id uuid primary key default gen_random_uuid(),
  mrn text unique not null,
  first_name text not null,
  last_name text not null,
  date_of_birth date not null,
  gender text check (gender in ('male','female','other','unknown')) not null,
  id_number text not null,
  phone text,
  cell_number text,
  email text,
  occupation text,
  dependent_code text,

  medical_aid_name text,
  medical_aid_number text,
  medical_aid_id text,
  main_member_id_number text,
  bank text,
  bank_account_number text,
  main_member_occupation text,
  employer_name text,
  referring_doctor text,
  family_doctor text,

  street text,
  city text,

  next_of_kin1_name text,
  next_of_kin1_relationship text,
  next_of_kin1_phone text,

  next_of_kin2_name text,
  next_of_kin2_relationship text,
  next_of_kin2_phone text,

  allergies text,
  medications text,
  medical_history text,

  last_visit timestamptz,
  status text check (status in ('active','inactive','deceased')) default 'active',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.patients enable row level security;

-- Dev-only: allow all ops for authenticated users
create policy "patients all for authenticated"
on public.patients
for all
to authenticated
using (true)
with check (true);

-- Updated-at trigger
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_patients_updated_at
before update on public.patients
for each row execute function update_updated_at_column();

-- Helpful indexes
create index idx_patients_mrn on public.patients(mrn);
create index idx_patients_last_name on public.patients(last_name);
create index idx_patients_first_name on public.patients(first_name);
create index idx_patients_id_number on public.patients(id_number);
create index idx_patients_status on public.patients(status);
create index idx_patients_dob on public.patients(date_of_birth);
