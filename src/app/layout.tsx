import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from "@/components/ui/toast"
const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'MESH | Financial Control Plane for AI Agents',
  description: 'Programmable financial agency for autonomous agents.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-background text-foreground min-h-screen flex`}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
