import { supabase, requireUserId, makeId } from './supabase'
import type { Project } from '@/types'

function fromRow(row: any): Project {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? '',
    status: row.status,
    priority: row.priority,
    startDate: row.start_date,
    targetDate: row.target_date ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export const projectRepository = {
  async create(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) {
    const userId = await requireUserId()
    const now = Date.now()
    const id = makeId('project')
    const row = {
      id,
      user_id: userId,
      name: project.name,
      description: project.description ?? '',
      status: project.status,
      priority: project.priority,
      start_date: project.startDate,
      target_date: project.targetDate ?? null,
      created_at: now,
      updated_at: now,
    }
    const { error } = await supabase.from('projects').insert(row)
    if (error) throw error
    return fromRow(row)
  },

  async getAll() {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return (data ?? []).map(fromRow)
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .maybeSingle()
    if (error) throw error
    return data ? fromRow(data) : undefined
  },

  async getActive() {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('status', 'active')
    if (error) throw error
    return (data ?? []).map(fromRow)
  },

  async update(id: string, updates: Partial<Omit<Project, 'id' | 'createdAt'>>) {
    const payload: Record<string, any> = { updated_at: Date.now() }
    if (updates.name !== undefined) payload.name = updates.name
    if (updates.description !== undefined) payload.description = updates.description
    if (updates.status !== undefined) payload.status = updates.status
    if (updates.priority !== undefined) payload.priority = updates.priority
    if (updates.startDate !== undefined) payload.start_date = updates.startDate
    if (updates.targetDate !== undefined) payload.target_date = updates.targetDate ?? null
    const { data, error } = await supabase
      .from('projects')
      .update(payload)
      .eq('id', id)
      .select()
      .maybeSingle()
    if (error) throw error
    return data ? fromRow(data) : undefined
  },

  async delete(id: string) {
    const { error } = await supabase.from('projects').delete().eq('id', id)
    if (error) throw error
  },

  async search(query: string) {
    const { data, error } = await supabase.from('projects').select('*')
    if (error) throw error
    const lower = query.toLowerCase()
    return (data ?? []).map(fromRow).filter(
      (p) =>
        p.name.toLowerCase().includes(lower) ||
        (p.description ?? '').toLowerCase().includes(lower)
    )
  },

  async count() {
    const { count, error } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
    if (error) throw error
    return count ?? 0
  },
}