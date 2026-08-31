import Sidebar from '@/components/Sidebar'
import { Toaster } from 'sonner'
import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect('/login')
  }

  return (
    <div className="flex-1 flex w-full">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {children}
        <Toaster theme="dark" position="top-right" richColors />
      </main>
    </div>
  )
}
