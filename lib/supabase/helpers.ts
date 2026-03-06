import { createClient } from '@/lib/supabase/server'

type SupabaseClient = Awaited<ReturnType<typeof createClient>>

/**
 * Get the user's family_id from family_members.
 * Returns null if the user has no family membership.
 */
export async function getFamilyId(supabase: SupabaseClient, userId: string): Promise<string | null> {
  const { data } = await supabase
    .from('family_members')
    .select('family_id')
    .eq('user_id', userId)
    .single()
  return data?.family_id || null
}

/**
 * Get the user's family_id and role from family_members.
 * Returns null if the user has no family membership.
 */
export async function getMembership(supabase: SupabaseClient, userId: string) {
  const { data } = await supabase
    .from('family_members')
    .select('family_id, role')
    .eq('user_id', userId)
    .single()
  return data
}
