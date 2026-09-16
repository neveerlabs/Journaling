'use client'

import {
  Avatar,
  Button,
  Card,
  CardHeader,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  Divider,
  Field,
  Input,
  Menu,
  MenuDivider,
  MenuItem,
  MenuList,
  MenuPopover,
  MenuTrigger,
  MessageBar,
  Select,
  Spinner,
  Textarea,
  Title1,
  Title3,
  Body1,
  Caption1,
  Subtitle2,
  makeStyles,
  mergeClasses,
  tokens,
} from '@fluentui/react-components'
import {
  Add24Regular,
  Book24Regular,
  CalendarLtr24Regular,
  CheckmarkCircle24Regular,
  ChevronRight20Regular,
  ClipboardTask24Regular,
  Delete24Regular,
  Dismiss24Regular,
  DocumentBulletList24Regular,
  Edit24Regular,
  ErrorCircle24Regular,
  Folder24Regular,
  Home24Regular,
  People24Regular,
  PersonCircle24Regular,
  Search24Regular,
  Settings24Regular,
  TaskListSquareLtr24Regular,
  Clock24Regular,
  TargetArrow24Regular,
  SignOut24Regular,
  Key24Regular,
} from '@fluentui/react-icons'
import { useEffect, useRef, useState } from 'react'
import type React from 'react'
import { format } from 'date-fns'
import type { JournalEntry, Project, UserProfile } from '@/types'
import { journalRepository } from '@/db/journalRepository'
import { projectRepository } from '@/db/projectRepository'
import { meetingRepository } from '@/db/meetingRepository'
import { decisionRepository } from '@/db/decisionRepository'
import { knowledgeRepository } from '@/db/knowledgeRepository'
import { teamRepository } from '@/db/teamRepository'
import { profileRepository } from '@/db/profileRepository'
import { globalSearch, type SearchResult } from '@/lib/search'
import { getSupabase } from '@/lib/supabase/client'
import { useUser } from '@/lib/useUser'

