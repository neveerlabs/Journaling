import { supabase, requireUserId, makeId } from './supabase'
import type { Meeting } from '@/types'

function fromRow(row: any): Meeting {
  return {
    id: row.id,
    title: row.title,
    date: row.date,
    time: row.time ?? '',
    location: row.location ?? undefined,
    participants: row.participants ?? [],
    agenda: row.agenda ?? '',
    discussion: row.discussion ?? undefined,
    decisions: row.decisions ?? [],
    actionItems: row.action_items ?? [],
    projectId: row.project_id ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export const meetingRepository = {
  async create(meeting: Omit<Meeting, 'id' | 'createdAt' | 'updatedAt'>) {
    const userId = await requireUserId()
    const now = Date.now()
    const id = makeId('meeting')
    const row = {
      id,
      user_id: userId,
      title: meeting.title,
      date: meeting.date,
      time: meeting.time ?? '',
      location: meeting.location ?? null,
      participants: meeting.participants ?? [],
      agenda: meeting.agenda ?? '',
      discussion: meeting.discussion ?? null,
      decisions: meeting.decisions ?? [],
      action_items: meeting.actionItems ?? [],
      project_id: meeting.projectId ?? null,
      created_at: now,
      updated_at: now,
    }
    const { error } = await supabase.from('meetings').insert(row)
    if (error) throw error
    return fromRow(row)
  },

  async getAll() {
    const { data, error } = await supabase
      .from('meetings')
      .select('*')
      .order('date', { ascending: false })
    if (error) throw error
    return (data ?? []).map(fromRow)
  },

  async getById(id: string) {
    const { data, error } = await supabase.from('meetings').select('*').eq('id', id).maybeSingle()
    if (error) throw error
    return data ? fromRow(data) : undefined
  },

  async getByProjectId(projectId: string) {
    const { data, error } = await supabase.from('meetings').select('*').eq('project_id', projectId)
    if (error) throw error
    return (data ?? []).map(fromRow)
  },

  async update(id: string, updates: Partial<Omit<Meeting, 'id' | 'createdAt'>>) {
    const payload: Record<string, any> = { updated_at: Date.now() }
    if (updates.title !== undefined) payload.title = updates.title
    if (updates.date !== undefined) payload.date = updates.date
    if (updates.time !== undefined) payload.time = updates.time
    if (updates.location !== undefined) payload.location = updates.location ?? null
    if (updates.participants !== undefined) payload.participants = updates.participants
    if (updates.agenda !== undefined) payload.agenda = updates.agenda
    if (updates.discussion !== undefined) payload.discussion = updates.discussion ?? null
    if (updates.decisions !== undefined) payload.decisions = updates.decisions
    if (updates.actionItems !== undefined) payload.action_items = updates.actionItems
    if (updates.projectId !== undefined) payload.project_id = updates.projectId ?? null
    const { data, error } = await supabase
      .from('meetings')
      .update(payload)
      .eq('id', id)
      .select()
      .maybeSingle()
    if (error) throw error
    return data ? fromRow(data) : undefined
  },

  async delete(id: string) {
    const { error } = await supabase.from('meetings').delete().eq('id', id)
    if (error) throw error
  },

  async deleteByProjectId(projectId: string) {
    const { error } = await supabase.from('meetings').delete().eq('project_id', projectId)
    if (error) throw error
  },

  async search(query: string) {
    const { data, error } = await supabase.from('meetings').select('*')
    if (error) throw error
    const lower = query.toLowerCase()
    return (data ?? []).map(fromRow).filter((m) => m.title.toLowerCase().includes(lower))
  },

  async count() {
    const { count, error } = await supabase
      .from('meetings')
      .select('*', { count: 'exact', head: true })
    if (error) throw error
    return count ?? 0
  },
}