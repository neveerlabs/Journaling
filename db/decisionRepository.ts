import { supabase, requireUserId, makeId } from './supabase'
import type { Decision } from '@/types'

function fromRow(row: any): Decision {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? '',
    decision: row.decision ?? '',
    reason: row.reason ?? '',
    projectId: row.project_id ?? undefined,
    decidedBy: row.decided_by ?? undefined,
    date: row.date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export const decisionRepository = {
  async create(decision: Omit<Decision, 'id' | 'createdAt' | 'updatedAt'>) {
    const userId = await requireUserId()
    const now = Date.now()
    const id = makeId('decision')
    const row = {
      id,
      user_id: userId,
      title: decision.title,
      description: decision.description ?? '',
      decision: decision.decision ?? '',
      reason: decision.reason ?? '',
      project_id: decision.projectId ?? null,
      decided_by: decision.decidedBy ?? null,
      date: decision.date,
      created_at: now,
      updated_at: now,
    }
    const { error } = await supabase.from('decisions').insert(row)
    if (error) throw error
    return fromRow(row)
  },

  async getAll() {
    const { data, error } = await supabase
      .from('decisions')
      .select('*')
      .order('date', { ascending: false })
    if (error) throw error
    return (data ?? []).map(fromRow)
  },

  async getById(id: string) {
    const { data, error } = await supabase.from('decisions').select('*').eq('id', id).maybeSingle()
    if (error) throw error
    return data ? fromRow(data) : undefined
  },

  async getByProjectId(projectId: string) {
    const { data, error } = await supabase.from('decisions').select('*').eq('project_id', projectId)
    if (error) throw error
    return (data ?? []).map(fromRow)
  },

  async update(id: string, updates: Partial<Omit<Decision, 'id' | 'createdAt'>>) {
    const payload: Record<string, any> = { updated_at: Date.now() }
    if (updates.title !== undefined) payload.title = updates.title
    if (updates.description !== undefined) payload.description = updates.description
    if (updates.decision !== undefined) payload.decision = updates.decision
    if (updates.reason !== undefined) payload.reason = updates.reason
    if (updates.projectId !== undefined) payload.project_id = updates.projectId ?? null
    if (updates.decidedBy !== undefined) payload.decided_by = updates.decidedBy ?? null
    if (updates.date !== undefined) payload.date = updates.date
    const { data, error } = await supabase
      .from('decisions')
      .update(payload)
      .eq('id', id)
      .select()
      .maybeSingle()
    if (error) throw error
    return data ? fromRow(data) : undefined
  },

  async delete(id: string) {
    const { error } = await supabase.from('decisions').delete().eq('id', id)
    if (error) throw error
  },

  async deleteByProjectId(projectId: string) {
    const { error } = await supabase.from('decisions').delete().eq('project_id', projectId)
    if (error) throw error
  },

  async search(query: string) {
    const { data, error } = await supabase.from('decisions').select('*')
    if (error) throw error
    const lower = query.toLowerCase()
    return (data ?? []).map(fromRow).filter(
      (d) => d.title.toLowerCase().includes(lower) || d.decision.toLowerCase().includes(lower)
    )
  },

  async count() {
    const { count, error } = await supabase
      .from('decisions')
      .select('*', { count: 'exact', head: true })
    if (error) throw error
    return count ?? 0
  },
}