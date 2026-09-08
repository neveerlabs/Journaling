'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  BookOpen, Check, ChevronRight, CircleHelp, Flame, Home, Menu, Moon, PenLine,
  Search, Settings, Sparkles, Trophy, UserRound, WandSparkles, X,
} from 'lucide-react'
import { deleteEntry, getEntries, saveEntry, type JournalEntry, type Mood } from '@/lib/journal-db'

type Page = 'home' | 'journal' | 'history' | 'progress' | 'achievements' | 'profile'
const moods: { name: Mood; color: string; face: string }[] = [
  { name: 'Calm', color: '#dceee9', face: '◡' }, { name: 'Happy', color: '#ffe4c7', face: '⌣' },
  { name: 'Thoughtful', color: '#e5defa', face: '·' }, { name: 'Reflective', color: '#dce6f7', face: '◠' },
  { name: 'Energized', color: '#ffd9df', face: '✦' },
]
const navItems: { id: Page; label: string; icon: typeof Home }[] = [
  { id: 'home', label: 'Home', icon: Home }, { id: 'journal', label: 'Journal', icon: PenLine },
  { id: 'history', label: 'History', icon: BookOpen }, { id: 'progress', label: 'Progress', icon: Flame },
  { id: 'achievements', label: 'Achievements', icon: Trophy },
]

function wordCount(body: string) { return body.trim() ? body.trim().split(/\s+/).length : 0 }
function formatDate(value: string) { return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value)) }
function ProgressBar({ value }: { value: number }) { return <div className="progress-track"><div className="progress-fill" style={{ width: `${Math.min(100, value)}%` }} /></div> }
function Stat({ icon: Icon, label, value }: { icon: typeof Flame; label: string; value: string }) { return <div className="stat-card"><div className="stat-icon lavender"><Icon size={17} /></div><div><p className="eyebrow">{label}</p><p className="stat-value">{value}</p></div></div> }

