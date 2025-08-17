import { NextResponse } from 'next/server';
import { z } from 'zod';
import { adminClient } from '@/lib/supabaseAdmin';
import { DateTime } from 'luxon';

const Body = z.object({
  provider_id: z.string().uuid(),
  service_id: z.string().uuid(),
  start_local: z.string(), // ISO in Africa/Windhoek (UI sends slot)
  customer_name: z.string().min(1),
  customer_email: z.string().email().optional(),
  customer_phone: z.string().optional()
});

export async function POST(req: Request) {
  const body = Body.parse(await req.json());
  const supa = adminClient();

  const holdMinutes = Number(process.env.BOOKING_HOLD_MINUTES || 15);

  const { data: svc, error: svcErr } = await supa.from('booking.services')
    .select('duration_min,buffer_before_min,buffer_after_min,name').eq('id', body.service_id).single();
  if (svcErr || !svc) return NextResponse.json({ error: 'Service not found' }, { status: 404 });

  const zone = process.env.BOOKING_TIMEZONE || 'Africa/Windhoek';
  const startLocal = DateTime.fromISO(body.start_local, { zone });
  const startUTC = startLocal.minus({ minutes: svc.buffer_before_min }).toUTC();
  const endUTC = startLocal.plus({ minutes: svc.duration_min + svc.buffer_after_min }).toUTC();

  // transactional insert
  const { data, error } = await supa.rpc('graphql', {}); // noop to keep client alive
  // (Supabase JS doesn't expose SQL tx; rely on DB trigger + advisory locks for race-safety)

  const { data: appt, error: insErr } = await supa.from('booking.appointments').insert({
    provider_id: body.provider_id,
    service_id: body.service_id,
    patient_id: '00000000-0000-0000-0000-000000000000', // placeholder until confirm
    start_at: startUTC.toISO(),
    end_at: endUTC.toISO(),
    status: 'pending_hold',
    hold_expires_at: DateTime.utc().plus({ minutes: holdMinutes }).toISO(),
    customer_name: body.customer_name,
    customer_email: body.customer_email ?? null,
    customer_phone: body.customer_phone ?? null
  }).select('id,start_at,end_at').single();

  if (insErr) {
    const msg = insErr.message.includes('overlaps') ? 'Slot just got taken—pick another time' : insErr.message;
    return NextResponse.json({ error: msg }, { status: 409 });
  }
  return NextResponse.json({ appointment_id: appt.id });
}
