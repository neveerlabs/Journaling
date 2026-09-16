import { supabase, requireUserId, makeId } from './supabase'
import type { TeamMember } from '@/types'

function fromRow(row: any): TeamMember {
  return {
    id: row.id,
    name: row.name,
    role: row.role ?? '',
    department: row.department ?? undefined,
    email: row.email ?? undefined,
    avatar: row.avatar ?? undefined,
    createdAt: row.created_at,
  }
}

export const teamRepository = {
  async create(member: Omit<TeamMember, 'id' | 'createdAt'>) {
    const userId = await requireUserId()
    const now = Date.now()
    const id = makeId('team')
    const row = {
      id,
      user_id: userId,
      name: member.name,
      role: member.role ?? '',
      department: member.department ?? null,
      email: member.email ?? null,
      avatar: member.avatar ?? null,
      created_at: now,
    }
    const { error } = await supabase.from('team_members').insert(row)
    if (error) throw error
    return fromRow(row)
  },

  async getAll() {
    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return (data ?? []).map(fromRow)
  },

  async getById(id: string) {
    const { data, error } = await supabase.from('team_members').select('*').eq('id', id).maybeSingle()
    if (error) throw error
    return data ? fromRow(data) : undefined
  },

  async update(id: string, updates: Partial<Omit<TeamMember, 'id' | 'createdAt'>>) {
    const payload: Record<string, any> = {}
    if (updates.name !== undefined) payload.name = updates.name
    if (updates.role !== undefined) payload.role = updates.role
    if (updates.department !== undefined) payload.department = updates.department ?? null
    if (updates.email !== undefined) payload.email = updates.email ?? null
    if (updates.avatar !== undefined) payload.avatar = updates.avatar ?? null
    const { data, error } = await supabase
      .from('team_members')
      .update(payload)
      .eq('id', id)
      .select()
      .maybeSingle()
    if (error) throw error
    return data ? fromRow(data) : undefined
  },

  async delete(id: string) {
    const { error } = await supabase.from('team_members').delete().eq('id', id)
    if (error) throw error
  },

  async search(query: string) {
    const { data, error } = await supabase.from('team_members').select('*')
    if (error) throw error
    const lower = query.toLowerCase()
    return (data ?? []).map(fromRow).filter(
      (m) =>
        m.name.toLowerCase().includes(lower) ||
        (m.role ?? '').toLowerCase().includes(lower) ||
        (m.department ?? '').toLowerCase().includes(lower)
    )
  },

  async count() {
    const { count, error } = await supabase
      .from('team_members')
      .select('*', { count: 'exact', head: true })
    if (error) throw error
    return count ?? 0
  },
}