export default function Page() {
  const [page, setPage] = useState<Page>('home')
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [editing, setEditing] = useState<JournalEntry | null>(null)
  const [query, setQuery] = useState('')
  const [dark, setDark] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [notice, setNotice] = useState('')

  const loadEntries = async () => {
    try { setEntries(await getEntries()); setError('') }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Gagal memuat jurnal.') }
    finally { setLoading(false) }
  }
  useEffect(() => { void loadEntries() }, [])
  const showNotice = (message: string) => {
    setNotice(message)
    window.setTimeout(() => setNotice(''), 3500)
  }
  const go = (next: Page) => { setPage(next); setEditing(null); setMobileMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  const openNew = () => { setEditing(null); setMobileMenuOpen(false); setPage('journal') }
  const openEdit = (entry: JournalEntry) => { setEditing(entry); setMobileMenuOpen(false); setPage('journal') }
  const remove = async (id: string) => {
    if (!window.confirm('Hapus jurnal ini? Tindakan ini tidak dapat dibatalkan.')) return
    try { await deleteEntry(id); await loadEntries() }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Gagal menghapus jurnal.') }
  }
  const filtered = useMemo(() => entries.filter((entry) => `${entry.title} ${entry.body} ${entry.tags.join(' ')}`.toLowerCase().includes(query.toLowerCase())), [entries, query])

  return <div className={dark ? 'app dark-mode' : 'app'}>
    <aside className="sidebar"><Brand /><div className="profile-mini"><div className="avatar">N</div><div><strong>New member</strong><span>{entries.length} journal{entries.length === 1 ? '' : 's'}</span></div></div><nav className="nav-list" aria-label="Main navigation">{navItems.map(({ id, label, icon: Icon }) => <button key={id} className={page === id ? 'nav-item active' : 'nav-item'} onClick={() => go(id)}><Icon size={18} /><span>{label}</span></button>)}</nav><div className="sidebar-bottom"><button className="nav-item" onClick={() => go('profile')}><Settings size={18} /><span>Settings</span></button><button className="nav-item" onClick={() => setDark(!dark)}><Moon size={18} /><span>{dark ? 'Light mode' : 'Dark mode'}</span></button><div className="sidebar-tip"><Sparkles size={17} /><p><strong>Small steps count.</strong><br />Start with one honest line.</p></div></div></aside>
    <div className="mobile-top"><Brand /><button className="icon-button" aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>{mobileMenuOpen ? <X size={21} /> : <Menu size={21} />}</button></div>
    {mobileMenuOpen && <div className="mobile-menu-panel"><nav aria-label="Mobile menu">{[...navItems, { id: 'profile' as Page, label: 'Settings', icon: Settings }].map(({ id, label, icon: Icon }) => <button key={id} className={page === id ? 'nav-item active' : 'nav-item'} onClick={() => go(id)}><Icon size={18} /><span>{label}</span></button>)}</nav></div>}
    <main className="main-content">{(error || notice) && <div className={error ? 'error-banner' : 'notice-banner'} role="status">{error || notice}</div>}{page === 'home' && <HomePage entries={entries} loading={loading} go={go} openNew={openNew} onHelp={() => showNotice('Memento menyimpan jurnal secara lokal di browser ini menggunakan IndexedDB.')} />}{page === 'journal' && <JournalPage entry={editing} onCancel={() => go('home')} onError={setError} onSaved={async () => { await loadEntries(); go('history') }} />}{page === 'history' && <HistoryPage entries={filtered} query={query} setQuery={setQuery} openNew={openNew} openEdit={openEdit} remove={remove} />}{page === 'progress' && <ProgressPage entries={entries} />}{page === 'achievements' && <AchievementsPage entries={entries} />}{page === 'profile' && <ProfilePage dark={dark} setDark={setDark} entries={entries} />}</main>
    <nav className="mobile-nav" aria-label="Mobile navigation">{[...navItems.slice(0, 4), { id: 'profile' as Page, label: 'Profile', icon: UserRound }].map(({ id, label, icon: Icon }) => <button key={id} className={page === id ? 'mobile-nav-item active' : 'mobile-nav-item'} onClick={() => go(id)}><Icon size={19} /><span>{label}</span></button>)}</nav>
  </div>
}

function Brand() { return <div className="brand"><div className="brand-mark"><WandSparkles size={18} /></div><span>memento</span></div> }
function Header({ eyebrow, title, description, action }: { eyebrow: string; title: string; description?: string; action?: React.ReactNode }) { return <header className="page-header"><div><p className="eyebrow purple">{eyebrow}</p><h1>{title}</h1>{description && <p className="header-description">{description}</p>}</div>{action}</header> }
function EmptyState({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) { return <div className="empty-state"><BookOpen size={25} /><h3>{title}</h3><p>{description}</p>{action}</div> }

function HomePage({ entries, loading, go, openNew, onHelp }: { entries: JournalEntry[]; loading: boolean; go: (page: Page) => void; openNew: () => void; onHelp: () => void }) {
  const latest = entries.slice(0, 3)
  return <><Header eyebrow="YOUR PRIVATE SPACE" title="Welcome to memento." description="A gentle place to pause, reflect, and keep your thoughts close." action={<button className="round-help" aria-label="Help" onClick={onHelp}><CircleHelp size={19} /></button>} /><section className="welcome-card"><div><p className="card-kicker">A FRESH START</p><h2>Your journal is ready.</h2><p>Everything you write stays in this browser using IndexedDB.</p><button className="primary-button" onClick={openNew}>Write your first journal <ChevronRight size={16} /></button></div><div className="welcome-icon"><PenLine size={36} /></div></section><section className="section-heading"><div><p className="eyebrow purple">YOUR JOURNEY</p><h2>{entries.length ? 'Recent journals' : 'Your first entry starts here'}</h2></div>{entries.length > 0 && <button className="text-button" onClick={() => go('history')}>View all <ChevronRight size={15} /></button>}</section>{loading ? <div className="loading-state">Loading your journals...</div> : latest.length ? <div className="journal-grid">{latest.map((entry) => <EntryCard key={entry.id} entry={entry} />)}</div> : <EmptyState title="No journals yet" description="Write something small today. There is no wrong way to begin." action={<button className="secondary-button" onClick={openNew}>Create entry</button>} />}<section className="section-heading stats-heading"><div><p className="eyebrow purple">AT A GLANCE</p><h2>Your little wins</h2></div></section><div className="stats-grid"><Stat icon={BookOpen} label="Total journals" value={`${entries.length}`} /><Stat icon={Flame} label="Longest streak" value={entries.length ? '1 day' : '0 days'} /><Stat icon={Trophy} label="Achievements" value={`${entries.length ? 1 : 0} / 8`} /></div></>
}

function EntryCard({ entry, onEdit, onDelete }: { entry: JournalEntry; onEdit?: (entry: JournalEntry) => void; onDelete?: (id: string) => void }) { return <article className="entry-card"><div className="entry-date"><span>{formatDate(entry.updatedAt)}</span><span className="mood-pill">{entry.mood}</span></div><h3>{entry.title || 'Untitled journal'}</h3><p>{entry.body.slice(0, 150)}{entry.body.length > 150 ? '...' : ''}</p><div className="entry-footer"><div className="tag-list">{entry.tags.map((tag) => <span key={tag}>#{tag}</span>)}</div><span className="word-count">{wordCount(entry.body)} words</span></div>{onEdit && onDelete && <div className="entry-actions"><button className="text-button" onClick={() => onEdit(entry)}>Edit</button><button className="delete-button" onClick={() => onDelete(entry.id)}>Delete</button></div>}</article> }

function JournalPage({ entry, onCancel, onError, onSaved }: { entry: JournalEntry | null; onCancel: () => void; onError: (message: string) => void; onSaved: () => Promise<void> }) {
  const [title, setTitle] = useState(entry?.title ?? '')
  const [body, setBody] = useState(entry?.body ?? '')
  const [mood, setMood] = useState<Mood>(entry?.mood ?? 'Calm')
  const [tags, setTags] = useState(entry?.tags.join(', ') ?? '')
  const [saving, setSaving] = useState(false)
  const submit = async () => {
    if (!body.trim() || saving) return
    setSaving(true)
    try {
      const now = new Date().toISOString()
      await saveEntry({ id: entry?.id ?? crypto.randomUUID(), title: title.trim(), body: body.trim(), mood, tags: tags.split(',').map((tag) => tag.trim().replace(/^#/, '')).filter(Boolean), createdAt: entry?.createdAt ?? now, updatedAt: now })
      await onSaved()
    } catch (cause) {
      onError(cause instanceof Error ? cause.message : 'Gagal menyimpan jurnal.')
    } finally {
      setSaving(false)
    }
  }
  return <div className="editor-page"><Header eyebrow={entry ? 'EDIT JOURNAL' : 'NEW JOURNAL'} title={entry ? 'Shape your thoughts.' : 'A moment for you.'} description="There is no right way to journal. Just start where you are." /><div className="editor-layout"><div className="editor-main"><div className="editor-date"><span className="date-dot" /> {formatDate(new Date().toISOString())}</div><input className="title-input" placeholder="Give your day a title..." value={title} onChange={(e) => setTitle(e.target.value)} aria-label="Journal title" /><textarea className="journal-textarea" placeholder="What's on your mind?" value={body} onChange={(e) => setBody(e.target.value)} aria-label="Journal entry" /><div className="editor-footer"><span>{wordCount(body)} words</span><span>{entry ? 'Editing saved entry' : 'Saved locally in IndexedDB'}</span></div></div><aside className="editor-aside"><div className="side-panel"><p className="card-kicker">HOW ARE YOU FEELING?</p><div className="mood-grid">{moods.map((item) => <button type="button" key={item.name} className={mood === item.name ? 'mood-option selected' : 'mood-option'} onClick={() => setMood(item.name)}><span style={{ backgroundColor: item.color }}>{item.face}</span><small>{item.name}</small></button>)}</div></div><div className="side-panel"><p className="card-kicker">TAGS</p><div className="tag-input"><span>#</span><input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="mindfulness, growth" aria-label="Tags" /></div></div><div className="editor-actions"><button className="secondary-button" onClick={onCancel}>Cancel</button><button className="primary-button" onClick={() => void submit()} disabled={!body.trim() || saving}>{saving ? 'Saving...' : entry ? 'Update journal' : 'Save journal'} <Sparkles size={15} /></button></div></aside></div></div>
}

function HistoryPage({ entries, query, setQuery, openNew, openEdit, remove }: { entries: JournalEntry[]; query: string; setQuery: (value: string) => void; openNew: () => void; openEdit: (entry: JournalEntry) => void; remove: (id: string) => Promise<void> }) { return <><Header eyebrow="YOUR REFLECTIONS" title="Journal history" description="A collection of the moments you chose to remember." action={<button className="primary-button" onClick={openNew}>New journal <PenLine size={15} /></button>} /><div className="history-toolbar"><div className="search-box"><Search size={18} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search your journals..." aria-label="Search journals" />{query && <button onClick={() => setQuery('')} aria-label="Clear search"><X size={15} /></button>}</div></div>{entries.length ? <div className="history-grid">{entries.map((entry) => <EntryCard key={entry.id} entry={entry} onEdit={openEdit} onDelete={(id) => void remove(id)} />)}</div> : <EmptyState title={query ? 'No journals found' : 'Your history is empty'} description={query ? 'Try a different search term.' : 'Create your first journal to see it here.'} action={!query && <button className="secondary-button" onClick={openNew}>Create entry</button>} />}</> }
function ProgressPage({ entries }: { entries: JournalEntry[] }) { return <><Header eyebrow="KEEP GOING" title="Your progress" description="Every entry is a step toward knowing yourself better." /><div className="progress-hero"><div><div className="level-badge large">1</div><div><p className="card-kicker">CURRENT LEVEL</p><h2>Beginner</h2><p className="muted-copy">{entries.length ? 'Keep going to reach Level 2' : 'Write your first journal to begin'}</p></div></div><div className="hero-xp"><strong>{entries.length} <span>/ 5 journals</span></strong><ProgressBar value={entries.length * 20} /></div></div><div className="stats-grid progress-stats"><Stat icon={Flame} label="Current streak" value={entries.length ? '1 day' : '0 days'} /><Stat icon={BookOpen} label="Total journals" value={`${entries.length}`} /><Stat icon={Trophy} label="Achievements" value={`${entries.length ? 1 : 0} / 8`} /></div></> }
function AchievementsPage({ entries }: { entries: JournalEntry[] }) { return <><Header eyebrow="MILESTONES" title="Achievements" description="Little reminders of how far you've come." /><div className="achievement-summary"><div className="trophy-big"><Trophy size={25} /></div><div><strong>{entries.length ? 1 : 0} of 8 unlocked</strong><p>{entries.length ? 'You wrote your first journal.' : 'Your first achievement is waiting.'}</p></div><ProgressBar value={entries.length ? 12.5 : 0} /></div><EmptyState title={entries.length ? 'Keep building your story' : 'No achievements yet'} description="More milestones will appear as you create journals." /></> }
function ProfilePage({ dark, setDark, entries }: { dark: boolean; setDark: (value: boolean) => void; entries: JournalEntry[] }) { return <><Header eyebrow="YOUR SPACE" title="Profile" description="Make memento feel like yours." /><div className="profile-hero"><div className="avatar large-avatar">N</div><div><h2>New member</h2><p className="muted-copy">Your data is stored only in this browser.</p><div className="profile-level"><span>{entries.length} JOURNALS</span><span>LOCAL DATA</span></div></div></div><div className="settings-card"><div className="section-heading compact"><div><p className="eyebrow purple">PREFERENCES</p><h2>Settings</h2></div></div><div className="setting-row"><div><strong>Appearance</strong><span>Choose how memento looks for you</span></div><button className="setting-select" onClick={() => setDark(!dark)}>{dark ? 'Dark' : 'Light'} <ChevronRight size={15} /></button></div></div></> }
