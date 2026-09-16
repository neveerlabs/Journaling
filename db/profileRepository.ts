import { supabase, requireUserId } from './supabase'
import type { UserProfile } from '@/types'

function fromRow(row: any): UserProfile {
  return {
    id: row.id,
    name: row.name ?? '',
    email: row.email ?? '',
    avatarUrl: row.avatar_url ?? undefined,
    role: row.role ?? 'Product',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export const profileRepository = {
  async getMine(): Promise<UserProfile> {
    const userId = await requireUserId()
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()
    if (error) throw error
    if (data) return fromRow(data)

    const { data: userData } = await supabase.auth.getUser()
    const fallback: UserProfile = {
      id: userId,
      name:
        userData.user?.user_metadata?.full_name ??
        userData.user?.email?.split('@')[0] ??
        'User',
      email: userData.user?.email ?? '',
      avatarUrl: userData.user?.user_metadata?.avatar_url,
      role: 'Product',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    const { error: insErr } = await supabase.from('profiles').insert({
      id: fallback.id,
      name: fallback.name,
      email: fallback.email,
      avatar_url: fallback.avatarUrl ?? null,
      role: fallback.role,
    })
    if (insErr) throw insErr
    return fallback
  },

  async update(updates: Partial<Pick<UserProfile, 'name' | 'role' | 'avatarUrl'>>) {
    const userId = await requireUserId()
    const payload: Record<string, any> = { updated_at: Date.now() }
    if (updates.name !== undefined) payload.name = updates.name
    if (updates.role !== undefined) payload.role = updates.role
    if (updates.avatarUrl !== undefined) payload.avatar_url = updates.avatarUrl ?? null
    const { data, error } = await supabase
      .from('profiles')
      .update(payload)
      .eq('id', userId)
      .select()
      .maybeSingle()
    if (error) throw error
    return data ? fromRow(data) : null
  },
}