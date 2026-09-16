import { supabase, requireUserId, makeId } from './supabase'
import type { JournalEntry } from '@/types'

function fromRow(row: any): JournalEntry {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    date: row.date,
    projectId: row.project_id ?? undefined,
    tags: row.tags ?? [],
    status: row.status,
    blockers: row.blockers ?? undefined,
    nextActions: row.next_actions ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export const journalRepository = {
  async create(entry: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>) {
    const userId = await requireUserId()
    const now = Date.now()
    const id = makeId('journal')
    const row = {
      id,
      user_id: userId,
      title: entry.title,
      content: entry.content,
      date: entry.date,
      project_id: entry.projectId ?? null,
      tags: entry.tags ?? [],
      status: entry.status,
      blockers: entry.blockers ?? null,
      next_actions: entry.nextActions ?? null,
      created_at: now,
      updated_at: now,
    }
    const { error } = await supabase.from('journal_entries').insert(row)
    if (error) throw error
    return fromRow(row)
  },

  async getAll() {
    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .order('date', { ascending: false })
    if (error) throw error
    return (data ?? []).map(fromRow)
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('id', id)
      .maybeSingle()
    if (error) throw error
    return data ? fromRow(data) : undefined
  },

  async getByProjectId(projectId: string) {
    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('project_id', projectId)
    if (error) throw error
    return (data ?? []).map(fromRow)
  },

  async getByDate(date: string) {
    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('date', date)
    if (error) throw error
    return (data ?? []).map(fromRow)
  },

  async update(id: string, updates: Partial<Omit<JournalEntry, 'id' | 'createdAt'>>) {
    const payload: Record<string, any> = { updated_at: Date.now() }
    if (updates.title !== undefined) payload.title = updates.title
    if (updates.content !== undefined) payload.content = updates.content
    if (updates.date !== undefined) payload.date = updates.date
    if (updates.projectId !== undefined) payload.project_id = updates.projectId ?? null
    if (updates.tags !== undefined) payload.tags = updates.tags
    if (updates.status !== undefined) payload.status = updates.status
    if (updates.blockers !== undefined) payload.blockers = updates.blockers ?? null
    if (updates.nextActions !== undefined) payload.next_actions = updates.nextActions ?? null
    const { data, error } = await supabase
      .from('journal_entries')
      .update(payload)
      .eq('id', id)
      .select()
      .maybeSingle()
    if (error) throw error
    return data ? fromRow(data) : undefined
  },

  async delete(id: string) {
    const { error } = await supabase.from('journal_entries').delete().eq('id', id)
    if (error) throw error
  },

  async deleteByProjectId(projectId: string) {
    const { error } = await supabase
      .from('journal_entries')
      .delete()
      .eq('project_id', projectId)
    if (error) throw error
  },

  async search(query: string) {
    const { data, error } = await supabase.from('journal_entries').select('*')
    if (error) throw error
    const lower = query.toLowerCase()
    return (data ?? []).map(fromRow).filter(
      (e) =>
        e.title.toLowerCase().includes(lower) ||
        e.content.toLowerCase().includes(lower) ||
        e.tags.some((t) => t.toLowerCase().includes(lower))
    )
  },

  async count() {
    const { count, error } = await supabase
      .from('journal_entries')
      .select('*', { count: 'exact', head: true })
    if (error) throw error
    return count ?? 0
  },
}