-- Adjusted schema for patients, clinical notes, and related measurement tables
-- Convention: DB = snake_case; frontend maps at the boundary

-- Extensions ---------------------------------------------------------------
create extension if not exists "pgcrypto";

-- Drops (order: children -> parent) ---------------------------------------
drop table if exists public.activities_daily_living cascade;
drop table if exists public.muscle_strength cascade;
drop table if exists public.joint_measurements cascade;
drop table if exists public.clinical_notes cascade;
drop table if exists public.patients cascade;

-- Patients -----------------------------------------------------------------
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

  allergies text,
  medications text,
  medical_history text,

  last_visit timestamptz,
  status text check (status in ('active','inactive','deceased')) default 'active',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Clinical notes -----------------------------------------------------------
create table public.clinical_notes (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  note_type text not null check (note_type in (
    'assessment', 'treatment_plan', 'reassessment', 'recommendations', 'history', 'findings'
  )),
  content text not null,
  note_date timestamptz not null default now(),
  author_id uuid not null default auth.uid(),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Joint measurements -------------------------------------------------------
create table public.joint_measurements (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  joint text not null,
  initial_rom text,
  current_rom text,
  reassessment_1_rom text,
  reassessment_2_rom text,
  reassessment_3_rom text,
  comment text,
  measurement_date date default current_date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Muscle strength ----------------------------------------------------------
create table public.muscle_strength (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  muscle_group text not null,
  initial_strength text,
  current_strength text,
  reassessment_1_strength text,
  reassessment_2_strength text,
  reassessment_3_strength text,
  comment text,
  measurement_date date default current_date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Activities of daily living ----------------------------------------------
create table public.activities_daily_living (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  activity text not null,
  initial_level text,
  current_level text,
  reassessment_1_level text,
  reassessment_2_level text,
  reassessment_3_level text,
  comment text,
  assessment_date date default current_date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS ----------------------------------------------------------------------
alter table public.patients enable row level security;
alter table public.clinical_notes enable row level security;
alter table public.joint_measurements enable row level security;
alter table public.muscle_strength enable row level security;
alter table public.activities_daily_living enable row level security;

-- Dev policies: allow all ops for authenticated users (tighten later)
create policy "patients all for authenticated" on public.patients for all to authenticated using (true) with check (true);
create policy "clinical_notes all for authenticated" on public.clinical_notes for all to authenticated using (true) with check (true);
create policy "joint_measurements all for authenticated" on public.joint_measurements for all to authenticated using (true) with check (true);
create policy "muscle_strength all for authenticated" on public.muscle_strength for all to authenticated using (true) with check (true);
create policy "adl all for authenticated" on public.activities_daily_living for all to authenticated using (true) with check (true);

-- updated_at trigger -------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_patients_updated_at
before update on public.patients
for each row execute function public.set_updated_at();

create trigger trg_clinical_notes_updated_at
before update on public.clinical_notes
for each row execute function public.set_updated_at();

create trigger trg_joint_measurements_updated_at
before update on public.joint_measurements
for each row execute function public.set_updated_at();

create trigger trg_muscle_strength_updated_at
before update on public.muscle_strength
for each row execute function public.set_updated_at();

create trigger trg_adl_updated_at
before update on public.activities_daily_living
for each row execute function public.set_updated_at();

-- Indexes ------------------------------------------------------------------
create index idx_patients_mrn on public.patients(mrn);
create index idx_patients_last_name on public.patients(last_name);
create index idx_patients_first_name on public.patients(first_name);
create index idx_patients_id_number on public.patients(id_number);
create index idx_patients_status on public.patients(status);
create index idx_patients_dob on public.patients(date_of_birth);

create index idx_notes_patient on public.clinical_notes(patient_id);
create index idx_notes_author on public.clinical_notes(author_id);
create index idx_notes_date on public.clinical_notes(note_date);

create index idx_joint_patient on public.joint_measurements(patient_id);
create index idx_muscle_patient on public.muscle_strength(patient_id);
create index idx_adl_patient on public.activities_daily_living(patient_id);

-- Sample data --------------------------------------------------------------
insert into public.patients (
  mrn, first_name, last_name, date_of_birth, gender, id_number, occupation, employer_name, referring_doctor
) values
('MVA001', 'John', 'Smith', '1985-03-15', 'male', '8503151234088', 'Engineer', 'Central Physiotherapy', 'Dr. Johnson'),
('GEN002', 'Mary', 'Wilson', '1978-07-22', 'female', '7807221234088', 'Teacher', 'Health Center', 'Dr. Brown');

insert into public.clinical_notes (patient_id, note_type, content, note_date)
values
((select id from public.patients where mrn = 'MVA001'), 'assessment', 'Patient presents with acute lower back pain following motor vehicle accident. Pain rated 7/10 on VAS scale.', '2024-01-15T08:00:00Z'),
((select id from public.patients where mrn = 'MVA001'), 'treatment_plan', 'Commence with gentle mobilization exercises and pain management techniques.', '2024-01-15T08:30:00Z'),
((select id from public.patients where mrn = 'GEN002'), 'assessment', 'Patient reports gradual onset shoulder pain with overhead activities.', '2024-01-20T09:00:00Z');
