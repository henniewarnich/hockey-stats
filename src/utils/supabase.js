import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://belveuygzinoipiwanwb.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_Gih7G0mHlluiPd6mJKczdw_Tqq6uqd8';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
