export type JournalEntryStatus = 'draft' | 'completed' | 'archived'

export interface JournalEntry {
  id: string
  title: string
  content: string
  date: string
  projectId?: string
  tags: string[]
  status: JournalEntryStatus
  blockers?: string
  nextActions?: string
  createdAt: number
  updatedAt: number
}

export interface Project {
  id: string
  name: string
  description: string
  status: 'active' | 'completed' | 'onhold'
  priority: 'high' | 'medium' | 'low'
  startDate: string
  targetDate?: string
  createdAt: number
  updatedAt: number
}

export interface Meeting {
  id: string
  title: string
  date: string
  time: string
  location?: string
  participants: string[]
  agenda: string
  discussion?: string
  decisions: string[]
  actionItems: Array<{ id: string; text: string; assignee?: string; dueDate?: string }>
  projectId?: string
  createdAt: number
  updatedAt: number
}

export interface Decision {
  id: string
  title: string
  description: string
  decision: string
  reason: string
  projectId?: string
  decidedBy?: string
  date: string
  createdAt: number
  updatedAt: number
}

export interface Knowledge {
  id: string
  title: string
  content: string
  category: string
  tags: string[]
  projectId?: string
  author?: string
  createdAt: number
  updatedAt: number
}

export interface TeamMember {
  id: string
  name: string
  role: string
  department?: string
  email?: string
  avatar?: string
  createdAt: number
}

export interface UserProfile {
  id: string
  name: string
  email: string
  avatarUrl?: string
  role: string
  createdAt: number
  updatedAt: number
}