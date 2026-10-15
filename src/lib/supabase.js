import { createClient } from '@supabase/supabase-js'

// Publishable key: RLS only allows inserting assessment requests, not reading them
export const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY)
