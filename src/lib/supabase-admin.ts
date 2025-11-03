import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL is not configured.');
}

if (!serviceKey) {
  console.warn(
    'SUPABASE_SERVICE_ROLE_KEY is not configured. Storage uploads via API will fail.'
  );
}

export const supabaseAdmin = serviceKey
  ? createClient(supabaseUrl, serviceKey, {
      auth: {
        persistSession: false,
      },
    })
  : null;
