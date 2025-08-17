// Minimal DB type surface used here; run supabase gen types for full
export type UUID = string;

export type Service = {
  id: UUID; name: string; description: string | null;
  duration_min: number; buffer_before_min: number; buffer_after_min: number;
  slot_step_min: number; is_active: boolean;
};

export type Provider = {
  id: UUID; user_id: UUID; full_name: string; email: string; is_active: boolean;
};

export type Appointment = {
  id: UUID; provider_id: UUID; service_id: UUID; patient_id: UUID;
  start_at: string; end_at: string;
  status: 'pending_hold'|'confirmed'|'cancelled'|'noshow'|'completed';
  hold_expires_at: string | null;
  customer_name: string | null; customer_email: string | null; customer_phone: string | null;
};

export type Database = any; // recommend replacing via `supabase gen types typescript`
