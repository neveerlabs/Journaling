import { journalRepository } from '@/db/journalRepository'
import { projectRepository } from '@/db/projectRepository'
import { meetingRepository } from '@/db/meetingRepository'
import { decisionRepository } from '@/db/decisionRepository'
import { knowledgeRepository } from '@/db/knowledgeRepository'
import { teamRepository } from '@/db/teamRepository'

export interface SearchResult {
  id: string
  type: 'journal' | 'project' | 'meeting' | 'decision' | 'knowledge' | 'team'
  title: string
  subtitle?: string
  date?: string
}

export async function globalSearch(query: string): Promise<SearchResult[]> {
  const results: SearchResult[] = []

  if (!query.trim()) {
    return results
  }

  const [journals, projects, meetings, decisions, knowledge, team] = await Promise.all([
    journalRepository.search(query),
    projectRepository.search(query),
    meetingRepository.search(query),
    decisionRepository.search(query),
    knowledgeRepository.search(query),
    teamRepository.search(query),
  ])

  results.push(
    ...journals.map((j) => ({
      id: j.id,
      type: 'journal' as const,
      title: j.title,
      subtitle: j.projectId ? `Project: ${j.projectId}` : undefined,
      date: j.date,
    }))
  )

  results.push(
    ...projects.map((p) => ({
      id: p.id,
      type: 'project' as const,
      title: p.name,
      subtitle: p.status,
      date: p.startDate,
    }))
  )

  results.push(
    ...meetings.map((m) => ({
      id: m.id,
      type: 'meeting' as const,
      title: m.title,
      subtitle: m.location,
      date: m.date,
    }))
  )

  results.push(
    ...decisions.map((d) => ({
      id: d.id,
      type: 'decision' as const,
      title: d.title,
      date: d.date,
    }))
  )

  results.push(
    ...knowledge.map((k) => ({
      id: k.id,
      type: 'knowledge' as const,
      title: k.title,
      subtitle: k.category,
    }))
  )

  results.push(
    ...team.map((t) => ({
      id: t.id,
      type: 'team' as const,
      title: t.name,
      subtitle: t.role,
    }))
  )

  return results
}
