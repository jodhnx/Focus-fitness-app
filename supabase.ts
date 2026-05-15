import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xwnrfobzikndpyznpjyr.supabase.co';

const supabaseAnonKey = 'sb_publishable_y8OSFX-_ck7e-WgNqEUyGQ_CtVvRnsE';

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);