import { createClient } from '@supabase/supabase-js';

// These should be in .env, but for quick setup we can use them effectively or passed in.
// In a real app, use import.meta.env.VITE_SUPABASE_URL
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://bdaylbfpthydnffwzjkr.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_rBmG14iRogqt6J6V9tuxFQ_N_tSuKid';

export const supabase = createClient(supabaseUrl, supabaseKey);
