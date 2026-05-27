import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

function isSupabaseModeEnabled() {
  if (typeof window === 'undefined') return true

  try {
    const raw = window.localStorage.getItem('storage-settings-v1')
    if (!raw) return false
    const parsed = JSON.parse(raw)
    return parsed?.state?.storageMode === 'supabase' || parsed?.state?.cloudSyncEnabled === true
  } catch {
    return false
  }
}

export const hasSupabaseEnvironment = Boolean(supabaseUrl && supabaseAnonKey)
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey && isSupabaseModeEnabled())

if (!hasSupabaseEnvironment && typeof window !== 'undefined') {
  console.warn('Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel environment variables.')
}

if (hasSupabaseEnvironment && !isSupabaseConfigured && typeof window !== 'undefined') {
  console.info('Supabase sync is available but disabled by the selected storage mode.')
}

export const supabase = createClient(
  supabaseUrl ?? 'https://not-configured.supabase.co',
  supabaseAnonKey ?? 'not-configured-anon-key'
)
