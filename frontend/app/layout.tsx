import type { Metadata } from 'next'
import { Outfit } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';

const outfit = Outfit({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Interest.',
  description: 'Discover events, meet new people, and create unforgettable memories',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.className} font-sans antialiased`}>
        <AuthProvider>
          <ThemeProvider>
          {children}
          {/* <Analytics /> */}
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
