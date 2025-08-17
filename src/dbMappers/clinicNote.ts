// Minimal mapper; DB handles author_id default via auth.uid()
export function mapNoteToDb(input: {
  patientId: string;
  noteType: "assessment" | "treatment_plan" | "reassessment" | "recommendations" | "history" | "findings";
  content: string;
  noteDate?: string; // ISO
}) {
  return {
    patient_id: input.patientId,
    note_type: input.noteType,
    content: input.content,
    note_date: input.noteDate ?? new Date().toISOString(),
  };
}
