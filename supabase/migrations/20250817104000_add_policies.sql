-- Migration to add RLS policies
BEGIN;
-- Patients
DROP POLICY IF EXISTS "patients all for authenticated" ON public.patients;
CREATE POLICY "patients_select_own_or_legacy" ON public.patients
  FOR SELECT TO authenticated
  USING (created_by = auth.uid() OR created_by IS NULL);
CREATE POLICY "patients_ins_own" ON public.patients
  FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid());
CREATE POLICY "patients_upd_del_own" ON public.patients
  FOR UPDATE TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());
CREATE POLICY "patients_del_own" ON public.patients
  FOR DELETE TO authenticated
  USING (created_by = auth.uid());

-- Clinical notes
DROP POLICY IF EXISTS "clinical_notes all for authenticated" ON public.clinical_notes;
CREATE POLICY "notes_select_by_author_or_patient_owner" ON public.clinical_notes
  FOR SELECT TO authenticated
  USING (
    author_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.patients p WHERE p.id = patient_id AND (p.created_by = auth.uid() OR p.created_by IS NULL))
  );
CREATE POLICY "notes_ins_author" ON public.clinical_notes
  FOR INSERT TO authenticated
  WITH CHECK (author_id = auth.uid());
CREATE POLICY "notes_upd_del_author" ON public.clinical_notes
  FOR UPDATE TO authenticated
  USING (author_id = auth.uid())
  WITH CHECK (author_id = auth.uid());

-- Appointments
DROP POLICY IF EXISTS "Allow all operations on appointments" ON public.appointments;
CREATE POLICY "appts_select_own_or_legacy" ON public.appointments
  FOR SELECT TO authenticated
  USING (created_by = auth.uid() OR created_by IS NULL);
CREATE POLICY "appts_ins_own" ON public.appointments
  FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid());
CREATE POLICY "appts_upd_del_own" ON public.appointments
  FOR UPDATE TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());
CREATE POLICY "appts_del_own" ON public.appointments
  FOR DELETE TO authenticated
  USING (created_by = auth.uid());

-- TODO: Backfill created_by for legacy rows and make policies strict later.
COMMIT;
