-- Create users table for clinicians and staff
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  username TEXT UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'clinician', 'supervisor')),
  department TEXT,
  license TEXT,
  signature TEXT,
  initials TEXT,
  clinician_color TEXT,
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create rooms table
CREATE TABLE public.rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 4,
  is_gym BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create time_slots table
CREATE TABLE public.time_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_early_morning BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create special_events table
CREATE TABLE public.special_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  start_date_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date_time TIMESTAMP WITH TIME ZONE NOT NULL,
  clinician_ids UUID[] DEFAULT '{}',
  event_type TEXT NOT NULL CHECK (event_type IN ('meeting', 'leave', 'training', 'other')),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create appointments table
CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  patient_name TEXT NOT NULL,
  clinician_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  clinician_name TEXT,
  appointment_date DATE NOT NULL,
  time_slot_id UUID REFERENCES public.time_slots(id) ON DELETE SET NULL,
  custom_start_time TIME,
  custom_end_time TIME,
  duration INTEGER NOT NULL DEFAULT 40,
  appointment_type TEXT NOT NULL CHECK (appointment_type IN ('consultation', 'follow-up', 'procedure', 'emergency', 'early-morning')),
  status TEXT NOT NULL CHECK (status IN ('scheduled', 'in-progress', 'completed', 'cancelled', 'no-show')) DEFAULT 'scheduled',
  room_id UUID REFERENCES public.rooms(id) ON DELETE SET NULL,
  room_name TEXT,
  notes TEXT,
  additional_info TEXT,
  created_by TEXT,
  updated_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.special_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allow all operations for now)
CREATE POLICY "Allow all operations on users" ON public.users FOR ALL USING (true);
CREATE POLICY "Allow all operations on rooms" ON public.rooms FOR ALL USING (true);
CREATE POLICY "Allow all operations on time_slots" ON public.time_slots FOR ALL USING (true);
CREATE POLICY "Allow all operations on special_events" ON public.special_events FOR ALL USING (true);
CREATE POLICY "Allow all operations on appointments" ON public.appointments FOR ALL USING (true);

-- Insert default rooms
INSERT INTO public.rooms (id, name, capacity, is_gym) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Treatment Room 1', 4, false),
  ('550e8400-e29b-41d4-a716-446655440002', 'Treatment Room 2', 4, false),
  ('550e8400-e29b-41d4-a716-446655440003', 'Treatment Room 3', 4, false),
  ('550e8400-e29b-41d4-a716-446655440004', 'Treatment Room 4', 4, false),
  ('550e8400-e29b-41d4-a716-446655440005', 'Gym', 10, true);

-- Insert default time slots
INSERT INTO public.time_slots (id, start_time, end_time, is_early_morning) VALUES
  ('650e8400-e29b-41d4-a716-446655440001', '09:20', '10:00', false),
  ('650e8400-e29b-41d4-a716-446655440002', '10:00', '10:40', false),
  ('650e8400-e29b-41d4-a716-446655440003', '10:40', '11:20', false),
  ('650e8400-e29b-41d4-a716-446655440004', '11:20', '12:00', false),
  ('650e8400-e29b-41d4-a716-446655440005', '12:00', '12:40', false),
  ('650e8400-e29b-41d4-a716-446655440006', '12:40', '13:20', false),
  ('650e8400-e29b-41d4-a716-446655440007', '13:20', '14:00', false),
  ('650e8400-e29b-41d4-a716-446655440008', '14:00', '14:40', false),
  ('650e8400-e29b-41d4-a716-446655440009', '14:40', '15:20', false),
  ('650e8400-e29b-41d4-a716-446655440010', '15:20', '16:00', false);

-- Insert default clinicians
INSERT INTO public.users (id, email, first_name, last_name, username, role, department, license, initials, clinician_color, is_active) VALUES
  ('750e8400-e29b-41d4-a716-446655440001', 'sarah@clinic.com', 'Dr. Sarah', 'Thompson', 'sthompson', 'clinician', 'Physiotherapy', 'PT12345', 'ST', '#3B82F6', true),
  ('750e8400-e29b-41d4-a716-446655440002', 'michael@clinic.com', 'Dr. Michael', 'Wilson', 'mwilson', 'supervisor', 'Clinical Services', 'MD67890', 'MW', '#EF4444', true);

-- Insert sample appointment (fixed to work with new patients schema)
INSERT INTO public.appointments (id, patient_id, patient_name, clinician_id, clinician_name, appointment_date, time_slot_id, duration, appointment_type, status, room_id, room_name, notes, created_by, updated_by) VALUES
  ('850e8400-e29b-41d4-a716-446655440001', 
   NULL, -- Set to NULL since we don't have a John Smith patient in the new schema
   'John Smith', 
   '750e8400-e29b-41d4-a716-446655440001', 
   'Dr. Sarah Thompson', 
   '2025-06-24', 
   '650e8400-e29b-41d4-a716-446655440001', 
   40, 
   'consultation', 
   'scheduled', 
   '550e8400-e29b-41d4-a716-446655440001', 
   'Treatment Room 1', 
   'Initial consultation', 
   '750e8400-e29b-41d4-a716-446655440001', 
   '750e8400-e29b-41d4-a716-446655440001');

-- Create indexes for better performance
CREATE INDEX idx_appointments_date ON public.appointments(appointment_date);
CREATE INDEX idx_appointments_clinician ON public.appointments(clinician_id);
CREATE INDEX idx_appointments_patient ON public.appointments(patient_id);
CREATE INDEX idx_appointments_status ON public.appointments(status);
CREATE INDEX idx_special_events_date ON public.special_events(start_date_time, end_date_time);