const useStyles = makeStyles({
  shell: {
    minHeight: '100vh',
    backgroundColor: tokens.colorNeutralBackground2,
    color: tokens.colorNeutralForeground1,
  },
  sidebar: {
    width: '260px',
    backgroundColor: tokens.colorNeutralBackground1,
    borderRight: `${tokens.strokeWidthThin} solid ${tokens.colorNeutralStroke2}`,
    padding: tokens.spacingVerticalL,
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
    position: 'sticky',
    top: 0,
    height: '100vh',
    overflowY: 'auto',
    '@media (max-width: 760px)': { display: 'none' },
  },
  brand: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: tokens.spacingHorizontalS,
    padding: `0 ${tokens.spacingHorizontalS}`,
    marginBottom: tokens.spacingVerticalXL,
  },
  brandCopy: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: tokens.spacingVerticalXXS,
    minWidth: 0,
  },
  brandMark: {
    width: '34px',
    height: '34px',
    borderRadius: tokens.borderRadiusCircular,
    display: 'grid',
    placeItems: 'center',
    overflow: 'hidden',
    flexShrink: 0,
    backgroundColor: tokens.colorBrandBackground,
    color: tokens.colorNeutralForegroundOnBrand,
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXS,
  },
  navButton: {
    justifyContent: 'flex-start',
    width: '100%',
    minHeight: '40px',
    paddingLeft: tokens.spacingHorizontalM,
    paddingRight: tokens.spacingHorizontalM,
  },
  main: { flex: 1, minWidth: 0 },
  topbar: {
    minHeight: '72px',
    backgroundColor: tokens.colorNeutralBackground1,
    borderBottom: `${tokens.strokeWidthThin} solid ${tokens.colorNeutralStroke2}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: tokens.spacingHorizontalM,
    padding: `${tokens.spacingVerticalM} ${tokens.spacingHorizontalXXL}`,
    position: 'sticky',
    top: 0,
    zIndex: 10,
    '@media (max-width: 760px)': {
      minHeight: '56px',
      padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalM}`,
      justifyContent: 'stretch',
    },
  },
  desktopRight: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
    '@media (max-width: 760px)': { display: 'none' },
  },
  search: {
    width: 'min(360px, 42vw)',
    '@media (max-width: 760px)': { width: '100%', minWidth: 0 },
  },
  desktopSearch: { '@media (max-width: 760px)': { display: 'none' } },
  mobileSearch: {
    display: 'none',
    '@media (max-width: 760px)': { display: 'block', flex: 1, minWidth: 0 },
  },
  content: {
    padding: `${tokens.spacingVerticalXXL} ${tokens.spacingHorizontalXXL}`,
    maxWidth: '1500px',
    width: '100%',
    boxSizing: 'border-box',
    margin: '0 auto',
    '@media (max-width: 760px)': {
      padding: `${tokens.spacingVerticalL} ${tokens.spacingHorizontalM}`,
    },
  },
  pageHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: tokens.spacingHorizontalM,
    marginBottom: tokens.spacingVerticalXL,
    flexWrap: 'wrap',
    '> div:first-child': {
      display: 'flex',
      flexDirection: 'column',
      gap: tokens.spacingVerticalXS,
      minWidth: 0,
      flex: '1 1 240px',
    },
  },
  eyebrow: {
    color: tokens.colorBrandForeground1,
    fontWeight: tokens.fontWeightSemibold,
    marginBottom: tokens.spacingVerticalXS,
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: tokens.spacingHorizontalM,
    marginBottom: tokens.spacingVerticalXL,
    '@media (max-width: 900px)': {
      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    },
    '@media (max-width: 480px)': {
      gridTemplateColumns: '1fr',
      gap: tokens.spacingVerticalS,
    },
  },
  statCard: {
    padding: tokens.spacingHorizontalL,
    minHeight: '128px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    minWidth: 0,
    '@media (max-width: 480px)': {
      minHeight: 'auto',
      padding: tokens.spacingHorizontalM,
    },
  },
  statValue: {
    fontSize: tokens.fontSizeHero700,
    lineHeight: tokens.lineHeightHero700,
    fontWeight: tokens.fontWeightSemibold,
    marginTop: tokens.spacingVerticalM,
    overflowWrap: 'anywhere',
    '@media (max-width: 480px)': {
      fontSize: tokens.fontSizeBase600,
      lineHeight: tokens.lineHeightBase600,
      marginTop: tokens.spacingVerticalS,
    },
  },
  twoCol: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1.4fr) minmax(300px, 0.8fr)',
    gap: tokens.spacingHorizontalL,
    alignItems: 'start',
    '@media (max-width: 980px)': { gridTemplateColumns: '1fr' },
  },
  sectionCard: {
    padding: tokens.spacingHorizontalL,
    overflow: 'hidden',
    minWidth: 0,
    '@media (max-width: 480px)': { padding: tokens.spacingHorizontalM },
  },
  empty: {
    minHeight: '220px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    gap: tokens.spacingVerticalS,
    color: tokens.colorNeutralForeground3,
    padding: tokens.spacingVerticalL,
  },
  emptyIcon: {
    width: '52px',
    height: '52px',
    display: 'grid',
    placeItems: 'center',
    borderRadius: tokens.borderRadiusCircular,
    backgroundColor: tokens.colorBrandBackground2,
    color: tokens.colorBrandForeground1,
    marginBottom: tokens.spacingVerticalS,
    flexShrink: 0,
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
    minWidth: 0,
  },
  listItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: tokens.spacingHorizontalM,
    padding: tokens.spacingVerticalM,
    borderRadius: tokens.borderRadiusMedium,
    minWidth: 0,
    ':hover': { backgroundColor: tokens.colorNeutralBackground3 },
  },
  listItemClickable: {
    cursor: 'pointer',
    textAlign: 'left',
    width: '100%',
    border: 'none',
    backgroundColor: 'transparent',
    color: 'inherit',
    fontFamily: 'inherit',
    fontSize: 'inherit',
    outlineStyle: 'none',
    ':focus-visible': {
      outlineStyle: 'solid',
      outlineWidth: tokens.strokeWidthThick,
      outlineColor: tokens.colorStrokeFocus2,
      outlineOffset: tokens.strokeWidthThin,
    },
  },
  listCopy: {
    minWidth: 0,
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXXS,
    overflow: 'hidden',
    overflowWrap: 'anywhere',
    wordBreak: 'break-word',
  },
  listMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
    minWidth: 0,
    flexShrink: 0,
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: tokens.spacingHorizontalM,
    '@media (max-width: 640px)': { gridTemplateColumns: '1fr' },
  },
  full: { gridColumn: '1 / -1' },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    flexWrap: 'wrap',
    marginBottom: tokens.spacingVerticalL,
  },
  mobileNav: {
    display: 'none',
    '@media (max-width: 760px)': {
      display: 'flex',
      alignItems: 'center',
      gap: tokens.spacingHorizontalS,
      flex: 1,
      minWidth: 0,
    },
  },
  mobileTopRow: { display: 'contents' },
  mobileMenuButton: { flexShrink: 0 },
  mobileMenu: {
    position: 'absolute',
    top: '56px',
    left: tokens.spacingHorizontalM,
    right: tokens.spacingHorizontalM,
    zIndex: 20,
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXS,
    padding: tokens.spacingVerticalS,
    backgroundColor: tokens.colorNeutralBackground1,
    border: `${tokens.strokeWidthThin} solid ${tokens.colorNeutralStroke2}`,
    borderRadius: tokens.borderRadiusMedium,
    boxShadow: tokens.shadow16,
  },
  resultPanel: {
    position: 'absolute',
    top: '60px',
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: tokens.colorNeutralBackground1,
    border: `${tokens.strokeWidthThin} solid ${tokens.colorNeutralStroke2}`,
    borderRadius: tokens.borderRadiusMedium,
    boxShadow: tokens.shadow16,
    padding: tokens.spacingVerticalXS,
  },
  searchWrap: { position: 'relative' },
  muted: { color: tokens.colorNeutralForeground3 },
  accent: { color: tokens.colorBrandForeground1 },
  profileTrigger: {
    padding: 0,
    minWidth: '36px',
    width: '36px',
    height: '36px',
    borderRadius: tokens.borderRadiusCircular,
    overflow: 'hidden',
  },
  profileInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalM}`,
    minWidth: '220px',
  },
  profileInfoCopy: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXXS,
    minWidth: 0,
    overflow: 'hidden',
  },
  avatarImg: {
    width: '36px',
    height: '36px',
    borderRadius: tokens.borderRadiusCircular,
    objectFit: 'cover',
    display: 'block',
  },
  sectionBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalM,
  },
  profileRow: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalL,
    flexWrap: 'wrap',
  },
  profileAvatarLarge: {
    width: '64px',
    height: '64px',
    borderRadius: tokens.borderRadiusCircular,
    overflow: 'hidden',
    backgroundColor: tokens.colorNeutralBackground3,
    display: 'grid',
    placeItems: 'center',
    color: tokens.colorBrandForeground1,
    flexShrink: 0,
  },
  profileAvatarImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
  },
})

type View =
  | 'dashboard'
  | 'journal'
  | 'projects'
  | 'meetings'
  | 'decisions'
  | 'knowledge'
  | 'team'
  | 'reports'
  | 'settings'

const navItems: Array<{ id: View; label: string; icon: React.ReactElement }> = [
  { id: 'dashboard', label: 'Dashboard', icon: <Home24Regular /> },
  { id: 'journal', label: 'My Journal', icon: <DocumentBulletList24Regular /> },
  { id: 'projects', label: 'Projects', icon: <Folder24Regular /> },
  { id: 'meetings', label: 'Meetings', icon: <CalendarLtr24Regular /> },
  { id: 'decisions', label: 'Decisions', icon: <TargetArrow24Regular /> },
  { id: 'knowledge', label: 'Knowledge', icon: <Book24Regular /> },
  { id: 'team', label: 'Team', icon: <People24Regular /> },
  { id: 'reports', label: 'Reports', icon: <ClipboardTask24Regular /> },
]

const today = () => format(new Date(), 'yyyy-MM-dd')
const withTimeout = <T,>(promise: Promise<T>, ms = 8000) =>
  Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      window.setTimeout(() => reject(new Error('Operation timed out')), ms)
    ),
  ])

const ROLE_OPTIONS = ['Product', 'Engineering', 'Design', 'Data', 'Marketing', 'Operations', 'People']

function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode
  title: string
  description: string
  action?: React.ReactNode
}) {
  const styles = useStyles()
  return (
    <div className={styles.empty}>
      <div className={styles.emptyIcon}>{icon}</div>
      <Subtitle2>{title}</Subtitle2>
      <Body1 className={styles.muted}>{description}</Body1>
      {action}
    </div>
  )
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string
  value: number
  icon: React.ReactNode
}) {
  const styles = useStyles()
  return (
    <Card className={styles.statCard}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: tokens.spacingHorizontalS,
        }}
      >
        <Caption1 className={styles.muted}>{label}</Caption1>
        <span className={styles.accent}>{icon}</span>
      </div>
      <div className={styles.statValue}>{value}</div>
    </Card>
  )
}

function ProfileMenu({ user, profile }: { user: any; profile: UserProfile | null }) {
  const styles = useStyles()
  const supabase = getSupabase()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  const avatarUrl = user?.user_metadata?.avatar_url ?? profile?.avatarUrl
  const displayName = profile?.name ?? user?.user_metadata?.full_name ?? user?.email ?? 'User'
  const email = profile?.email ?? user?.email ?? ''

  return (
    <Menu>
      <MenuTrigger disableButtonEnhancement>
        <Button
          appearance="subtle"
          className={styles.profileTrigger}
          aria-label={user ? 'Open profile menu' : 'Open login menu'}
        >
          {user && avatarUrl ? (
            <img src={avatarUrl} alt="" className={styles.avatarImg} />
          ) : user ? (
            <Avatar
              name={displayName}
              initials={displayName.charAt(0).toUpperCase()}
              color="brand"
            />
          ) : (
            <PersonCircle24Regular fontSize={28} />
          )}
        </Button>
      </MenuTrigger>
      <MenuPopover>
        {user ? (
          <MenuList>
            <div className={styles.profileInfo}>
              {avatarUrl ? (
                <img src={avatarUrl} alt="" className={styles.avatarImg} />
              ) : (
                <Avatar name={displayName} color="brand" />
              )}
              <div className={styles.profileInfoCopy}>
                <Subtitle2>{displayName}</Subtitle2>
                <Caption1 className={styles.muted}>{email}</Caption1>
              </div>
            </div>
            <MenuDivider />
            <MenuItem icon={<SignOut24Regular />} onClick={handleLogout}>
              Sign out
            </MenuItem>
          </MenuList>
        ) : (
          <MenuList>
            <MenuItem
              icon={<PersonCircle24Regular />}
              onClick={() => {
                window.location.href = '/login'
              }}
            >
              Sign in
            </MenuItem>
          </MenuList>
        )}
      </MenuPopover>
    </Menu>
  )
}

function AppSidebar({
  view,
  setView,
}: {
  view: View
  setView: (view: View) => void
}) {
  const styles = useStyles()
  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <div className={styles.brandMark}>
          <Book24Regular />
        </div>
        <div className={styles.brandCopy}>
          <Subtitle2>Work Journal</Subtitle2>
          <Caption1 className={styles.muted}>Organizational memory</Caption1>
        </div>
      </div>
      <nav className={styles.nav} aria-label="Primary navigation">
        {navItems.map((item) => (
          <Button
            key={item.id}
            appearance={view === item.id ? 'primary' : 'subtle'}
            icon={item.icon}
            className={styles.navButton}
            onClick={() => setView(item.id)}
          >
            {item.label}
          </Button>
        ))}
      </nav>
      <div style={{ marginTop: 'auto' }}>
        <Divider style={{ margin: `${tokens.spacingVerticalM} 0` }} />
        <Button
          appearance={view === 'settings' ? 'primary' : 'subtle'}
          icon={<Settings24Regular />}
          className={styles.navButton}
          onClick={() => setView('settings')}
        >
          Settings
        </Button>
      </div>
    </aside>
  )
}

function Dashboard({
  setView,
  entries,
  projects,
  meetings,
  decisions,
  knowledge,
  team,
  onOpenEntry,
}: {
  setView: (view: View) => void
  entries: JournalEntry[]
  projects: Project[]
  meetings: any[]
  decisions: any[]
  knowledge: any[]
  team: any[]
  onOpenEntry: (entry: JournalEntry) => void
}) {
  const styles = useStyles()
  const recent = [...entries].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 5)

  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <div className={styles.eyebrow}>
            {format(new Date(), 'EEEE, MMMM d')}
          </div>
          <Title1>Good morning</Title1>
          <Body1 className={styles.muted}>
            Capture the work that moves your team forward.
          </Body1>
        </div>
        <Button
          appearance="primary"
          icon={<Add24Regular />}
          onClick={() => setView('journal')}
        >
          New journal entry
        </Button>
      </div>

      <div className={styles.statsGrid}>
        <StatCard label="Journal entries" value={entries.length} icon={<DocumentBulletList24Regular />} />
        <StatCard
          label="Active projects"
          value={projects.filter((p) => p.status === 'active').length}
          icon={<Folder24Regular />}
        />
        <StatCard label="Meetings logged" value={meetings.length} icon={<CalendarLtr24Regular />} />
        <StatCard label="Decisions recorded" value={decisions.length} icon={<TargetArrow24Regular />} />
      </div>

      <div className={styles.twoCol}>
        <Card className={styles.sectionCard}>
          <CardHeader
            header={<Title3>Recent activity</Title3>}
            description="Your latest notes and updates"
          />
          {recent.length === 0 ? (
            <EmptyState
              icon={<Clock24Regular />}
              title="Your activity will appear here"
              description="Start by documenting what you worked on today."
              action={
                <Button appearance="secondary" onClick={() => setView('journal')}>
                  Write your first entry
                </Button>
              }
            />
          ) : (
            <div className={styles.list}>
              {recent.map((entry) => (
                <div
                  key={entry.id}
                  className={mergeClasses(styles.listItem, styles.listItemClickable)}
                  role="button"
                  tabIndex={0}
                  onClick={() => onOpenEntry(entry)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      onOpenEntry(entry)
                    }
                  }}
                >
                  <div className={styles.listCopy}>
                    <Subtitle2>{entry.title}</Subtitle2>
                    <Caption1 className={styles.muted}>
                      {format(new Date(`${entry.date}T12:00:00`), 'MMM d, yyyy')} · {entry.status}
                    </Caption1>
                  </div>
                  <ChevronRight20Regular />
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className={styles.sectionCard}>
          <CardHeader
            header={<Title3>Workspace overview</Title3>}
            description="A quick look at your shared memory"
          />
          <div className={styles.list}>
            <div className={styles.listItem}>
              <div className={styles.listCopy}><Body1>Knowledge articles</Body1></div>
              <Subtitle2>{knowledge.length}</Subtitle2>
            </div>
            <div className={styles.listItem}>
              <div className={styles.listCopy}><Body1>Team members</Body1></div>
              <Subtitle2>{team.length}</Subtitle2>
            </div>
            <div className={styles.listItem}>
              <div className={styles.listCopy}><Body1>Open projects</Body1></div>
              <Subtitle2>{projects.filter((p) => p.status === 'active').length}</Subtitle2>
            </div>
          </div>
        </Card>
      </div>
    </>
  )
}

function JournalView({
  entries,
  projects,
  onRefresh,
  notify,
  focusEntryId,
  onFocusHandled,
  requireLogin,
}: {
  entries: JournalEntry[]
  projects: Project[]
  onRefresh: () => void
  notify: (message: string) => void
  focusEntryId: string | null
  onFocusHandled: () => void
  requireLogin: () => boolean
}) {
  const styles = useStyles()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<JournalEntry | null>(null)
  const [query, setQuery] = useState('')
  const [highlightId, setHighlightId] = useState<string | null>(null)
  const [form, setForm] = useState({
    title: '',
    content: '',
    date: today(),
    projectId: '',
    tags: '',
    status: 'completed' as JournalEntry['status'],
    blockers: '',
    nextActions: '',
  })

  const filtered = entries.filter((e) =>
    `${e.title} ${e.content} ${e.tags.join(' ')}`.toLowerCase().includes(query.toLowerCase())
  )

  const startEdit = (entry: JournalEntry) => {
    if (!requireLogin()) return
    setEditing(entry)
    setForm({
      title: entry.title,
      content: entry.content,
      date: entry.date,
      projectId: entry.projectId ?? '',
      tags: entry.tags.join(', '),
      status: entry.status,
      blockers: entry.blockers ?? '',
      nextActions: entry.nextActions ?? '',
    })
    setOpen(true)
  }

  const openNew = () => {
    if (!requireLogin()) return
    setEditing(null)
    setForm({
      title: '',
      content: '',
      date: today(),
      projectId: '',
      tags: '',
      status: 'completed',
      blockers: '',
      nextActions: '',
    })
    setOpen(true)
  }

  useEffect(() => {
    if (!focusEntryId) return
    const target = entries.find((e) => e.id === focusEntryId)
    if (target) {
      setQuery('')
      setHighlightId(focusEntryId)
      window.setTimeout(() => setHighlightId(null), 1600)
    }
    onFocusHandled()
  }, [focusEntryId, entries])

  const save = async () => {
    if (!requireLogin()) return
    if (!form.title.trim() || !form.content.trim()) {
      notify('Title and content are required.')
      return
    }
    const payload = {
      title: form.title.trim(),
      content: form.content.trim(),
      date: form.date,
      projectId: form.projectId || undefined,
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      status: form.status,
      blockers: form.blockers.trim() || undefined,
      nextActions: form.nextActions.trim() || undefined,
    }
    try {
      if (editing) await withTimeout(journalRepository.update(editing.id, payload))
      else await withTimeout(journalRepository.create(payload))
      setOpen(false)
      setEditing(null)
      setForm({
        title: '',
        content: '',
        date: today(),
        projectId: '',
        tags: '',
        status: 'completed',
        blockers: '',
        nextActions: '',
      })
      await onRefresh()
      notify(editing ? 'Journal entry updated' : 'Journal entry created')
    } catch {
      notify('Could not save the journal entry. Please try again.')
    }
  }

  const remove = async (id: string) => {
    if (!requireLogin()) return
    if (!window.confirm('Delete this journal entry? This action cannot be undone.')) return
    try {
      await withTimeout(journalRepository.delete(id))
      await onRefresh()
      notify('Journal entry deleted')
    } catch {
      notify('Could not delete the journal entry. Please try again.')
    }
  }

  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <div className={styles.eyebrow}>Personal record</div>
          <Title1>My Journal</Title1>
          <Body1 className={styles.muted}>
            Make your work visible to your future self and your team.
          </Body1>
        </div>
        <Button appearance="primary" icon={<Add24Regular />} onClick={openNew}>
          New entry
        </Button>
      </div>

      <div className={styles.toolbar}>
        <Input
          contentBefore={<Search24Regular />}
          placeholder="Search entries"
          value={query}
          onChange={(_, data) => setQuery(data.value)}
        />
        <Caption1 className={styles.muted}>
          {filtered.length} {filtered.length === 1 ? 'entry' : 'entries'}
        </Caption1>
      </div>

      <Card className={styles.sectionCard}>
        {filtered.length === 0 ? (
          <EmptyState
            icon={<DocumentBulletList24Regular />}
            title={query ? 'No matching entries' : 'Your journal is empty'}
            description={
              query ? 'Try a different search term.' : 'Document a milestone, update, blocker, or next step.'
            }
            action={
              !query ? (
                <Button appearance="secondary" onClick={openNew}>
                  Create entry
                </Button>
              ) : undefined
            }
          />
        ) : (
          <div className={styles.list}>
            {filtered.map((entry) => (
              <div
                className={styles.listItem}
                key={entry.id}
                style={
                  highlightId === entry.id
                    ? { backgroundColor: tokens.colorBrandBackground2, transition: 'background-color 300ms ease' }
                    : undefined
                }
              >
                <div className={styles.listCopy}>
                  <Subtitle2>{entry.title}</Subtitle2>
                  <Caption1 className={styles.muted}>
                    {format(new Date(`${entry.date}T12:00:00`), 'MMM d, yyyy')} · {entry.status}
                    {entry.tags.length ? ` · ${entry.tags.join(', ')}` : ''}
                  </Caption1>
                  <Body1>
                    {entry.content.length > 140 ? `${entry.content.slice(0, 140)}…` : entry.content}
                  </Body1>
                </div>
                <div className={styles.listMeta}>
                  <Button
                    appearance="subtle"
                    icon={<Edit24Regular />}
                    aria-label={`Edit ${entry.title}`}
                    onClick={() => startEdit(entry)}
                  />
                  <Button
                    appearance="subtle"
                    icon={<Delete24Regular />}
                    aria-label={`Delete ${entry.title}`}
                    onClick={() => remove(entry.id)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Dialog open={open} onOpenChange={(_, data) => setOpen(data.open)}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>{editing ? 'Edit journal entry' : 'New journal entry'}</DialogTitle>
            <DialogContent>
              <div className={styles.formGrid}>
                <Field label="Title" required className={styles.full}>
                  <Input value={form.title} onChange={(_, d) => setForm({ ...form, title: d.value })} />
                </Field>
                <Field label="Date" required>
                  <Input type="date" value={form.date} onChange={(_, d) => setForm({ ...form, date: d.value })} />
                </Field>
                <Field label="Status">
                  <Select
                    value={form.status}
                    onChange={(_, d) => setForm({ ...form, status: d.value as JournalEntry['status'] })}
                  >
                    <option value="completed">Completed</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </Select>
                </Field>
                <Field label="Project">
                  <Select
                    value={form.projectId}
                    onChange={(_, d) => setForm({ ...form, projectId: d.value })}
                  >
                    <option value="">No project</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </Select>
                </Field>
                <Field label="Tags" hint="Separate tags with commas">
                  <Input value={form.tags} onChange={(_, d) => setForm({ ...form, tags: d.value })} />
                </Field>
                <Field label="What did you work on?" required className={styles.full}>
                  <Textarea resize="vertical" rows={6} value={form.content} onChange={(_, d) => setForm({ ...form, content: d.value })} />
                </Field>
                <Field label="Blockers" className={styles.full}>
                  <Textarea resize="vertical" rows={3} value={form.blockers} onChange={(_, d) => setForm({ ...form, blockers: d.value })} />
                </Field>
                <Field label="Next actions" className={styles.full}>
                  <Textarea resize="vertical" rows={3} value={form.nextActions} onChange={(_, d) => setForm({ ...form, nextActions: d.value })} />
                </Field>
              </div>
            </DialogContent>
            <DialogActions>
              <Button appearance="secondary" onClick={() => setOpen(false)}>Cancel</Button>
              <Button appearance="primary" onClick={save} disabled={!form.title.trim() || !form.content.trim()}>
                {editing ? 'Save changes' : 'Create entry'}
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </>
  )
}

function ProjectsView({
  projects,
  onRefresh,
  notify,
  requireLogin,
}: {
  projects: Project[]
  onRefresh: () => void
  notify: (message: string) => void
  requireLogin: () => boolean
}) {
  const styles = useStyles()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Project | null>(null)
  const [form, setForm] = useState({
    name: '',
    description: '',
    status: 'active' as Project['status'],
    priority: 'medium' as Project['priority'],
    startDate: today(),
    targetDate: '',
  })

  const reset = () => {
    setForm({ name: '', description: '', status: 'active', priority: 'medium', startDate: today(), targetDate: '' })
    setEditing(null)
  }

  const openNew = () => {
    if (!requireLogin()) return
    reset()
    setOpen(true)
  }

  const openEdit = (project: Project) => {
    if (!requireLogin()) return
    setEditing(project)
    setForm({
      name: project.name,
      description: project.description,
      status: project.status,
      priority: project.priority,
      startDate: project.startDate,
      targetDate: project.targetDate ?? '',
    })
    setOpen(true)
  }

  const save = async () => {
    if (!requireLogin()) return
    if (!form.name.trim()) {
      notify('Project name is required.')
      return
    }
    try {
      if (editing)
        await withTimeout(projectRepository.update(editing.id, { ...form, targetDate: form.targetDate || undefined }))
      else
        await withTimeout(projectRepository.create({ ...form, targetDate: form.targetDate || undefined }))
      reset()
      setOpen(false)
      await onRefresh()
      notify(editing ? 'Project updated' : 'Project created')
    } catch {
      notify('Could not save the project. Please try again.')
    }
  }

  const remove = async (project: Project) => {
    if (!requireLogin()) return
    if (!window.confirm(`Delete ${project.name}? This action cannot be undone.`)) return
    try {
      await withTimeout(projectRepository.delete(project.id))
      await onRefresh()
      notify('Project deleted')
    } catch {
      notify('Could not delete the project. Please try again.')
    }
  }

  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <div className={styles.eyebrow}>Workstreams</div>
          <Title1>Projects</Title1>
          <Body1 className={styles.muted}>Keep initiatives, context, and outcomes connected.</Body1>
        </div>
        <Button appearance="primary" icon={<Add24Regular />} onClick={openNew}>
          New project
        </Button>
      </div>

      <Card className={styles.sectionCard}>
        {projects.length === 0 ? (
          <EmptyState
            icon={<Folder24Regular />}
            title="No projects yet"
            description="Create a project to connect entries, meetings, and decisions."
            action={
              <Button appearance="secondary" onClick={openNew}>Create project</Button>
            }
          />
        ) : (
          <div className={styles.list}>
            {projects.map((project) => (
              <div className={styles.listItem} key={project.id}>
                <div className={styles.listCopy}>
                  <Subtitle2>{project.name}</Subtitle2>
                  <Caption1 className={styles.muted}>
                    {project.status} · {project.priority} priority · started{' '}
                    {format(new Date(`${project.startDate}T12:00:00`), 'MMM d, yyyy')}
                  </Caption1>
                  <Body1>{project.description || 'No description added.'}</Body1>
                </div>
                <div className={styles.listMeta}>
                  <Button
                    appearance="subtle"
                    icon={<Edit24Regular />}
                    aria-label={`Edit ${project.name}`}
                    onClick={() => openEdit(project)}
                  />
                  <Button
                    appearance="subtle"
                    icon={<Delete24Regular />}
                    aria-label={`Delete ${project.name}`}
                    onClick={() => remove(project)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Dialog open={open} onOpenChange={(_, d) => setOpen(d.open)}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>{editing ? 'Edit project' : 'New project'}</DialogTitle>
            <DialogContent>
              <div className={styles.formGrid}>
                <Field label="Name" required className={styles.full}>
                  <Input value={form.name} onChange={(_, d) => setForm({ ...form, name: d.value })} />
                </Field>
                <Field label="Status">
                  <Select
                    value={form.status}
                    onChange={(_, d) => setForm((c) => ({ ...c, status: d.value as Project['status'] }))}
                  >
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="onhold">On hold</option>
                  </Select>
                </Field>
                <Field label="Priority">
                  <Select
                    value={form.priority}
                    onChange={(_, d) => setForm((c) => ({ ...c, priority: d.value as Project['priority'] }))}
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </Select>
                </Field>
                <Field label="Start date">
                  <Input type="date" value={form.startDate} onChange={(_, d) => setForm({ ...form, startDate: d.value })} />
                </Field>
                <Field label="Target date">
                  <Input type="date" value={form.targetDate} onChange={(_, d) => setForm({ ...form, targetDate: d.value })} />
                </Field>
                <Field label="Description" className={styles.full}>
                  <Textarea rows={4} value={form.description} onChange={(_, d) => setForm({ ...form, description: d.value })} />
                </Field>
              </div>
            </DialogContent>
            <DialogActions>
              <Button appearance="secondary" onClick={() => setOpen(false)}>Cancel</Button>
              <Button appearance="primary" onClick={save} disabled={!form.name.trim()}>
                {editing ? 'Save changes' : 'Create project'}
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </>
  )
}

function CollectionView({
  title,
  eyebrow,
  description,
  icon,
  count,
  onRefresh,
  notify,
  kind,
  user,
  requireLogin,
}: {
  title: string
  eyebrow: string
  description: string
  icon: React.ReactNode
  count: number
  onRefresh: () => void
  notify: (message: string) => void
  kind: 'meetings' | 'decisions' | 'knowledge' | 'team'
  user: any
  requireLogin: () => boolean
}) {
  const styles = useStyles()
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<any[]>([])
  const [form, setForm] = useState<Record<string, string>>({
    title: '',
    content: '',
    date: today(),
    time: '',
    category: '',
    role: '',
    department: '',
    email: '',
    decision: '',
    reason: '',
  })

  useEffect(() => {
    if (!user) {
      setItems([])
      return
    }
    let active = true
    const load = async () => {
      try {
        const data = await withTimeout(
          kind === 'meetings'
            ? meetingRepository.getAll()
            : kind === 'decisions'
            ? decisionRepository.getAll()
            : kind === 'knowledge'
            ? knowledgeRepository.getAll()
            : teamRepository.getAll()
        )
        if (active) setItems(data)
      } catch {
        if (active) notify('This section took too long to load.')
      }
    }
    load()
    return () => {
      active = false
    }
  }, [kind, count, user?.id])

  const openNew = () => {
    if (!requireLogin()) return
    setOpen(true)
  }

  const save = async () => {
    if (!requireLogin()) return
    if (!form.title.trim()) {
      notify(`${kind === 'team' ? 'Name' : 'Title'} is required.`)
      return
    }
    try {
      if (kind === 'meetings')
        await withTimeout(
          meetingRepository.create({
            title: form.title.trim(),
            date: form.date,
            time: form.time,
            location: '',
            participants: [],
            agenda: form.content.trim(),
            decisions: [],
            actionItems: [],
          })
        )
      if (kind === 'decisions')
        await withTimeout(
          decisionRepository.create({
            title: form.title.trim(),
            description: form.content.trim(),
            decision: form.decision.trim(),
            reason: form.reason.trim(),
            date: form.date,
          })
        )
      if (kind === 'knowledge')
        await withTimeout(
          knowledgeRepository.create({
            title: form.title.trim(),
            content: form.content.trim(),
            category: form.category,
            tags: [],
          })
        )
      if (kind === 'team')
        await withTimeout(
          teamRepository.create({
            name: form.title.trim(),
            role: form.role.trim(),
            department: form.department.trim(),
            email: form.email.trim(),
          })
        )
      setOpen(false)
      setForm({
        title: '',
        content: '',
        date: today(),
        time: '',
        category: '',
        role: '',
        department: '',
        email: '',
        decision: '',
        reason: '',
      })
      await onRefresh()
      notify(`${title.slice(0, -1)} created`)
    } catch {
      notify(`Could not create the ${title.slice(0, -1).toLowerCase()}. Please try again.`)
    }
  }

  const remove = async (item: any) => {
    if (!requireLogin()) return
    if (!window.confirm(`Delete ${item.title || item.name}? This action cannot be undone.`)) return
    try {
      if (kind === 'meetings') await withTimeout(meetingRepository.delete(item.id))
      if (kind === 'decisions') await withTimeout(decisionRepository.delete(item.id))
      if (kind === 'knowledge') await withTimeout(knowledgeRepository.delete(item.id))
      if (kind === 'team') await withTimeout(teamRepository.delete(item.id))
      await onRefresh()
      notify('Item deleted')
    } catch {
      notify('Could not delete this item. Please try again.')
    }
  }

  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <div className={styles.eyebrow}>{eyebrow}</div>
          <Title1>{title}</Title1>
          <Body1 className={styles.muted}>{description}</Body1>
        </div>
        <Button appearance="primary" icon={<Add24Regular />} onClick={openNew}>
          New {title.slice(0, -1).toLowerCase()}
        </Button>
      </div>

      <Card className={styles.sectionCard}>
        {items.length === 0 ? (
          <EmptyState
            icon={icon}
            title={`No ${title.toLowerCase()} yet`}
            description={`Create your first ${title.slice(0, -1).toLowerCase()} to keep your workspace current.`}
            action={
              <Button appearance="secondary" onClick={openNew}>Create one</Button>
            }
          />
        ) : (
          <div className={styles.list}>
            {items.map((item) => (
              <div className={styles.listItem} key={item.id}>
                <div className={styles.listCopy}>
                  <Subtitle2>{item.title || item.name}</Subtitle2>
                  <Caption1 className={styles.muted}>
                    {item.date ? format(new Date(`${item.date}T12:00:00`), 'MMM d, yyyy') : item.role || item.category}
                  </Caption1>
                  <Body1>
                    {item.content || item.description || item.decision || item.department || 'No additional details added.'}
                  </Body1>
                </div>
                <Button
                  appearance="subtle"
                  icon={<Delete24Regular />}
                  aria-label={`Delete ${item.title || item.name}`}
                  onClick={() => remove(item)}
                />
              </div>
            ))}
          </div>
        )}
      </Card>

      <Dialog open={open} onOpenChange={(_, d) => setOpen(d.open)}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>New {title.slice(0, -1).toLowerCase()}</DialogTitle>
            <DialogContent>
              <div className={styles.formGrid}>
                <Field label={kind === 'team' ? 'Name' : 'Title'} required className={styles.full}>
                  <Input value={form.title} onChange={(_, d) => setForm({ ...form, title: d.value })} />
                </Field>
                {kind === 'team' ? (
                  <>
                    <Field label="Role">
                      <Input value={form.role} onChange={(_, d) => setForm({ ...form, role: d.value })} />
                    </Field>
                    <Field label="Department">
                      <Input value={form.department} onChange={(_, d) => setForm({ ...form, department: d.value })} />
                    </Field>
                    <Field label="Email" className={styles.full}>
                      <Input type="email" value={form.email} onChange={(_, d) => setForm({ ...form, email: d.value })} />
                    </Field>
                  </>
                ) : (
                  <>
                    <Field label="Date">
                      <Input type="date" value={form.date} onChange={(_, d) => setForm({ ...form, date: d.value })} />
                    </Field>
                    {kind === 'meetings' && (
                      <Field label="Time">
                        <Input type="time" value={form.time} onChange={(_, d) => setForm({ ...form, time: d.value })} />
                      </Field>
                    )}
                    {kind === 'knowledge' && (
                      <Field label="Category">
                        <Select value={form.category} onChange={(_, d) => setForm({ ...form, category: d.value })}>
                          <option value="Process">Process</option>
                          <option value="Product">Product</option>
                          <option value="Engineering">Engineering</option>
                          <option value="People">People</option>
                        </Select>
                      </Field>
                    )}
                    <Field
                      label={
                        kind === 'decisions' ? 'Context' : kind === 'knowledge' ? 'Content' : 'Agenda'
                      }
                      className={styles.full}
                    >
                      <Textarea rows={5} value={form.content} onChange={(_, d) => setForm({ ...form, content: d.value })} />
                    </Field>
                    {kind === 'decisions' && (
                      <>
                        <Field label="Decision" className={styles.full}>
                          <Textarea rows={3} value={form.decision} onChange={(_, d) => setForm({ ...form, decision: d.value })} />
                        </Field>
                        <Field label="Reason" className={styles.full}>
                          <Textarea rows={3} value={form.reason} onChange={(_, d) => setForm({ ...form, reason: d.value })} />
                        </Field>
                      </>
                    )}
                  </>
                )}
              </div>
            </DialogContent>
            <DialogActions>
              <Button appearance="secondary" onClick={() => setOpen(false)}>Cancel</Button>
              <Button
                appearance="primary"
                onClick={save}
                disabled={kind !== 'team' && !form.title.trim()}
              >
                Create
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </>
  )
}

function SettingsView({
  notify,
  profile,
  onProfileRefresh,
  user,
}: {
  notify: (message: string) => void
  profile: UserProfile | null
  onProfileRefresh: () => void
  user: any
}) {
  const styles = useStyles()
  const supabase = getSupabase()
  const [editOpen, setEditOpen] = useState(false)
  const [pwdOpen, setPwdOpen] = useState(false)
  const [name, setName] = useState('')
  const [role, setRole] = useState('Product')
  const [saving, setSaving] = useState(false)
  const [newPwd, setNewPwd] = useState('')
  const [confirmPwd, setConfirmPwd] = useState('')

  useEffect(() => {
    if (profile) {
      setName(profile.name)
      setRole(profile.role || 'Product')
    }
  }, [profile])

  const saveProfile = async () => {
    setSaving(true)
    try {
      await profileRepository.update({ name: name.trim(), role })
      await onProfileRefresh()
      setEditOpen(false)
      notify('Profile updated')
    } catch {
      notify('Could not update profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const changePassword = async () => {
    if (newPwd.length < 6) {
      notify('Password must be at least 6 characters.')
      return
    }
    if (newPwd !== confirmPwd) {
      notify('Passwords do not match.')
      return
    }
    setSaving(true)
    const { error } = await supabase.auth.updateUser({ password: newPwd })
    setSaving(false)
    if (error) {
      notify(error.message)
    } else {
      setPwdOpen(false)
      setNewPwd('')
      setConfirmPwd('')
      notify('Password updated')
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  if (!user) {
    return (
      <>
        <div className={styles.pageHeader}>
          <div>
            <div className={styles.eyebrow}>Account</div>
            <Title1>Settings</Title1>
            <Body1 className={styles.muted}>
              Please sign in to manage your profile and account preferences.
            </Body1>
          </div>
        </div>
        <Card className={styles.sectionCard}>
          <EmptyState
            icon={<PersonCircle24Regular />}
            title="Sign in required"
            description="You need to be signed in to access your account settings."
            action={
              <Button
                appearance="primary"
                onClick={() => {
                  window.location.href = '/login'
                }}
              >
                Sign in
              </Button>
            }
          />
        </Card>
      </>
    )
  }

  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <div className={styles.eyebrow}>Account</div>
          <Title1>Settings</Title1>
          <Body1 className={styles.muted}>Manage your profile and account preferences.</Body1>
        </div>
      </div>

      <div className={styles.twoCol}>
        <Card className={styles.sectionCard}>
          <CardHeader
            header={<Title3>Profile</Title3>}
            description="Information visible to your team"
          />
          <div className={styles.sectionBlock}>
            <div className={styles.profileRow}>
              <div className={styles.profileAvatarLarge}>
                {profile?.avatarUrl ? (
                  <img src={profile.avatarUrl} alt="" className={styles.profileAvatarImg} />
                ) : (
                  <PersonCircle24Regular fontSize={40} />
                )}
              </div>
              <div className={styles.listCopy}>
                <Subtitle2>{profile?.name ?? '—'}</Subtitle2>
                <Caption1 className={styles.muted}>{profile?.email ?? '—'}</Caption1>
                <Caption1 className={styles.muted}>Role: {profile?.role ?? 'Product'}</Caption1>
              </div>
            </div>
            <div className={styles.toolbar}>
              <Button
                appearance="primary"
                icon={<Edit24Regular />}
                onClick={() => {
                  setName(profile?.name ?? '')
                  setRole(profile?.role ?? 'Product')
                  setEditOpen(true)
                }}
              >
                Edit profile
              </Button>
              <Button
                appearance="secondary"
                icon={<Key24Regular />}
                onClick={() => setPwdOpen(true)}
              >
                Change password
              </Button>
              <Button
                appearance="subtle"
                icon={<SignOut24Regular />}
                onClick={handleLogout}
              >
                Sign out
              </Button>
            </div>
          </div>
        </Card>

        <Card className={styles.sectionCard}>
          <CardHeader
            header={<Title3>Account</Title3>}
            description="Details about your Work Journal account"
          />
          <div className={styles.list}>
            <div className={styles.listItem}>
              <div className={styles.listCopy}>
                <Caption1 className={styles.muted}>Email</Caption1>
                <Body1>{profile?.email ?? '—'}</Body1>
              </div>
            </div>
            <div className={styles.listItem}>
              <div className={styles.listCopy}>
                <Caption1 className={styles.muted}>Role</Caption1>
                <Body1>{profile?.role ?? 'Product'}</Body1>
              </div>
            </div>
            <div className={styles.listItem}>
              <div className={styles.listCopy}>
                <Caption1 className={styles.muted}>Storage</Caption1>
                <Body1>Cloud (Supabase)</Body1>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Dialog open={editOpen} onOpenChange={(_, d) => setEditOpen(d.open)}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>Edit profile</DialogTitle>
            <DialogContent>
              <div className={styles.formGrid}>
                <Field label="Name" required className={styles.full}>
                  <Input value={name} onChange={(_, d) => setName(d.value)} />
                </Field>
                <Field label="Role" className={styles.full}>
                  <Select value={role} onChange={(_, d) => setRole(d.value)}>
                    {ROLE_OPTIONS.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </Select>
                </Field>
              </div>
            </DialogContent>
            <DialogActions>
              <Button appearance="secondary" onClick={() => setEditOpen(false)}>Cancel</Button>
              <Button appearance="primary" onClick={saveProfile} disabled={saving || !name.trim()}>
                {saving ? 'Saving…' : 'Save'}
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>

      <Dialog open={pwdOpen} onOpenChange={(_, d) => setPwdOpen(d.open)}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>Change password</DialogTitle>
            <DialogContent>
              <div className={styles.formGrid}>
                <Field label="New password" required className={styles.full}>
                  <Input type="password" value={newPwd} onChange={(_, d) => setNewPwd(d.value)} />
                </Field>
                <Field label="Confirm password" required className={styles.full}>
                  <Input type="password" value={confirmPwd} onChange={(_, d) => setConfirmPwd(d.value)} />
                </Field>
              </div>
            </DialogContent>
            <DialogActions>
              <Button appearance="secondary" onClick={() => setPwdOpen(false)}>Cancel</Button>
              <Button appearance="primary" onClick={changePassword} disabled={saving}>
                {saving ? 'Updating…' : 'Update password'}
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </>
  )
}

export function WorkJournal() {
  const styles = useStyles()
  const menuRef = useRef<HTMLElement>(null)
  const { user, loading: authLoading } = useUser()
  const [view, setView] = useState<View>('dashboard')
  const [menuOpen, setMenuOpen] = useState(false)
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [counts, setCounts] = useState({ meetings: 0, decisions: 0, knowledge: 0, team: 0 })
  const [notice, setNotice] = useState('')
  const [search, setSearch] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [focusEntryId, setFocusEntryId] = useState<string | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)

  const requireLogin = (): boolean => {
    if (!user) {
      setShowLoginPrompt(true)
      return false
    }
    return true
  }

  const handleSetView = (nextView: View) => {
    setView(nextView)
  }

  const refresh = async () => {
    if (!user) {
      setEntries([])
      setProjects([])
      setCounts({ meetings: 0, decisions: 0, knowledge: 0, team: 0 })
      setProfile(null)
      return
    }
    setLoading(true)
    try {
      const [nextEntries, nextProjects, meetings, decisions, knowledge, team, nextProfile] =
        await withTimeout(
          Promise.all([
            journalRepository.getAll(),
            projectRepository.getAll(),
            meetingRepository.getAll(),
            decisionRepository.getAll(),
            knowledgeRepository.getAll(),
            teamRepository.getAll(),
            profileRepository.getMine().catch(() => null),
          ])
        )
      setEntries(nextEntries)
      setProjects(nextProjects)
      setCounts({
        meetings: meetings.length,
        decisions: decisions.length,
        knowledge: knowledge.length,
        team: team.length,
      })
      setProfile(nextProfile)
    } catch {
      notify('Workspace data could not be loaded. Please refresh and try again.')
    } finally {
      setLoading(false)
    }
  }

  const refreshProfile = async () => {
    if (!user) return
    try {
      const p = await profileRepository.getMine()
      setProfile(p)
    } catch {}
  }

  useEffect(() => {
    refresh()
  }, [user?.id])

  useEffect(() => {
    const timer = window.setTimeout(
      async () => setResults(search.trim() ? await globalSearch(search) : []),
      180
    )
    return () => window.clearTimeout(timer)
  }, [search])

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (menuOpen && menuRef.current && !menuRef.current.contains(event.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [menuOpen])

  useEffect(() => {
    const handle = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        document.querySelector<HTMLInputElement>('[data-global-search]')?.focus()
      }
    }
    window.addEventListener('keydown', handle)
    return () => window.removeEventListener('keydown', handle)
  }, [])

  const notify = (message: string) => {
    setNotice(message)
    window.setTimeout(() => setNotice(''), 3000)
  }

  const openEntryFromDashboard = (entry: JournalEntry) => {
    setFocusEntryId(entry.id)
    setView('journal')
  }

  const page =
    view === 'dashboard' ? (
      <Dashboard
        setView={handleSetView}
        entries={entries}
        projects={projects}
        meetings={Array.from({ length: counts.meetings })}
        decisions={Array.from({ length: counts.decisions })}
        knowledge={Array.from({ length: counts.knowledge })}
        team={Array.from({ length: counts.team })}
        onOpenEntry={openEntryFromDashboard}
      />
    ) : view === 'journal' ? (
      <JournalView
        entries={entries}
        projects={projects}
        onRefresh={refresh}
        notify={notify}
        focusEntryId={focusEntryId}
        onFocusHandled={() => setFocusEntryId(null)}
        requireLogin={requireLogin}
      />
    ) : view === 'projects' ? (
      <ProjectsView
        projects={projects}
        onRefresh={refresh}
        notify={notify}
        requireLogin={requireLogin}
      />
    ) : view === 'meetings' ? (
      <CollectionView
        title="Meetings"
        eyebrow="Shared context"
        description="Turn conversations into clear follow-through."
        icon={<CalendarLtr24Regular />}
        count={counts.meetings}
        onRefresh={refresh}
        notify={notify}
        kind="meetings"
        user={user}
        requireLogin={requireLogin}
      />
    ) : view === 'decisions' ? (
      <CollectionView
        title="Decisions"
        eyebrow="Decision log"
        description="Preserve the why behind important choices."
        icon={<TargetArrow24Regular />}
        count={counts.decisions}
        onRefresh={refresh}
        notify={notify}
        kind="decisions"
        user={user}
        requireLogin={requireLogin}
      />
    ) : view === 'knowledge' ? (
      <CollectionView
        title="Knowledge"
        eyebrow="Team memory"
        description="Make useful context easy to find and reuse."
        icon={<Book24Regular />}
        count={counts.knowledge}
        onRefresh={refresh}
        notify={notify}
        kind="knowledge"
        user={user}
        requireLogin={requireLogin}
      />
    ) : view === 'team' ? (
      <CollectionView
        title="Team"
        eyebrow="People directory"
        description="Know who is working on what, and why."
        icon={<People24Regular />}
        count={counts.team}
        onRefresh={refresh}
        notify={notify}
        kind="team"
        user={user}
        requireLogin={requireLogin}
      />
    ) : view === 'reports' ? (
      <>
        <div className={styles.pageHeader}>
          <div>
            <div className={styles.eyebrow}>Signals</div>
            <Title1>Reports</Title1>
            <Body1 className={styles.muted}>Understand the rhythm of your work journal.</Body1>
          </div>
        </div>
        <Card className={styles.sectionCard}>
          <EmptyState
            icon={<ClipboardTask24Regular />}
            title="Reports will appear as data grows"
            description="Add entries, projects, and decisions to unlock activity insights."
          />
        </Card>
      </>
    ) : (
      <SettingsView
        notify={notify}
        profile={profile}
        onProfileRefresh={refreshProfile}
        user={user}
      />
    )

  if (authLoading || (loading && user)) {
    return (
      <div className={styles.shell} style={{ display: 'grid', placeItems: 'center' }}>
        <Spinner label="Loading your workspace" />
      </div>
    )
  }

  return (
    <div className={styles.shell} style={{ display: 'flex' }}>
      <AppSidebar view={view} setView={handleSetView} />
      <main className={styles.main}>
        <header className={styles.topbar}>
          <div className={styles.mobileNav} ref={menuRef}>
            <div className={styles.mobileTopRow}>
              <ProfileMenu user={user} profile={profile} />
              <div className={mergeClasses(styles.searchWrap, styles.mobileSearch)}>
                <Input
                  data-global-search
                  contentBefore={<Search24Regular />}
                  className={styles.search}
                  placeholder="Search everything  ⌘K"
                  value={search}
                  onChange={(_, d) => setSearch(d.value)}
                />
              </div>
              <Button
                className={styles.mobileMenuButton}
                appearance="subtle"
                icon={<TaskListSquareLtr24Regular />}
                aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
                onClick={() => setMenuOpen((open) => !open)}
              />
            </div>
            {menuOpen && (
              <nav className={styles.mobileMenu} aria-label="Mobile navigation">
                {[
                  ...navItems,
                  { id: 'settings' as View, label: 'Settings', icon: <Settings24Regular /> },
                ].map((item) => (
                  <Button
                    key={item.id}
                    appearance={view === item.id ? 'primary' : 'subtle'}
                    icon={item.icon}
                    className={styles.navButton}
                    onClick={() => {
                      setView(item.id)
                      setMenuOpen(false)
                    }}
                  >
                    {item.label}
                  </Button>
                ))}
              </nav>
            )}
          </div>
          <div className={styles.desktopRight}>
            <div className={mergeClasses(styles.searchWrap, styles.desktopSearch)}>
              <Input
                data-global-search
                contentBefore={<Search24Regular />}
                className={styles.search}
                placeholder="Search everything  ⌘K"
                value={search}
                onChange={(_, d) => setSearch(d.value)}
              />
              {results.length > 0 && (
                <div className={styles.resultPanel}>
                  {results.slice(0, 6).map((result) => (
                    <Button
                      key={`${result.type}-${result.id}`}
                      appearance="subtle"
                      style={{ width: '100%', justifyContent: 'flex-start' }}
                      onClick={() => {
                        setView(
                          result.type === 'journal'
                            ? 'journal'
                            : result.type === 'project'
                            ? 'projects'
                            : result.type === 'meeting'
                            ? 'meetings'
                            : result.type === 'decision'
                            ? 'decisions'
                            : result.type === 'knowledge'
                            ? 'knowledge'
                            : 'team'
                        )
                        setSearch('')
                      }}
                    >
                      {result.title}
                      <Caption1 style={{ marginLeft: 'auto' }}>{result.type}</Caption1>
                    </Button>
                  ))}
                </div>
              )}
            </div>
            <ProfileMenu user={user} profile={profile} />
          </div>
        </header>
        <div className={styles.content}>
          {notice && (
            <MessageBar
              intent="success"
              icon={<CheckmarkCircle24Regular />}
              onDismiss={() => setNotice('')}
              style={{ marginBottom: tokens.spacingVerticalL }}
            >
              {notice}
            </MessageBar>
          )}
          {page}
        </div>
      </main>

      <Dialog
        open={showLoginPrompt}
        onOpenChange={(_, d) => setShowLoginPrompt(d.open)}
      >
        <DialogSurface>
          <DialogBody>
            <DialogTitle>Sign in required</DialogTitle>
            <DialogContent>
              <Body1>
                You need to sign in to perform this action. Would you like to sign in
                now?
              </Body1>
            </DialogContent>
            <DialogActions>
              <Button
                appearance="secondary"
                onClick={() => setShowLoginPrompt(false)}
              >
                Cancel
              </Button>
              <Button
                appearance="primary"
                onClick={() => {
                  window.location.href = '/login'
                }}
              >
                Sign in
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </div>
  )
}

export function _UnusedIcons() {
  return (
    <>
      <Dismiss24Regular />
      <ErrorCircle24Regular />
      <TaskListSquareLtr24Regular />
    </>
  )
}

export default WorkJournal
