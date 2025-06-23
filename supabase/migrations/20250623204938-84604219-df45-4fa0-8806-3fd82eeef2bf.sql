
-- Create patients table for storing patient information
CREATE TABLE public.patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_name TEXT NOT NULL,
  case_number TEXT UNIQUE,
  occupation TEXT,
  date_of_birth DATE,
  referring_dr TEXT,
  date_of_initial_ax DATE,
  case_manager TEXT,
  facility TEXT,
  physiotherapist TEXT,
  diagnosis TEXT,
  medical_aid TEXT,
  medical_aid_number TEXT,
  home_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create clinical notes table for storing patient notes
CREATE TABLE public.clinical_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  note_type TEXT NOT NULL CHECK (note_type IN ('assessment', 'treatment_plan', 'reassessment', 'recommendations', 'history', 'findings')),
  content TEXT NOT NULL,
  note_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create joint range of motion measurements table
CREATE TABLE public.joint_measurements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  joint TEXT NOT NULL,
  initial_rom TEXT,
  current_rom TEXT,
  reassessment_1_rom TEXT,
  reassessment_2_rom TEXT,
  reassessment_3_rom TEXT,
  comment TEXT,
  measurement_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create muscle strength measurements table
CREATE TABLE public.muscle_strength (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  muscle_group TEXT NOT NULL,
  initial_strength TEXT,
  current_strength TEXT,
  reassessment_1_strength TEXT,
  reassessment_2_strength TEXT,
  reassessment_3_strength TEXT,
  comment TEXT,
  measurement_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create activities of daily living table
CREATE TABLE public.activities_daily_living (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  activity TEXT NOT NULL,
  initial_level TEXT,
  current_level TEXT,
  reassessment_1_level TEXT,
  reassessment_2_level TEXT,
  reassessment_3_level TEXT,
  comment TEXT,
  assessment_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinical_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.joint_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.muscle_strength ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities_daily_living ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (for now, allow all operations - you can restrict these later)
CREATE POLICY "Allow all operations on patients" ON public.patients FOR ALL USING (true);
CREATE POLICY "Allow all operations on clinical_notes" ON public.clinical_notes FOR ALL USING (true);
CREATE POLICY "Allow all operations on joint_measurements" ON public.joint_measurements FOR ALL USING (true);
CREATE POLICY "Allow all operations on muscle_strength" ON public.muscle_strength FOR ALL USING (true);
CREATE POLICY "Allow all operations on activities_daily_living" ON public.activities_daily_living FOR ALL USING (true);

-- Insert some sample data for testing
INSERT INTO public.patients (patient_name, case_number, occupation, date_of_birth, referring_dr, facility, physiotherapist, diagnosis) VALUES
('John Smith', 'MVA001', 'Engineer', '1985-03-15', 'Dr. Johnson', 'Central Physiotherapy', 'Jane Doe', 'Lower back pain'),
('Mary Wilson', 'GEN002', 'Teacher', '1978-07-22', 'Dr. Brown', 'Health Center', 'Bob Smith', 'Shoulder impingement');

-- Insert sample clinical notes
INSERT INTO public.clinical_notes (patient_id, note_type, content, note_date) VALUES
((SELECT id FROM public.patients WHERE case_number = 'MVA001'), 'assessment', 'Patient presents with acute lower back pain following motor vehicle accident. Pain rated 7/10 on VAS scale.', '2024-01-15'),
((SELECT id FROM public.patients WHERE case_number = 'MVA001'), 'treatment_plan', 'Commence with gentle mobilization exercises and pain management techniques.', '2024-01-15'),
((SELECT id FROM public.patients WHERE case_number = 'GEN002'), 'assessment', 'Patient reports gradual onset shoulder pain with overhead activities.', '2024-01-20');
