import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

let cached: ReturnType<typeof createClient> | null = null

export function getSupabase() {
  if (!cached) cached = createClient()
  return cached
}