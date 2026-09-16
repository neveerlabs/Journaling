import { WorkJournal } from '@/components/work-journal'

export default function Home() {
  return <WorkJournal />
}

async function generateMetadata() {
  return {
    title: 'Work Journal | Organizational Memory',
    description: 'Capture work, preserve decisions, and make team knowledge reusable.',
  }
}

export { generateMetadata }
