import { NextResponse } from 'next/server';
import { z } from 'zod';
import { adminClient } from '@/lib/supabaseAdmin';
import { upsertPatient, PatientInput } from '@/lib/patientsAdapter';
import { DateTime } from 'luxon';
import { opaqueToken } from '@/lib/tokens';
import { appointmentICS } from '@/lib/ics';
import { sendEmail, tplConfirmation } from '@/lib/emails';

const Body = z.object({
  appointment_id: z.string().uuid(),
  patient: PatientInput
});

export async function POST(req: Request) {
  const body = Body.parse(await req.json());
  const supa = adminClient();

  // Fetch appointment (must be a valid hold)
  const { data: appt, error } = await supa.from('booking.appointments')
    .select('id,provider_id,service_id,start_at,end_at,status,hold_expires_at,customer_name,customer_email')
    .eq('id', body.appointment_id).single();
  if (error || !appt) return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
  if (appt.status !== 'pending_hold' || !appt.hold_expires_at || DateTime.fromISO(appt.hold_expires_at) <= DateTime.utc()) {
    return NextResponse.json({ error: 'Hold expired' }, { status: 410 });
  }

  const patientId = await upsertPatient(body.patient);

  // Confirm appointment
  const { error: updErr } = await supa.from('booking.appointments')
    .update({ status: 'confirmed', patient_id: patientId })
    .eq('id', appt.id);
  if (updErr) {
    const msg = updErr.message.includes('overlaps') ? 'Slot just got taken—pick another time' : updErr.message;
    return NextResponse.json({ error: msg }, { status: 409 });
  }

  // Create manage token
  const token = opaqueToken(24);
  const manageUrl = `${process.env.BOOKING_BASE_URL}/book/manage/${token}`;
  const expires = DateTime.fromISO(appt.start_at).plus({ days: 2 }).toUTC().toISO();

  await supa.from('booking.booking_tokens').insert([
    { token, appointment_id: appt.id, scope: 'manage', expires_at: expires }
  ]);

  // Notifications: confirmation now + reminders 24h and 2h
  const zone = process.env.BOOKING_TIMEZONE || 'Africa/Windhoek';
  const whenLocal = DateTime.fromISO(appt.start_at).setZone(zone).toFormat("EEE, dd LLL yyyy 'at' HH:mm");
  const { data: svc } = await supa.from('booking.services').select('name').eq('id', appt.service_id).single();
  const toEmail = body.patient.email ?? appt.customer_email;
  if (toEmail) {
    await supa.from('booking.notifications').insert([
      { appointment_id: appt.id, kind: 'confirmation', scheduled_at: DateTime.utc().toISO(),
        to_email: toEmail, subject: 'Your appointment is confirmed',
        payload: { manageUrl, whenLocal, service: svc?.name ?? 'Appointment' } as any
      },
      { appointment_id: appt.id, kind: 'reminder_24h', scheduled_at: DateTime.fromISO(appt.start_at).minus({ hours: 24 }).toUTC().toISO(),
        to_email: toEmail, subject: 'Appointment reminder (24h)', payload: { whenLocal, service: svc?.name } as any
      },
      { appointment_id: appt.id, kind: 'reminder_2h', scheduled_at: DateTime.fromISO(appt.start_at).minus({ hours: 2 }).toUTC().toISO(),
        to_email: toEmail, subject: 'Appointment reminder (2h)', payload: { whenLocal, service: svc?.name } as any
      }
    ]);
  }

  // Send confirmation immediately with ICS
  if (toEmail) {
    const ics = appointmentICS({
      id: appt.id,
      dtStartUTC: appt.start_at,
      dtEndUTC: appt.end_at,
      summary: svc?.name ?? 'Appointment',
      url: manageUrl
    });
    await sendEmail(
      toEmail,
      'Your appointment is confirmed',
      tplConfirmation({ name: body.patient.first_name, whenLocal, service: svc?.name ?? 'Appointment', manageUrl }),
      { filename: 'appointment.ics', content: ics }
    );
  }

  return NextResponse.json({ ok: true, manage_url: manageUrl, ics_url: `${process.env.BOOKING_BASE_URL}/api/booking/ics/${appt.id}` });
}
