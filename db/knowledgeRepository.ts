import { supabase, requireUserId, makeId } from './supabase'
import type { Knowledge } from '@/types'

function fromRow(row: any): Knowledge {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    category: row.category ?? '',
    tags: row.tags ?? [],
    projectId: row.project_id ?? undefined,
    author: row.author ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export const knowledgeRepository = {
  async create(knowledge: Omit<Knowledge, 'id' | 'createdAt' | 'updatedAt'>) {
    const userId = await requireUserId()
    const now = Date.now()
    const id = makeId('knowledge')
    const row = {
      id,
      user_id: userId,
      title: knowledge.title,
      content: knowledge.content,
      category: knowledge.category ?? '',
      tags: knowledge.tags ?? [],
      project_id: knowledge.projectId ?? null,
      author: knowledge.author ?? null,
      created_at: now,
      updated_at: now,
    }
    const { error } = await supabase.from('knowledge').insert(row)
    if (error) throw error
    return fromRow(row)
  },

  async getAll() {
    const { data, error } = await supabase
      .from('knowledge')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return (data ?? []).map(fromRow)
  },

  async getById(id: string) {
    const { data, error } = await supabase.from('knowledge').select('*').eq('id', id).maybeSingle()
    if (error) throw error
    return data ? fromRow(data) : undefined
  },

  async getByCategory(category: string) {
    const { data, error } = await supabase.from('knowledge').select('*').eq('category', category)
    if (error) throw error
    return (data ?? []).map(fromRow)
  },

  async getByProjectId(projectId: string) {
    const { data, error } = await supabase.from('knowledge').select('*').eq('project_id', projectId)
    if (error) throw error
    return (data ?? []).map(fromRow)
  },

  async update(id: string, updates: Partial<Omit<Knowledge, 'id' | 'createdAt'>>) {
    const payload: Record<string, any> = { updated_at: Date.now() }
    if (updates.title !== undefined) payload.title = updates.title
    if (updates.content !== undefined) payload.content = updates.content
    if (updates.category !== undefined) payload.category = updates.category
    if (updates.tags !== undefined) payload.tags = updates.tags
    if (updates.projectId !== undefined) payload.project_id = updates.projectId ?? null
    if (updates.author !== undefined) payload.author = updates.author ?? null
    const { data, error } = await supabase
      .from('knowledge')
      .update(payload)
      .eq('id', id)
      .select()
      .maybeSingle()
    if (error) throw error
    return data ? fromRow(data) : undefined
  },

  async delete(id: string) {
    const { error } = await supabase.from('knowledge').delete().eq('id', id)
    if (error) throw error
  },

  async deleteByProjectId(projectId: string) {
    const { error } = await supabase.from('knowledge').delete().eq('project_id', projectId)
    if (error) throw error
  },

  async search(query: string) {
    const { data, error } = await supabase.from('knowledge').select('*')
    if (error) throw error
    const lower = query.toLowerCase()
    return (data ?? []).map(fromRow).filter(
      (k) =>
        k.title.toLowerCase().includes(lower) ||
        k.content.toLowerCase().includes(lower) ||
        k.tags.some((t) => t.toLowerCase().includes(lower))
    )
  },

  async count() {
    const { count, error } = await supabase
      .from('knowledge')
      .select('*', { count: 'exact', head: true })
    if (error) throw error
    return count ?? 0
  },
}