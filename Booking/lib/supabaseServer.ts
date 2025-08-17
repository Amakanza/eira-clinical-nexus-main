import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { Database } from './type';

export function serverClient() {
  const cookieStore = cookies();
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (key: string) => cookieStore.get(key)?.value } }
  );
}
