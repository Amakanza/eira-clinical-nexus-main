import { NextResponse } from 'next/server';
import { adminClient } from '@/lib/supabaseAdmin';

export async function GET() {
  const supa = adminClient();
  const { data, error } = await supa.from('booking.services')
    .select('id,name,description,duration_min,buffer_before_min,buffer_after_min,slot_step_min')
    .eq('is_active', true).order('name');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
