import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hybuhazzuvwtrfzomxcl.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_ibpj90e7JjahMmqWFKH7CQ_EjEGT1tn';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
