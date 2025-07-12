-- Make patient_id nullable to allow appointments for patients not in database
ALTER TABLE public.appointments 
ALTER COLUMN patient_id DROP NOT NULL;

-- Add a constraint to ensure either patient_id or patient_name is provided
ALTER TABLE public.appointments 
ADD CONSTRAINT check_patient_info 
CHECK (patient_id IS NOT NULL OR (patient_name IS NOT NULL AND patient_name != ''));