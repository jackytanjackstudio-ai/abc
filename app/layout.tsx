import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ConsentBanner from '@/components/ConsentBanner'
import { BRAND } from '@/lib/catalog'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
  title: { default: `${BRAND} — Front-opening luggage, made yours`, template: `%s · ${BRAND}` },
  description: 'Front-opening suitcases printed with your choice of pattern and your name. Four series: LINE, JOURNEY, PATTERN, LIFESTYLE.',
  openGraph: { siteName: BRAND, type: 'website' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-paper focus:p-2">
          Skip to content
        </a>
        <Navbar />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
        <ConsentBanner />
      </body>
    </html>
  )
}
