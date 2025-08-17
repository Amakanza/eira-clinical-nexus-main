import { adminClient } from './supabaseAdmin';
import { DateTime, Interval } from 'luxon';

type Args = {
  provider_id: string;
  service_id: string;
  dateISO: string; // YYYY-MM-DD
  slotStepMin?: number;
  leadTimeMin?: number;
  zone?: string;
};
export async function getAvailability(args: Args) {
  const zone = args.zone || process.env.BOOKING_TIMEZONE || 'Africa/Windhoek';
  const supa = adminClient();
  // Get service, buffers, slot step
  const { data: svc } = await supa.from('booking.services')
    .select('id,duration_min,buffer_before_min,buffer_after_min,slot_step_min,is_active,name')
    .eq('id', args.service_id).single();
  if (!svc || !svc.is_active) return [];
  const slotStep = args.slotStepMin ?? svc.slot_step_min;

  // Provider hours for the day (local)
  const date = DateTime.fromISO(args.dateISO, { zone });
  const dow = date.weekday % 7; // Luxon: 1=Mon..7=Sun -> convert to 0..6 with Sun=0
  const dow0 = (dow === 7 ? 0 : dow); // Sun=0
  const { data: hours } = await supa.from('booking.provider_hours')
    .select('start_local,end_local,is_open')
    .eq('provider_id', args.provider_id).eq('day_of_week', dow0);
  if (!hours || hours.length === 0 || !hours[0].is_open) return [];

  // window in local zone
  const h = hours[0];
  const dayStartLocal = date.set({ hour: h.start_local.split(':')[0] as any, minute: h.start_local.split(':')[1] as any, second: 0, millisecond:0 });
  const dayEndLocal   = date.set({ hour: h.end_local.split(':')[0] as any, minute: h.end_local.split(':')[1] as any, second:0, millisecond:0 });
  let cursor = dayStartLocal;

  // Lead time
  const leadMin = args.leadTimeMin ?? Number(process.env.BOOKING_LEAD_TIME_MINUTES || 120);
  const nowLocalLead = DateTime.now().setZone(zone).plus({ minutes: leadMin });

  // Fetch provider time-off and existing appts (overlapping)
  const dayStartUTC = dayStartLocal.toUTC();
  const dayEndUTC = dayEndLocal.toUTC();
  const { data: offs } = await supa.from('booking.provider_time_off')
    .select('start_at,end_at')
    .eq('provider_id', args.provider_id)
    .or(`and(start_at.lt.${dayEndUTC.toISO()},end_at.gt.${dayStartUTC.toISO()})`);
  const offIntervals = (offs||[]).map(o => Interval.fromDateTimes(DateTime.fromISO(o.start_at), DateTime.fromISO(o.end_at)));

  const { data: appts } = await supa.from('booking.appointments')
    .select('start_at,end_at,status,hold_expires_at')
    .eq('provider_id', args.provider_id)
    .or(`and(start_at.lt.${dayEndUTC.toISO()},end_at.gt.${dayStartUTC.toISO()})`);
  const blocks = (appts||[])
    .filter(a => a.status === 'confirmed' || (a.status === 'pending_hold' && a.hold_expires_at && DateTime.fromISO(a.hold_expires_at) > DateTime.utc()))
    .map(a => Interval.fromDateTimes(DateTime.fromISO(a.start_at), DateTime.fromISO(a.end_at)));

  const dur = svc.duration_min;
  const before = svc.buffer_before_min;
  const after = svc.buffer_after_min;

  const slots:string[] = [];
  while (cursor <= dayEndLocal.minus({ minutes: dur })) {
    // respect lead-time
    if (cursor < nowLocalLead) { cursor = cursor.plus({ minutes: slotStep }); continue; }
    const { startUTC, endUTC } = (() => {
      const start = cursor.minus({ minutes: before }).toUTC();
      const end = cursor.plus({ minutes: dur + after }).toUTC();
      return { startUTC: start, endUTC: end };
    })();

    const candidate = Interval.fromDateTimes(startUTC, endUTC);
    const overlapsOff = offIntervals.some(i => i.overlaps(candidate));
    const overlapsAppt = blocks.some(i => i.overlaps(candidate));

    if (!overlapsOff && !overlapsAppt) {
      slots.push(cursor.toISO());
    }
    cursor = cursor.plus({ minutes: slotStep });
  }
  return slots; // ISO strings in local zone
}
