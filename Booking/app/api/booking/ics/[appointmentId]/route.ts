import { NextRequest, NextResponse } from 'next/server';
import { adminClient } from '@/lib/supabaseAdmin';
import { appointmentICS } from '@/lib/ics';

export async function GET(_req: NextRequest, { params }: { params: { appointmentId: string }}) {
  const supa = adminClient();
  const { data: a } = await supa.from('booking.appointments').select('id,start_at,end_at,service_id').eq('id', params.appointmentId).single();
  if (!a) return new NextResponse('Not found', { status: 404 });
  const { data: svc } = await supa.from('booking.services').select('name').eq('id', a.service_id).single();
  const ics = appointmentICS({ id: a.id, dtStartUTC: a.start_at, dtEndUTC: a.end_at, summary: svc?.name ?? 'Appointment' });
  return new NextResponse(ics, {
    headers: { 'Content-Type': 'text/calendar; charset=utf-8', 'Content-Disposition': `attachment; filename="appointment-${a.id}.ics"` }
  });
}
