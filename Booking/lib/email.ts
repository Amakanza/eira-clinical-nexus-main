import { Resend } from 'resend';
const resend = new Resend(process.env.RESEND_API_KEY!);
const FROM = process.env.EMAIL_FROM!;

export async function sendEmail(to: string, subject: string, html: string, ics?: {filename:string, content:string}) {
  const attachments = ics ? [{ filename: ics.filename, content: Buffer.from(ics.content) }] : undefined;
  await resend.emails.send({ from: FROM, to, subject, html, attachments });
}

export function tplConfirmation(p: {name: string; whenLocal: string; service: string; manageUrl: string}) {
  return `
    <h2>Booking confirmed</h2>
    <p>Hi ${p.name}, your ${p.service} is confirmed for <strong>${p.whenLocal}</strong>.</p>
    <p>Manage (reschedule/cancel): <a href="${p.manageUrl}">${p.manageUrl}</a></p>
  `;
}
export function tplReminder(p: {name:string; whenLocal:string; service:string}) {
  return `<p>Reminder: ${p.service} at <strong>${p.whenLocal}</strong>. See you soon!</p>`;
}
