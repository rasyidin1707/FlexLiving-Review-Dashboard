import './globals.css'
import type { Metadata } from 'next'
import { ReactQueryProvider } from '@/components/providers'

export const metadata: Metadata = {
  title: 'Flex Living – Reviews Dashboard',
  description: 'Manager dashboard for multi-channel property reviews',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-neutral-50 dark:bg-gray-950 text-foreground">
        <script
          dangerouslySetInnerHTML={{
            __html: `(() => { try {
              var root = document.documentElement;
              var pref = localStorage.getItem('theme') || 'system';
              var dark = pref === 'dark' || (pref === 'system' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
              if (dark) root.classList.add('dark'); else root.classList.remove('dark');
              root.setAttribute('data-theme-ready','true');
            } catch (e) { document.documentElement.setAttribute('data-theme-ready','true'); } })();`,
          }}
        />
        <ReactQueryProvider>
          <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">{children}</div>
        </ReactQueryProvider>
      </body>
    </html>
  )
}
