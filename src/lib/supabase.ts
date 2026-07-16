import { createClient } from '@supabase/supabase-js'

const supabaseUrl     = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

// Anon key — used only for auth (sign in / sign out / session)
// Never used for data queries; all data goes through polaris-api (service role)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
