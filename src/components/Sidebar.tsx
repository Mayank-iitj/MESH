'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, Store, Shield, ArrowRightLeft, ShieldAlert, Settings, Key } from 'lucide-react'
import { toast } from 'sonner'

export default function Sidebar() {
  const pathname = usePathname()

  const links = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Agents', href: '/agents', icon: Users },
    { name: 'Marketplace', href: '/marketplace', icon: Store },
    { name: 'Policies', href: '/policies', icon: Shield },
    { name: 'Transactions', href: '/transactions', icon: ArrowRightLeft },
    { name: 'API Keys', href: '/apikeys', icon: Key },
    { name: 'Profile', href: '/profile', icon: Settings },
  ]

  return (
    <aside className="w-64 border-r border-border/50 bg-card/30 flex-col hidden md:flex">
      <div className="p-6 border-b border-border/50">
        <Link href="/dashboard" className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <Image src="/logo.png" alt="MESH" width={24} height={24} className="object-contain filter invert" unoptimized={true} />
          MESH
        </Link>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {links.map((link) => {
          const isActive = pathname === link.href
          const Icon = link.icon
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive 
                  ? 'text-blue-400 bg-blue-500/10' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {link.name}
            </Link>
          )
        })}
      </nav>
      <div className="p-4 border-t border-border/50">
        <button 
          onClick={() => toast.error('Emergency Protocol Activated: All Agents Frozen', {
            description: 'API keys revoked. Awaiting manual override.'
          })}
          className="w-full py-2 text-sm font-medium text-red-500 bg-red-500/10 hover:bg-red-500/20 rounded-md border border-red-500/20 transition-colors flex items-center justify-center gap-2"
        >
          <ShieldAlert className="w-4 h-4" />
          Freeze All Payments
        </button>
      </div>
    </aside>
  )
}
