import { createClient } from '@supabase/supabase-js';

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseKey  = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

/**
 * Supabase client menggunakan anon key (read-only, dilindungi RLS).
 * Digunakan frontend untuk subscribe realtime langsung jika diperlukan.
 * Write operations selalu melalui backend FastAPI.
 */
export const supabase = createClient(supabaseUrl, supabaseKey);
