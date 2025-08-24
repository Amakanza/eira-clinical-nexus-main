-- Migration to add created_by column with default auth.uid()
BEGIN;
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS created_by uuid DEFAULT auth.uid();
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS created_by uuid DEFAULT auth.uid();
COMMIT;
