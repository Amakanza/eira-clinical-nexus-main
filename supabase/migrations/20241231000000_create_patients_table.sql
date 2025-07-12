-- Create patients table first - Updated to match PatientForm.tsx fields
DROP TABLE IF EXISTS public.patients CASCADE;

CREATE TABLE public.patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mrn TEXT UNIQUE NOT NULL, -- Medical Record Number
  firstName TEXT NOT NULL,  -- Changed from first_name
  lastName TEXT NOT NULL,   -- Changed from last_name
  dateOfBirth DATE NOT NULL, -- Changed from date_of_birth
  gender TEXT CHECK (gender IN ('male', 'female', 'other', 'unknown')) NOT NULL,
  idNumber TEXT NOT NULL,   -- Changed from id_number
  phone TEXT,
  cellNumber TEXT,          -- Changed from cell_number
  email TEXT,
  occupation TEXT,
  dependentCode TEXT,       -- Changed from dependent_code
  
  -- Main Member fields (individual columns instead of JSONB)
  medicalAidName TEXT,
  medicalAidNumber TEXT,
  medicalAidId TEXT,
  mainMemberIdNumber TEXT,
  bank TEXT,
  bankAccountNumber TEXT,
  mainMemberOccupation TEXT,
  employerName TEXT,
  referringDoctor TEXT,
  familyDoctor TEXT,
  
  -- Address fields (individual columns instead of JSONB)
  street TEXT,
  city TEXT,
  
  -- Next of Kin 1 fields (individual columns instead of JSONB)
  nextOfKin1Name TEXT,
  nextOfKin1Relationship TEXT,
  nextOfKin1Phone TEXT,
  
  -- Next of Kin 2 fields (individual columns instead of JSONB)
  nextOfKin2Name TEXT,
  nextOfKin2Relationship TEXT,
  nextOfKin2Phone TEXT,
  
  -- Medical information (as TEXT to match form, can be converted to arrays later)
  allergies TEXT,           -- Form expects comma-separated string
  medications TEXT,         -- Form expects comma-separated string
  medicalHistory TEXT,      -- Form expects comma-separated string
  
  -- System fields
  lastVisit TIMESTAMP WITH TIME ZONE, -- Changed from last_visit
  status TEXT CHECK (status IN ('active', 'inactive', 'deceased')) DEFAULT 'active',
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(), -- Changed from created_at
  updatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()  -- Changed from updated_at
);

-- Enable Row Level Security
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

-- Create RLS policy
CREATE POLICY "Allow all operations on patients" ON public.patients FOR ALL USING (true);

-- Create indexes for better performance
CREATE INDEX idx_patients_mrn ON public.patients(mrn);
CREATE INDEX idx_patients_lastName ON public.patients(lastName);
CREATE INDEX idx_patients_firstName ON public.patients(firstName);
CREATE INDEX idx_patients_idNumber ON public.patients(idNumber);
CREATE INDEX idx_patients_status ON public.patients(status);
CREATE INDEX idx_patients_dateOfBirth ON public.patients(dateOfBirth);

-- Create a function to automatically update the updatedAt timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updatedAt = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updatedAt
CREATE TRIGGER update_patients_updatedAt BEFORE UPDATE ON public.patients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();