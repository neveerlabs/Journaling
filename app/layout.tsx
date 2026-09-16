import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './providers'

export const metadata: Metadata = {
  title: 'Work Journal | Organizational Memory',
  description:
    'Capture work, preserve decisions, and make team knowledge reusable.',
  icons: {
    icon: '/assets/logo.svg',
    shortcut: '/assets/logo.svg',
    apple: '/assets/logo.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}