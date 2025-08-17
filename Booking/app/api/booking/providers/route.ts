import { NextRequest, NextResponse } from 'next/server';
import { adminClient } from '@/lib/supabaseAdmin';
import { z } from 'zod';

const Q = z.object({ service_id: z.string().uuid().optional() });

export async function GET(req: NextRequest) {
  const supa = adminClient();
  const params = Object.fromEntries(req.nextUrl.searchParams.entries());
  const q = Q.parse(params);

  let query = supa.from('booking.providers').select('id,full_name,email,is_active').eq('is_active', true);
  if (q.service_id) {
    query = query.in('id',
      (await supa.from('booking.provider_services').select('provider_id').eq('service_id', q.service_id)).data?.map(r => r.provider_id) ?? []
    );
  }
  const { data, error } = await query.order('full_name');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
