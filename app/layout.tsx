import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Jack Studio - Premium Luggage',
  description: 'Discover premium luggage crafted for the modern traveler',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-white text-jack-black antialiased">{children}</body>
    </html>
  )
}
