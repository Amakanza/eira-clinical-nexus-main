import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAvailability } from '@/lib/availability';

const Q = z.object({
  provider_id: z.string().uuid(),
  service_id: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
});

export async function GET(req: NextRequest) {
  const p = Object.fromEntries(req.nextUrl.searchParams.entries());
  const q = Q.parse({ provider_id: p.provider_id, service_id: p.service_id, date: p.date });

  const slotsLocal = await getAvailability({
    provider_id: q.provider_id,
    service_id: q.service_id,
    dateISO: q.date
  });

  return NextResponse.json(slotsLocal);
}
