import { NextResponse } from 'next/server';
import { z } from 'zod';
import { adminClient } from '@/lib/supabaseAdmin';
import { DateTime } from 'luxon';

const Body = z.object({
  appointment_id: z.string().uuid().optional(),
  token: z.string().optional()
}).refine(v => v.appointment_id || v.token, { message: 'appointment_id or token required' });

export async function POST(req: Request) {
  const body = Body.parse(await req.json());
  const supa = adminClient();

  let apptId: string | null = null;
  if (body.token) {
    const { data: tok } = await supa.from('booking.booking_tokens')
      .select('appointment_id,expires_at,scope').eq('token', body.token).maybeSingle();
    if (!tok || tok.scope not in ('manage','cancel') || DateTime.fromISO(tok.expires_at) <= DateTime.utc()) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }
    apptId = tok.appointment_id;
  } else {
    apptId = body.appointment_id!;
  }

  const { error } = await supa.from('booking.appointments').update({ status: 'cancelled' }).eq('id', apptId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
