import { DateTime } from 'luxon';
export function appointmentICS(opts: {
  id: string; dtStartUTC: string; dtEndUTC: string;
  summary: string; description?: string; location?: string; url?: string;
}) {
  const dt = (s: string) => DateTime.fromISO(s, { zone:'utc' }).toFormat("yyyyMMdd'T'HHmmss'Z'");
  const uid = opts.id + '@eira';
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Eira//Booking//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${dt(new Date().toISOString())}`,
    `DTSTART:${dt(opts.dtStartUTC)}`,
    `DTEND:${dt(opts.dtEndUTC)}`,
    `SUMMARY:${escapeICSText(opts.summary)}`,
    opts.description ? `DESCRIPTION:${escapeICSText(opts.description)}` : '',
    opts.location ? `LOCATION:${escapeICSText(opts.location)}` : '',
    opts.url ? `URL:${opts.url}` : '',
    'END:VEVENT',
    'END:VCALENDAR',
  ].filter(Boolean).join('\r\n');
}
function escapeICSText(s: string) {
  return s.replace(/\\/g,'\\\\').replace(/\n/g,'\\n').replace(/,|;|:/g, m => '\\'+m);
}
