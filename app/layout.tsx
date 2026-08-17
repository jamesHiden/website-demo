import type { Metadata } from 'next'
import { Vazirmatn } from 'next/font/google'
import './globals.css'

const vazirmatn = Vazirmatn({ subsets: ['arabic', 'latin'] })

export const metadata: Metadata = {
  title: 'کدال‌استاکس',
  description: 'صورت‌های مالی شرکت‌های بورسی، استانداردشده و قابل‌مقایسه — برگرفته از کدال.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fa" dir="rtl">
      <body className={vazirmatn.className}>{children}</body>
    </html>
  )
}
