import { DateTime } from 'luxon';
const ZONE = process.env.BOOKING_TIMEZONE || 'Africa/Windhoek';

export const toUTC = (isoLocal: string) =>
  DateTime.fromISO(isoLocal, { zone: ZONE }).toUTC();

export const utcToLocalISO = (utc: string) =>
  DateTime.fromISO(utc, { zone: 'utc' }).setZone(ZONE).toISO();

export const startEndFromLocalStart = (localStartISO: string, durationMin: number, buffers: {before?:number, after?:number}={}) => {
  const start = toUTC(localStartISO);
  const before = buffers.before ?? 0;
  const after  = buffers.after ?? 0;
  const realStart = start.minus({ minutes: before });
  const realEnd = start.plus({ minutes: durationMin + after });
  return { startUTC: realStart.toISO()!, endUTC: realEnd.toISO()! };
};
