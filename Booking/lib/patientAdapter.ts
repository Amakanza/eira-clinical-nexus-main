import { adminClient } from './supabaseAdmin';
import { z } from 'zod';

const cfg = {
  table: process.env.EIRA_PATIENTS_TABLE || 'public.patients',
  idCol: process.env.EIRA_PATIENTS_ID_COLUMN || 'id',
};

export const PatientInput = z.object({
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().optional(),
});

export type PatientInput = z.infer<typeof PatientInput>;

export async function upsertPatient(input: PatientInput) {
  const supa = adminClient();
  // Try by email/phone if provided; otherwise create.
  let existingId: string | null = null;
  if (input.email) {
    const { data } = await supa.from(cfg.table as any)
      .select(`${cfg.idCol}`).eq('email', input.email).limit(1).maybeSingle();
    existingId = (data as any)?.[cfg.idCol] ?? null;
  }
  if (!existingId && input.phone) {
    const { data } = await supa.from(cfg.table as any)
      .select(`${cfg.idCol}`).eq('phone', input.phone).limit(1).maybeSingle();
    existingId = (data as any)?.[cfg.idCol] ?? null;
  }
  if (existingId) return existingId;

  const insertObj: any = {
    first_name: input.first_name,
    last_name: input.last_name,
    email: input.email ?? null,
    phone: input.phone ?? null,
  };

  const { data: created, error } = await supa.from(cfg.table as any)
    .insert(insertObj).select().single();
  if (error) throw error;
  return created[cfg.idCol];
}
